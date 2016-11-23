import {
    ElementRef,
    Output,
    EventEmitter,
    AfterViewInit,
    OnDestroy,
} from '@angular/core';

import * as d3          from 'd3';
import { ChartService } from './chart-base.service';
import { Utility }      from './../shared/utility';
import { Subscription } from 'rxjs/Rx';
import {
    ChartAxisPosition,
    ChartBoundaryItem,
    ChartBaseModel,
} from './chart-base.model';
import {
    MIN_HEIGHT,
    MIN_HEIGHT_WITHOUT_AXIS,
    MIN_WIDTH,
    MIN_WIDTH_WITHOUT_AXIS,
} from './../../definations/const';



export class ChartBase implements AfterViewInit, OnDestroy {
    @Output() changed: EventEmitter<any> = new EventEmitter();

    protected data:             any;
    protected base:             ChartBaseModel;             // Global base
    protected groupedData:      any;                        // Separated data grouping by name
    protected groupAxisTarget:  string;                     // 'x' / 'y', normally 'x'
    protected dataSet:          Set<any> = new Set();       // Filter duplicate data
    protected tickLabelMap:     any;                        // Map the name or groupname of data with its value

    protected parentEl:         HTMLElement;
    protected canvas:           any;
    protected outerWidth:       number;
    protected innerWidth:       number;
    protected outerHeight:      number;
    protected innerHeight:      number;
    protected left:             number;
    protected bottom:           number;
    protected top:              number;
    protected margin:           ChartBoundaryItem;
    protected padding:          ChartBoundaryItem;
    protected paddingScale:     ChartBoundaryItem;          // Pixel to percentage

    protected axis              = { x: undefined, y: undefined };
    protected ticks             = { x: [], y: [] };         // Array of axis ticks
    protected domain            = { x: [], y: [] };         // Domain for data
    protected scale             = { x: undefined, y: undefined };
    protected step              = { x: 0, y: 0 };
    protected isStringLabel     = { x: false, y: false };

    protected isHorizontal:     boolean;
    protected need2GroupData:   boolean;

    protected nextTick:         Function = Utility.nextTick;

    private   subc:             Subscription;

    constructor(
        public    service:      ChartService<any>,
        protected elementRef:   ElementRef,
        protected styleName = '',
    ) {}

    ngAfterViewInit(): void {
        let el: HTMLElement = this.elementRef.nativeElement;
        this.parentEl       = el.parentElement;
        this.canvas         = d3.select(el)
            .append('svg')
            .attr('class', `chart ${this.styleName}`);
        this.getData();
    }

    ngOnDestroy(): void {
        if (this.subc) {
            this.subc.unsubscribe();
        }
    }

    getData(): void {
        this.subc = this.service.getData().subscribe( (rawData) => {
            this.data = Utility.clone(rawData);
            this.base = this.data.base;
            this.nextTick( () => this.render(this.data) );
        });
    }

    render(
        data,
        need2GroupData = false,
        isHorizontal   = false
    ): void {
        if (!data) {
            return;
        }

        this.isHorizontal   = isHorizontal;
        this.need2GroupData = need2GroupData;
        this.init(data);
    }

    /**
     *   Case not using d3's enter() / update() / exit() 
     */
    clearCanvas(): void {
        this.canvas.selectAll('*').remove();
    }

    /**
     *  (DEBUGING) Align data with axis line
     * 
     *  Shows both x & y if not passing 'target'
     * 
     */
    showGrid(target = ''): void {
        if (('' === target || 'x' === target) && this.axis.x) {
            this.axis.x.tickSize(-this.innerHeight);
        }
        if (('' === target || 'y' === target) && this.axis.y) {
            this.axis.y.tickSize(-this.innerWidth);
        }
    }

    /**
     *  (Optional) Emittable complete event 
     */
    checkAllEnd(transition, callback): void {
        let n = 0;
        transition
            .each( () => { ++n; } )
            .each('end', function () {
                if (!--n) {
                    callback.apply(this, arguments);
                }
            });
    }

    complete(): void {
        // console.log('completed');
        this.changed.emit({
            isCompleted: true
        });
    }


    /******************************************************
     * 
     *                    Protected
     * 
     ******************************************************/

    protected hasAxisStep(axis): boolean {
        return undefined !== axis && axis.ticks && axis.ticks.step;
    }
    protected isAxisHidden(axis): boolean {
        return undefined === axis || ChartAxisPosition.Hidden === axis.position;
    }
    protected isDomainFixed(axis): boolean {
        return undefined !== (axis.ticks && axis.ticks.domain);
    }
    protected hasAnimate(feature): boolean {
        return feature && undefined !== feature.animation;
    }


    protected init(data): void {
        this.tickLabelMap = {
            x: new Map(),
            y: new Map(),
        };
        this.initLayout(this.base);
        this.initScale(data.data);
        this.initAxis();
        this.checkData(data.data);

    }

    protected initScale(data): void {
        this.initRange();
        this.initDomain('x', data);
        this.initDomain('y', data);
    }

    /**
     *  Init variables for position
     */
    protected initLayout(base: ChartBaseModel): void {
        let isAxisHidden = {
            x: this.isAxisHidden(base.xAxis),
            y: this.isAxisHidden(base.yAxis),
        };

        let min = {
            h: isAxisHidden.x ? MIN_HEIGHT_WITHOUT_AXIS : MIN_HEIGHT,
            w: isAxisHidden.y ? MIN_WIDTH_WITHOUT_AXIS : MIN_WIDTH,
        };

        let parentEl = {
            w: Number(this.parentEl.clientWidth),
            h: Number(this.parentEl.clientHeight),
        };

        let left: number, bottom: number, top: number;
        let outerWidth: number, outerHeight: number;
        let innerWidth: number, innerHeight: number;

        let padding: ChartBoundaryItem;
        let margin:  ChartBoundaryItem;

        /// Define width & height of the whole SVG according to the parent element
        let isParentWider   = parentEl.w > min.w;
        let isParentHigher  = parentEl.h > min.h;
        let hasLegend       = undefined !== base.legends;

        outerWidth = isParentWider
            ? Number(this.parentEl.clientWidth)
            : min.w;

        outerHeight = isParentHigher
            ? Number(this.parentEl.clientHeight)
            : min.h;

        let marginParam = {
            str: base.margin,
            height: outerHeight,
            width: outerWidth,
        };
        margin = this.parseBoundary(marginParam);

        left = isAxisHidden.y
            ? margin.left
            : margin.left + Number(base.yAxis.width);

        bottom = isAxisHidden.x
            ? margin.bottom
            : margin.bottom + Number(base.xAxis.height);

        top = hasLegend
            ? Number(base.legends.height) + margin.top
            : margin.top;

        innerWidth  = outerWidth - left - margin.right;
        innerHeight = outerHeight - top - bottom;

        let paddingParam = {
            str:    base.padding,
            height: innerHeight,
            width:  innerWidth,
        };
        padding = this.parseBoundary(paddingParam);

        [
            this.outerWidth,
            this.outerHeight,
            this.innerWidth,
            this.innerHeight,
            this.margin,
            this.padding,
            this.left,
            this.bottom,
            this.top,
        ] = [
            outerWidth,
            outerHeight,
            innerWidth,
            innerHeight,
            margin,
            padding,
            left,
            bottom,
            top,
        ];

        this.paddingScale = {
            top: padding.top        / innerHeight,
            right: padding.right    / innerWidth,
            bottom: padding.bottom  / innerHeight,
            left: padding.left      / innerWidth,
        };

        // Append main canvas
        this.canvas.attr({
            width:  outerWidth,
            height: outerHeight
        });
    }

    protected initAxis(): void {
        if (this.hasAxisStep(this.base.xAxis) ||
            this.hasAxisStep(this.base.yAxis)) {
            this.setTickStep();
            this.showAxis();
        } else {
            /// TODO: ticks according to data
        }
    }

    protected showAxis(): void {
        if (!this.isAxisHidden(this.base.xAxis)) {
            this.renderAxisWithStep('x');
        }
        if (!this.isAxisHidden(this.base.yAxis)) {
            this.renderAxisWithStep('y');
        }
    }

    /// Init the dataSet and dataMap for showing string axis ticks and theme color
    protected checkData(data: Array<any>): void {
        data.forEach( (d) => {
            /***********************************************
                Uncomment this when need moving the whole 
                domain for axis to limit data in the range of canvas.
                ( Note: Raw data would be overwrited here! )
            //-----------------------------------------------

            // d.xData = this.limitDataBoundary('x', d.xData);
            // d.yData = this.limitDataBoundary('y', d.yData);

            ************************************************/

            this.checkStringLabel(d);

            /// Filter the duplicateㄝlater will map the theme colorㄝ
            let themeColorEntity = '' !== this.groupAxisTarget
                ? d[`${this.groupAxisTarget}Format`]
                : d.name;
            this.dataSet.add(themeColorEntity);

        });

        if (this.need2GroupData) {
            this.groupData(data);
        }

        // Sorting for right display in order for line-based charts
        // if (this.isDataNeed2Group) {
        //     for (let key in this.groupedData) {
        //         let arr = this.groupedData[key];
        //         arr = arr.sort( (a,b) => a[`${this.groupAxisTarget}Data`]-b[`${this.groupAxisTarget}Data`] )
        //     }
        // }
    }

    /**
     *  Replace the labels that has special format assigned
     */
    protected checkStringLabel(data): void {
        if (!this.isStringLabel.x && undefined !== data[`x-format`]) {
            this.isStringLabel.x = true;
        }
        if (!this.isStringLabel.y && undefined !== data[`y-format`]) {
            this.isStringLabel.y = true;
        }
        if (!this.groupAxisTarget) {
            this.groupAxisTarget = this.isStringLabel.x
                ? 'x'
                : this.isStringLabel.y
                    ? 'y'
                    : '';
        }

        if (data[`x-format`]) {
            this.tickLabelMap.x.set(data.xData, data.xFormat);
        }
        if (data[`y-format`]) {
            this.tickLabelMap.y.set(data.yData, data.yFormat);
        }
    }

    protected groupData(data: Array<any>): void {
        this.groupedData = {};
        data.forEach( (d) => {
            /// Group by name for line charts
            let groupingTarget = undefined !== d[`${this.groupAxisTarget}-format`]
                ? d[`${this.groupAxisTarget}-format`]
                : d.name;
            if (!this.groupedData[groupingTarget]) {
                this.groupedData[groupingTarget] = [];
            }
            this.groupedData[groupingTarget].push(d);
        });
    }

    protected renderAxisWithStep(target: string): void {
        let alteredTarget   = this.isHorizontal
            ? this.getComplementary(target)
            : target;
        let axisBase        = this.base[`${target}Axis`],
            alteredAxisBase = this.base[`${alteredTarget}Axis`];

        // Make a new d3 scale for axis copied from the scale of data
        let scale   = d3.scale.linear().domain(this.domain[target]);
        let params  = this.getPaddingParams(target, scale.domain());

        // Scale the domain for axis
        let domain  = this.scaleDomain.apply(null, params);
        let orient  = ChartAxisPosition[axisBase.position].toLowerCase();
        let range   = 'x' === target
            ? [this.left, this.innerWidth + this.left]
            : [this.innerHeight + this.top, this.top];
        let axisScale = scale
            .range(range)
            .domain(domain);
        this.axis[target] = d3.svg.axis()
            .scale(axisScale)
            .orient(orient);
        this.produceTickValues(target, alteredAxisBase);

        // Offset of axises
        let transform = 'y' === target
            ? `translate(${this.left}, ${0})`
            : `translate(${0}, ${this.innerHeight + this.top})`;
        let axisG = this.canvas.append('g')
            .attr({
                'class': `${target} axis`,
                'transform': transform
            });
        axisG.call(this.axis[target]);
    }

    // Make array for tick values displayed on the axis
    protected produceTickValues(target, base): void {
        let alteredTarget = this.isHorizontal
            ? this.getComplementary(target)
            : target;

        let [min, max] = this.domain[target];
        if (min > max) {
            [min, max] = [max, min];
        }
        this.ticks[target] = [min, max];

        // Produce the full tick array
        let i;
        for (i = min; i < max; i += base.ticks.step) {
            if (!this.ticks[target].includes(i)) { this.ticks[target].push(i); }
        }
        // Sort for correctly display grids
        this.ticks[target].sort( (a, b) => a - b );
        if (i > max) { this.ticks[target].length -= 1; }

        this.axis[target].tickValues(this.ticks[target]);

        // Change tick format if global format was defined
        let tickFormat = (d) => {
            let result = this.tickLabelMap[alteredTarget].get(d);
            if (undefined === result) {
                result = undefined !== base.format
                    ? this.replaceDate(base.format, d)
                    : d;
            }
            return result;
        };
        this.axis[target].tickFormat(tickFormat);
    }

    // Get the index to determine the theme color
    protected getThemeIndex(data: any): number {
        let name = this.isStringLabel[this.groupAxisTarget] ? data[`${this.groupAxisTarget}Format`] : data.name;
        return Array.from(this.dataSet).indexOf(name) + 1;
    }

    // Parse and replace the axis label, e.g. from {%m/%d} to 10/4
    protected replaceDate(format: string, timestamp: number): string {
        let regex   = /\{([^}]+)\}/gi,
            date    = new Date(timestamp);
        return format.replace(regex, (str, target) =>
            this.removeFirstZero(d3.time.format.utc(target)(date)));
    }

    // Parse the css syntax for setting margin & padding, e.g. margin: '10% 6px 20'
    protected parseBoundary({str, height, width}): ChartBoundaryItem {
        if (!str || ['0', '0%'].includes(str)) {
            return { top: 0, right: 0, bottom: 0, left: 0 };
        };

        let [top, right, bottom, left] = [0, 0, 0, 0];
        let result: number[]           = [top, right, bottom, left];
        let regex                      = /(\d+)(px|%)?/g;
        let arr: number[]              = []; // Store the calculated value of top/right/bottom/left

        /// Parse the numbers and convert the percentage to pixel
        let tmp;
        for (let i = 0; i < 4; ++i) {
            /// Match no result
            if (null === (tmp = regex.exec(str))) {
                break;
            }

            let value   = Number(tmp[1]);
            let isPixel = '%' !== tmp[2];

            /// Size check
            if (isPixel && value >= Math.max(this.outerHeight, this.outerWidth) ||
                !isPixel && value >= 50) {
                throw `Can't assign padding or margin beyond the canvas size`;
            }

            if (!isPixel) {
                /// [top, right, bottom, left] => even represents height
                let isCountingHeight = i % 2 === 0;
                let target = isCountingHeight
                    ? height
                    : width;
                value = target * value / 100; // Percentage to pixel
            }
            arr[i] = value;
        }

        if (arr.length > 0) {
            result[0] = arr[0];
            result[1] = undefined !== arr[1]
                ? arr[1]
                : arr[0];
            result[2] = undefined !== arr[2]
                ? arr[2]
                : arr[0];
            result[3] = undefined !== arr[3]
                ? arr[3]
                : result[1];
        }
        return {
            top:    result[0],
            right:  result[1],
            bottom: result[2],
            left:   result[3],
        };
    }

    // Parameters for calling scaling functions
    protected getPaddingParams(target: string, ...data): Array<any> {
        return target === 'x' ?
            [...data, this.paddingScale.left, this.paddingScale.right]
            :
            [...data, this.paddingScale.bottom, this.paddingScale.top];
    }

    // Add padding by scaling domain
    protected scaleDomain(arr: [any, any], minScale = 0, maxScale = 0): [any, any] {
        let diff       = arr[1] - arr[0] || arr[0],
            //            ref        = (1 + minScale + maxScale),
            ref        = (1 - minScale - maxScale),
            scaledDiff = diff / ref;
        if (minScale) { arr[0] -= scaledDiff * minScale; }
        if (maxScale) { arr[1] += scaledDiff * maxScale; }

        return arr;
    }



    // -------------          Private              -------------


    private setTickStep(): void {
        this.setStepTarget('x');
        this.setStepTarget('y');
        this.step.x = this.base.xAxis.ticks.step;
        this.step.y = this.base.yAxis.ticks.step;
    }

    private setStepTarget(target: string): void {
        let baseTarget = this.isHorizontal
            ? this.getComplementary(target)
            : target;
        this.step[target] = this.base[`${baseTarget}Axis`].ticks.step;
    }

    // Range: range of scaled data on canvas
    private initRange(): void {
        // let target = this.isHorizontal ? ['y', 'x'] : ['x', 'y'];
        // this.scale[target[0]] = d3.scale.linear().range([this.left, this.innerWidth + this.left]),
        // this.scale[target[1]] = d3.scale.linear().range([this.innerHeight + this.top, this.top]);
        this.scale.x = d3.scale.linear().range([this.left, this.innerWidth + this.left]);
        this.scale.y = d3.scale.linear().range([this.top + this.innerHeight, this.top]);
    }

    // Domain: range of rawdata
    private initDomain(target: string, data): void {

        /// Case of horizontal bar => use the complementary one as the target
        let theOther = this.isHorizontal
            ? this.getComplementary(target)
            : target;
        let axis = this.base[`${theOther}Axis`];
        this.domain[target] = this.isDomainFixed(axis) ?
            axis.ticks.domain
            :
            d3.extent(data, (d) => d[`${theOther}Data`]);
        let param = this.getPaddingParams(target, [...this.domain[target]]); // Make a new array from 'domain'
        //  ---  A bug for ES6 syntax in Typescript: spread operator(...) didn't work correctly  ---
        // let scaledDomain = this.scaleDomain(...param);

        let scaledDomain = this.scaleDomain.apply(null, param);
        this.scale[target].domain(scaledDomain);
    }

    // Limit data to displayed only in the canvas
    // private limitDataBoundary(target: string, data: number): number {
    //     let [min, max] = this.domain[target];
    //     while (data < min) { data += (max - min); }
    //     while (data > max) { data -= (max - min); }
    //     return data;
    // }

    // Get 'y' by 'x' of get 'x' by 'y'
    private getComplementary(target: string): string {
        let arr = ['x', 'y'];
        return arr.includes(target) ? arr[+!arr.indexOf(target)] : target;
    }
    // Formating axis label
    private removeFirstZero(str: string): string { return '0' === str[0] ? str.substring(1) : str; }




}




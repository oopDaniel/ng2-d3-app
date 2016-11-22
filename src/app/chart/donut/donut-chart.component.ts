import {
    Component,
    ElementRef,
    Inject,
    OpaqueToken,
    ViewEncapsulation
} from '@angular/core';

import * as d3                  from 'd3';
import { ChartBase }            from './../chart-base';
import { DonutChartModel }      from './donut-chart.model';
import { DonutChartService }    from './donut-chart.service';
import { Utility }              from './../../shared/utility';


const ClassName = new OpaqueToken('DonutChart');


@Component({
    encapsulation:  ViewEncapsulation.None,
    template:       '',
    selector:       'app-donut-chart',
    styleUrls:      ['donut-chart.component.scss'],
    providers:      [
        { provide: ClassName, useValue: 'donut-chart' }
    ]
})
export class DonutChartComponent extends ChartBase {
    protected arc;               // D3 path generetor
    protected pie: Function;     // D3 data formator
    protected update;
    protected enter;
    protected offsetCanvas;
    protected color;             // Use D3 color scaling function as default color (data has no theme color)

    protected beginData;         // Compared to the end data for making tween animation
    protected hasDonutCanvasInited: boolean = false; // Avoid append deplicate 'g'
    protected outerRadius: number;
    protected innerRadius: number;

    private isPieChart: boolean = false;

    constructor(
        public service: DonutChartService,
        protected elementRef: ElementRef,
        @Inject(ClassName) protected className: string
    ) {
        super(service, elementRef, String(className) ); // Convert provider token type String into string
    }


    render(data: DonutChartModel, pieParams = {}): void {
        if (!data || 0 === data.data.length) {
            return;
        }

        this.isPieChart = !Utility.isEmptyObject(pieParams);

        /**
         *  Previously has cached base && 
         *  was different to the base currently received
         * 
         *  => Need to re-render the donut canvas
         */
        let hasBoundaryChanged = true;
        if (this.base) {
            hasBoundaryChanged =
                !Utility.isSameObject(data.base.padding, this.base.padding) ||
                !Utility.isSameObject(data.base.margin,  this.base.margin);
        }

        super.render(data);

        if (!this.hasDonutCanvasInited ||
             hasBoundaryChanged) {
            this.initDonutCanvas();
        }
        this.showDonut(data.data, pieParams);
    }


//  -------------         Protected              -------------


    protected initDonutCanvas(): void {
        let width  = this.innerWidth  - (this.padding.left + this.padding.right);
        let height = this.innerHeight - (this.padding.top  + this.padding.bottom);

        this.outerRadius = Math.min(width, height) / 2;

        /// Default as pie chart => innerRadius = 0
        let thickness = this.isPieChart
            ? this.outerRadius
            : this.base.feature.thickness || this.outerRadius;

        let isValidInnerRadius = this.outerRadius - thickness >= 0;
        if (!isValidInnerRadius) {
            console.warn('The assigned thickness was too small');
        }
        this.innerRadius = isValidInnerRadius
            ? this.outerRadius - thickness
            : 0;

        let center = {
            x: width  / 2 + this.padding.left + this.left,
            y: height / 2 + this.padding.top  + this.top,
        };

        this.offsetCanvas = this.canvas.append('g')
            .attr('transform', `translate(${center.x}, ${center.y})`);
        this.hasDonutCanvasInited = true;
    }

    protected showDonut(data, pieParams): void {
        let feature  = this.isPieChart ? this.base['pie-feature'] : this.base.feature;
        let padAngle = this.isPieChart ? pieParams.padAngle : 0;
        this.color   = d3.scale.category20();

        this.pie = d3.layout.pie()
            .value(d => d['yData'])
            .startAngle(feature.angle && feature.angle.start || 0 )
            .endAngle(  feature.angle && feature.angle.total || 2 * Math.PI )
            .padAngle(padAngle)
            .sort(null);    // Default not sorting

        this.arc = d3.svg.arc()
            .outerRadius(this.outerRadius)
            .innerRadius(this.innerRadius);

        if (!this.hasAnimate(feature)) {
            this.offsetCanvas.selectAll('.arc').remove();
        }

        this.update = this.offsetCanvas.selectAll('.arc')
            .data(this.pie(data));
        this.enter = this.update.enter();

        this.drawDonut();
        this.applyThemeColor();

        if (this.hasAnimate(feature)) {
            let duration =
                feature.animation && feature.animation.duration || 100;
            this.nextTick( () => {
                this.update.exit().remove();
                this.update
                    .transition()
                    .duration(duration)
                    .attrTween('d', (args) => this.arcTween(args));
                    // .attrTween('d', (args) => arcTween.apply(me, [args]))  // ES5 case
            });
        }
        // --------------    ES5 case     ---------------
        // function arcTween(a) {
        //     let i = d3.interpolate(this.beginData, a);
        //     this.beginData = i(0);
        //     return t => this.arc(i(t))
        //     // function(t) {
        //     //   return this.arc(i(t));
        //     // }.bind(this);
        // };
        // ----------------------------------------------
    }

    protected drawDonut(): void {
        this.enter
            .append('path')
            .attr('d', this.arc)
            .attr('fill', d => this.color(d.value) )
            .each( d => this.beginData = d);
    }

    protected applyThemeColor(): void {
        this.update.attr('class', (d, i) => `arc theme${ i + 1 }`);
    }

    /// Helper function for subclasses to get summary text
    protected getSummary(data): number {
        return data.map( (d) => d.yData)
            .reduce( (a, b) => a + b, 0);
    }

    protected arcTween(end) {
        let i = d3.interpolate(this.beginData, end);
        this.beginData = i(0);
        return t => this.arc(i(t));
    }

}


import {
    Component,
    ElementRef,
    ViewEncapsulation,
} from '@angular/core';

import * as d3                          from 'd3';
import { DonutChartComponent }          from './../donut/donut-chart.component';
import { ComparedDonutChartService }    from './compared-donut-chart.service';



@Component({
    encapsulation: ViewEncapsulation.None,
    template: '',
    selector: 'compared-donut-chart',
    providers: [ComparedDonutChartService],
    styleUrls: ['./compared-donut-chart.component.scss']
})
export class ComparedDonutChartComponent extends DonutChartComponent {
    // UI Requirement: if more than threshold, render it with red
    protected isOverThreshold:     boolean = false;
    private   centerStr:           string;
    private   totalStr:            string;
    private   hasTotalTextTweened: boolean = false;

    constructor(
        public    service: ComparedDonutChartService,
        protected elementRef: ElementRef
    ) {
        super(service, elementRef, 'compared-donut-chart');
    }

    render(_data): void {
        if (!_data || 0 === _data.data.length) return;
        // UI Requirement: Count only first two data
        if  (_data.data.length > 0) { _data.data.length = 2; }

        this._initParams(_data);
        super.render(_data);

        this._showText(this.centerStr, this.totalStr);
    }


//-------------        Protected           -------------


    // Overwrite for sorting
    protected showDonut(data): void {
        let feature          = this.base.feature,
            thickness        = feature.thickness || this.outerRadius,
            innerRadius      = this.outerRadius - feature.thickness;
        let isEmptyDonut     = 0 === data.reduce( (a,b) => a['yData'] + b['yData'] ); /// Sum of (y-data)s
        if (isEmptyDonut)   this._makeMockData(data);


        if (innerRadius < 0 ) { throw `Error: assigned thickness too small, outer:${this.outerRadius}, inner:${innerRadius}`; }

        this.pie = d3.layout.pie()
            .value(d => d['yData'])
            .startAngle(feature.angle.start || 0 )
            .endAngle(  feature.angle.total || 2 * Math.PI )
            .sort((a, b) => this._sortArc(a,b));

        this.arc = d3.svg.arc()
            .outerRadius(this.outerRadius)
            .innerRadius(innerRadius);

        if (!this.hasAnimate(feature)) {
            this.offsetCanvas.selectAll('.arc').remove()
        }

        this.update = this.offsetCanvas.selectAll('.arc')
            .data(this.pie(data));
        this.enter = this.update.enter();

        this.drawDonut()
        this.applyThemeColor(isEmptyDonut);

        if (this.hasAnimate(feature)) {
            this.nextTick( () => {
                this.update.exit().remove();
                this.update
                    .transition()
                    .duration(feature.animation.duration || 100)
                    .attrTween('d', (args) => this.arcTween(args))
            });
        }
    }

    // Overwrite for click event
    protected drawDonut(): void {
        let me = this;
        this.enter
            .append('path')
            .attr('d', this.arc)
            .each( d => this.beginData = d)
            ///////  Not to open currently
            // .on('click', d => this._showText(d.value));
    }

    // Overwrite for dual theme color assignment
    protected applyThemeColor(isEmptyDonut: boolean = false): void {
        this.update
            .attr('class', d =>
                isEmptyDonut ?
                    'arc theme-unknown'
                    :
                    !d.data.name ?
                        `arc theme-base`
                        :
                        this.isOverThreshold ?
                        `arc theme-down`
                        :
                        `arc theme-up`
            );
    }

    protected _showText(
        centerStr: string = this.centerStr,
        totalStr: string = this.totalStr) {

        let feature             = this.base.feature;
        let hasAnimate: boolean = this.hasAnimate(feature);

        let appendedCenterStr = hasAnimate ? 0 : centerStr;
        let appendedTotalStr  = hasAnimate && !this.hasTotalTextTweened ? 0 : totalStr;

        this.offsetCanvas.selectAll('.text').remove();
        let textGroup = this.offsetCanvas.append('g')
            .attr('class', `text`);
            // .attr('transform', `translate(${this.center.x}, ${this.center.y})`)
        let centerText = textGroup
            .append('text')
            .attr('class', 'center')
            // .attr('transform',
            //   `translate (${this.center.x}, ${this.center.y})`)
            .text(appendedCenterStr);
        let totalText = textGroup
            .append('text')
            .attr('class', 'total')
            .attr('transform', `translate (${0}, ${42})`)
            .text(`Total: ${appendedTotalStr}`);

        if (hasAnimate) {
            let me = this;
            let duration = feature.animation.duration;
            centerText
                .transition()
                .ease('quad-out')
                .duration(duration)
                .tween('text', d => this._textTween(centerStr, centerText));

            // Won't trigger by click event
            if (!this.hasTotalTextTweened) {
                totalText
                    .transition()
                    .ease('quad-out')
                    .duration(duration)
                    .tween('text', d => this._textTween(totalStr, totalText, true));
                this.hasTotalTextTweened = true;
            }

        }

    }


//-------------          Private             -------------

    private _makeMockData(data): void { data.forEach( d => d.yData = 1 ); }

    private _initParams(_data): void {
        this.centerStr = this.totalStr = ''
        if (0 === _data.data.length) return;

        let threshold = _data.base.feature.threshold || 5;
        let nameArr   = _data.data.map(d => d.name);

        // Match the only data not equal to undefined / null / ''
        let targetIndex = nameArr.indexOf(nameArr.filter(d => d)[0]);
        let target = _data.data[targetIndex].yData;
        let total  = this.getSummary(_data.data);
        this.isOverThreshold = (target / total) * 100  > threshold;
        this.centerStr = `${target}`;
        this.totalStr = `${total}`;
        this.hasTotalTextTweened = false;
    }

    // Remove the decimals and separated by comma
    private _eliminateDecimal(num: number): string {
        return d3.format(",.0f")(num);
    }
    // Always put the data that has name as first element clockwise
    private _sortArc(a, b): number { return !a.name ? 1 : 0; }

    private _textTween(end: string, target, isTotalNeedToAppend: boolean = false) {
        let appendix = isTotalNeedToAppend ? 'Total: ' : '';
        let i = d3.interpolate(0, +end);
        return t => target.text(appendix + this._eliminateDecimal(i(t)));
    }

}


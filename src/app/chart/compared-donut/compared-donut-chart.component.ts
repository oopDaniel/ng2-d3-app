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
    selector: 'app-compared-donut-chart',
    providers: [ComparedDonutChartService],
    styleUrls: ['./compared-donut-chart.component.scss']
})
export class ComparedDonutChartComponent extends DonutChartComponent {
    /**
     *  UI Requirement: 
     *    if data more than threshold, render it with red
     **/
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

    render(data): void {
        if (!data || 0 === data.data.length) {
            return;
        }

        if  (data.data.length > 2) {
            data.data.length = 2;
        }

        this.initParams(data);
        super.render(data);

        this.showText(this.centerStr, this.totalStr);
    }


// -------------        Protected           -------------


    // Override: add sorting and empty check
    protected showDonut(data): void {
        let isEmptyDonut = 0 === this.getSum(data);

        if (isEmptyDonut) {
            this.makePaddingMockData(data);
        }

        let sortCallback = (a, b) => this.sortArc(a, b);

        super.showDonut(data, null, sortCallback);
        this.applyThemeColor(isEmptyDonut);
    }

    // Override: add click event
    protected drawDonut(): void {
        this.enter
            .append('path')
            .attr('d', this.arc)
            .each( (d) => this.beginData = d)
            .on('click', (d) => this.showText(d.value));
    }

    // Override: dual theme color assignment
    protected applyThemeColor(isEmptyDonut = false): void {
        this.update
            .attr('class', (d) =>
                isEmptyDonut
                    ? 'arc theme-unknown'
                    : !d.data.name
                        ? 'arc theme-base'
                        : this.isOverThreshold
                            ? 'arc theme-down'
                            : 'arc theme-up'
            );
    }

    protected showText(
        centerStr: string = this.centerStr,
        totalStr: string  = this.totalStr): void {

        let feature             = this.base.feature;
        let hasAnimate: boolean = this.hasAnimate(feature);

        let appendedCenterStr = hasAnimate ? 0 : centerStr;
        let appendedTotalStr  = hasAnimate && !this.hasTotalTextTweened ? 0 : totalStr;

        this.offsetCanvas.selectAll('.text').remove();
        let textGroup = this.offsetCanvas.append('g')
            .attr('class', `text`);
        let centerText = textGroup
            .append('text')
            .attr('class', 'center')
            .text(appendedCenterStr);
        let totalText = textGroup
            .append('text')
            .attr('class', 'total')
            .attr('transform', `translate (${0}, ${42})`)
            .text(`Total: ${appendedTotalStr}`);

        if (hasAnimate) {
            let duration = feature.animation.duration;
            centerText
                .transition()
                .ease('quad-out')
                .duration(duration)
                .tween('text', (d) => this.textTween(centerStr, centerText));

            // Won't trigger by click event
            if (!this.hasTotalTextTweened) {
                totalText
                    .transition()
                    .ease('quad-out')
                    .duration(duration)
                    .tween('text', (d) => this.textTween(totalStr, totalText, true));
                this.hasTotalTextTweened = true;
            }

        }

    }


// -------------          Private             -------------

    private makePaddingMockData(data): void {
        data.forEach( d => d.yData = 1 );
    }

    private initParams(data): void {
        this.centerStr = this.totalStr = '';
        if (0 === data.data.length) {
            return;
        }

        let threshold = data.base.feature && data.base.feature.threshold || 5;
        let names     = data.data.map( (d) => d.name );

        // Match the only data named not equal to undefined / null / ''
        let index                = names.indexOf(names.filter( (d) => d )[0]);
        let target               = data.data[index].yData;
        let total                = this.getSum(data.data);
        this.isOverThreshold     = (target / total) * 100  > threshold;
        this.centerStr           = String(target);
        this.totalStr            = String(total);
        this.hasTotalTextTweened = false;
    }

    // Remove the decimals and separated by comma
    private eliminateDecimal(num: number): string {
        return d3.format(',.0f')(num);
    }
    // Always put the data that has name as first element clockwise
    private sortArc(a, b): number { return !a.name ? 1 : 0; }

    private textTween(end: string, target, isTotalNeedToAppend = false) {
        let appendix = isTotalNeedToAppend ? 'Total: ' : '';
        let i = d3.interpolate(0, +end);
        return (t) => target.text(appendix + this.eliminateDecimal(i(t)));
    }

    private getSum(data: any[]): number {
        return data.map( (d) => d.yData)
            .reduce( (a, b) => a + b, 0);
    }
}

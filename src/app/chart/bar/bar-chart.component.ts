import {
    Component,
    ElementRef,
    Inject,
    OpaqueToken,
    ViewEncapsulation
} from '@angular/core';

import * as d3                  from 'd3';
import { ChartBase }            from './../chart-base';
import {
    BarChartModel,
    BarDirection,
    BarChartAnimation,
} from './bar-chart.model';
import { BarChartService }    from './bar-chart.service';
import { Utility }              from './../../shared/utility';


const ClassName = new OpaqueToken('BarChart');


@Component({
    encapsulation:  ViewEncapsulation.None,
    template:       '',
    selector:       'bar-chart',
    styleUrls:      ['bar-chart.component.scss'],
    providers:      [
        { provide: ClassName, useValue: 'bar-chart' }
    ]
})
export class BarChartComponent extends ChartBase {
    private totalGroups = 0;
    private maxGroupLen = 0;
    private groupKeys   = [];

    constructor(
        public service: BarChartService,
        protected elementRef: ElementRef,
        @Inject(ClassName) protected className: string
    ) {
        super(service, elementRef, String(className) ); // Convert provider token type String into string
    }


    render(data: BarChartModel, pieParams = {}): void {
        if (!data || 0 === data.data.length) return;

        let isHorizontal = data.feature && 
            data.feature.direction &&
            <any>data.feature.direction === BarDirection.Vertical;

        super.clearCanvas();
        super.render(data, true, isHorizontal);

        // Grouping process
        this.groupKeys   = Object.keys(this.groupedData);
        this.totalGroups = this.groupKeys.length;
        this.maxGroupLen = this.groupKeys.reduce((a, b) => {
            const prevLen = this.groupedData[a] ? this.groupedData[a].length : 0;
            return Math.max(prevLen, this.groupedData[b].length)
        }, 0);

        // Actual render
        this.showBar(data.data, isHorizontal);
    }


//  -------------         Private              -------------


    private showBar(data: Array<any>, isHorizontal: boolean): void {
        let maxWidth = this.feature.maxWidth,
            baseWidth = isHorizontal ?
                this.innerHeight - this.padding.top - this.padding.bottom
                :
                this.innerWidth - this.padding.left - this.padding.right,
            barGroupWidth = this.getBarGroupWidth(baseWidth, data.length, maxWidth),
            axisThickness = this.feature['axisLineThickness'] || 0;

        let translate = isHorizontal ?
            `translate(${axisThickness}, ${-barGroupWidth / 2})`
            :
            `translate(${-barGroupWidth / 2 }, ${-axisThickness})`;
        let canvas = this.canvas.append('g')
            .attr({
                'transform': translate,
                'class':     'bars'
            })

        let update = canvas.selectAll('rect')
                    .data(data),
            enter  = update.enter(),
            exit   = update.exit();

        enter.append('rect').attr('class', (d) => {
            let groupIndex = this.groupKeys.indexOf(d.name);
            return `bar theme${groupIndex + 1}`;
        });

        if (this.hasAnimate(this.feature)) {
            this.showAnimation(update, barGroupWidth, this.feature.animation, isHorizontal);
        }
        else {
            this.drawBar(update, barGroupWidth, isHorizontal)
        }

        exit.remove();
    }



    private drawBar(update, barGroupWidth: number, isHorizontal: boolean): void {
        let attrH =  {
            'x':      this.left + this.padding.left,
            'y':      d => this.scale.y(d.xData),
            'width':  d => this.scale.x(d.yData) - this.left - this.padding.left,
            'height': barGroupWidth
        };
        let attrV = {
            'x':      d => this.scale.x(d.xData),
            'y':      d => this.scale.y(d.yData),
            'width':  barGroupWidth,
            'height': d => (this.innerHeight + this.top) - this.scale.y(d.yData) - this.padding.bottom
        };
        let attr = isHorizontal ? attrH : attrV;
        update.attr(attr);
    }

    private showAnimation(bars, barGroupWidth: number, animateBase, isHorizontal: boolean) {
        const barWidth = Math.floor(barGroupWidth / this.totalGroups);

        let attrH = {
            'x'     : this.left + this.padding.left,
            'y'     : d => this.scale.y(d.xData),
            'width' : 0,
            'height': barGroupWidth,
        };

        let attrV = {
            'x'     : (d) => {
                let groupIndex = this.groupKeys.indexOf(d.name);
                let startPos   = this.scale.x(d.xData) - Math.floor(barGroupWidth * .5);
                return startPos + groupIndex * barWidth;
            },
            'y'     : this.innerHeight + this.top - this.padding.bottom,
            'width' : Math.floor(barGroupWidth / this.totalGroups),
            'height': 0,
        };
        let attr = isHorizontal ? attrH : attrV;

        let endAttrH = {
            'width': d => this.scale.x(d.yData) - this.left - this.padding.left
        };
        let endAttrV = {
            'y':      d => this.scale.y(d.yData),
            'height': d => (this.innerHeight + this.top) - this.scale.y(d.yData) - this.padding.bottom
        };
        let endAttr = isHorizontal ? endAttrH : endAttrV;

        let delayFactor = animateBase.delay || 100,
            ease        = animateBase.ease  || 'linear';

        let isAniateGrow: boolean = animateBase.type === BarChartAnimation.Grow,
            delay = isAniateGrow ? 0 : (d,i) => i * delayFactor;

        bars.attr(attr)
            .transition()
            .duration(delay)
            .ease(ease)
            .delay(delay)
            .attr(endAttr);
    }

    private getBarGroupWidth(innerWidth: number, len: number, maxWidth: number): number {
        let rangeWidth = innerWidth - this.padding.left - this.padding.right,
            width      = Math.floor(rangeWidth / len) ;
        return width > maxWidth ? maxWidth : width;
    }

}


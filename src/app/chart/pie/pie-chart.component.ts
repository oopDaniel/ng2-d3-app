import { Component, ElementRef, ViewEncapsulation }    from '@angular/core';

import * as d3 from 'd3';
import { DonutChartComponent }      from './../donut/donut-chart.component';
import { PieChartService } from './pie-chart.service';
import { PieChartModel } from './pie-chart.model';




@Component({
    encapsulation: ViewEncapsulation.None,
    template:  '',
    styleUrls: ['./pie-chart.component.scss'],
    selector:  'pie-chart',
    providers: [PieChartService],
})
export class PieChartComponent extends DonutChartComponent {

    constructor(
        public    service: PieChartService,
        protected elementRef: ElementRef
    ) {
        super(service, elementRef, 'pie-chart');
    }

    render(data: PieChartModel): void {
        if (!data || 0 === data.data.length) {
            return;
        }

        let feature  = data.base.feature,
            padAngle = feature.angle && feature.angle.padding || 0,
            pieParam = { padAngle };

        super.render(data, pieParam);

        let hasLabel = feature && undefined !== feature.label;
        if (hasLabel) this.showText(data.data);
    }


//-------------           Private               -------------


    private showText(data): void {
        let total     = this.getSum(data),
            feature   = this.base.feature,
            threshold = feature.label.threshold       || 0,
            scale     = feature.label.scaleFactor     || 2,
            hide      = feature.label.hideSmall       || 0;  // Default show small angles

        let textUpdate = this.offsetCanvas
            .selectAll('.pie-text')
            .data(this.pie(data));

        textUpdate.enter().append('text')
            .attr('class', 'pie-text');

        this.nextTick( ()=> {
            textUpdate.transition().duration(feature.animation.duration || 100)
                .attr('transform', (d) => {
                    d.percentage = this.getPercentage(d.value, total);
                    let scaleFactor = d.percentage > threshold 
                        ? 1 
                        : scale;
                    let arr = this.arc.centroid(d)
                        .map( (d) => d * scaleFactor );
                    return this.getScaledTranslate(d, threshold, scaleFactor);
                })
                .text( (d) => d.percentage > hide 
                    ? `${d.percentage}%` 
                    : '' );
        });

        textUpdate.exit().remove();
    }

    private getScaledTranslate(d, threshold: number, scaleFactor: number): string {
        const pi = Math.PI;
        let isUnderThreshold: boolean = d.percantage >= threshold;

        // To properly display, increase the factor if the angle of slice was in 90° ~ 180°
        let shouldFixTranslate: boolean = d.startAngle > pi / 2 ||  
            d.startAngle < 2 * pi - pi / 2;

        scaleFactor =  isUnderThreshold 
            ? 1
            : shouldFixTranslate 
                ? 1.05 * scaleFactor
                : scaleFactor;

        let coordinate = this.arc.centroid(d).map( (d) => d * scaleFactor );
        return `translate(${coordinate})`
    }

    private getPercentage(value: number, total: number): number {
        return Number(d3.format(this.base.feature.label.format)(value / total * 100));
    }

    private getSum(data: any[]): number {
        return data.map( (d) => d.yData)
            .reduce( (a, b) => a + b, 0);
    }
}


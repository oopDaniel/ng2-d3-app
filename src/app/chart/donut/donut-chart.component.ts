import { Component, ElementRef, Inject, OpaqueToken } from '@angular/core';

import * as d3 from 'd3';
import { ChartBase } from './../chart-base';
import { DonutChartModel } from './donut-chart.model';
import { DonutChartService } from './donut-chart.service';
import { Utility } from './../../shared/utility';

let ClassName = new OpaqueToken('DonutChart');




@Component({
    template:   '',
    selector:   'app-donut-chart',
    providers:  [
        DonutChartService,
        { provide: ClassName, useValue: 'donut-chart' }
    ]
})
export class DonutChartComponent extends ChartBase {

    protected arc;               // D3 path generetor
    protected pie: Function;     // D3 data formator
    protected center;            // Center of circle
    protected update;
    protected enter;
    protected offsetCanvas;
    protected color;             // Use D3 color scaling function as default color (data has no theme color)

    protected beginData;         // Compared to the end data for making tween animation
    protected hasDonutCanvasInit: boolean = false; // Avoid append deplicate 'g'
    protected outerRadius: number;
    protected innerRadius: number;

    private isPieChart: boolean = false;

    constructor(
        public service: DonutChartService,
        protected _elementRef: ElementRef,
        @Inject(ClassName) protected className: string
    ) {
        super(service, _elementRef, String(className) ); // Convert provider token type String into string
    }


    render(_data: DonutChartModel, pieParams = {}): void {
        if (!_data || 0 === _data.data.length) {
            return;
        }

        let hasBoundaryChanged = true;
        this.isPieChart = !Utility.isEmptyObject(pieParams);

        if (this.base) {
        // Previously has cached base and was different to the base currently received
        // ->     Need to re-render the canvas
            hasBoundaryChanged =
                !Utility.isSameObject(_data.base.padding, this.base.padding) ||
                !Utility.isSameObject(_data.base.margin,  this.base.margin);
        }

        super.render(_data);

        if (!this.hasDonutCanvasInit || hasBoundaryChanged) {
            this._initDonutCanvas(); }
        this._showDonut(_data.data, pieParams);
    }


//  -------------         Protected              -------------


    protected _initDonutCanvas(): void {
        let width  = this.innerWidth  - (this.padding.left + this.padding.right);
        let height = this.innerHeight - (this.padding.top  + this.padding.bottom);

        this.outerRadius = Math.min(width, height) / 2;

        let thickness = this.outerRadius; // The innerRadius of Pie Chart is 0

        if (!this.isPieChart) { // Render target is donut, hence has thickness
            thickness = this.base.feature.thickness || this.outerRadius;
        }

        this.innerRadius = this.outerRadius - thickness;
        if (this.innerRadius < 0 ) {
            throw 'Error: assigned thickness too small';
        }

        this.center = {
            x: width  / 2 + this.padding.left + this.left,
            y: height / 2 + this.padding.top  + this.top,
        };

        this.offsetCanvas = this.canvas.append('g')
            .attr('transform', `translate(${this.center.x}, ${this.center.y})`);
        this.hasDonutCanvasInit = true;
    }

    protected _showDonut(data, pieParams): void {
        let feature      = this.isPieChart ? this.base['pie-feature']   : this.base.feature;
        let paddingAngle = this.isPieChart ? pieParams['padding-angle'] : 0;
        this.color = d3.scale.category20();

        this.pie = d3.layout.pie()
            .value(d => d['yData'])
            .startAngle(feature.angle && feature.angle.start || 0 )
            .endAngle(  feature.angle && feature.angle.total || 2 * Math.PI )
            .padAngle(paddingAngle)
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

        this._drawDonut();
        this._applyThemeColor();

        if (this.hasAnimate(feature)) {
            this.nextTick( () => {
                this.update.exit().remove();
                this.update
                    .transition()
                    .duration(feature.animation.duration || 100)
                    // .attrTween('d', (args) => arcTween.apply(me, [args]))  // ES5 case
                    .attrTween('d', (args) => this.arcTween(args));
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

    protected _drawDonut(): void {
        this.enter
            .append('path')
            .attr('d', this.arc)
            .attr('fill', d => this.color(d.value) )
            .each( d => this.beginData = d);
    }

    protected _applyThemeColor(): void {
        this.update.attr('class', (d, i) => `arc theme${ i + 1 }`);
    }

    protected _getSum(data): number {
        return data.map(d => d.yData).reduce((a, b) => a + b, 0);
    }

    protected arcTween(end) {
        let i = d3.interpolate(this.beginData, end);
        this.beginData = i(0);
        return t => this.arc(i(t));
    }

}


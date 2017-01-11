import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    DonutChartComponent,
    DonutChartService,
} from './donut/donut-chart';

import {
    ComparedDonutChartComponent,
    ComparedDonutChartService,
} from './compared-donut/compared-donut-chart';

import {
    PieChartComponent,
    PieChartService,
} from './pie/pie-chart';

import {
    BarChartComponent,
    BarChartService,
} from './bar/bar-chart';

@NgModule({
    imports: [CommonModule],
    declarations: [
        DonutChartComponent,
        ComparedDonutChartComponent,
        PieChartComponent,
        BarChartComponent,
    ],
    exports: [
        DonutChartComponent,
        ComparedDonutChartComponent,
        PieChartComponent,
        BarChartComponent,
    ],
    providers: [
        DonutChartService,
        ComparedDonutChartService,
        PieChartService,
        BarChartService,
    ]
})
export class ChartModule { }


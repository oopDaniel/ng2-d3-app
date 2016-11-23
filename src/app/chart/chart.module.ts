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

@NgModule({
    imports: [CommonModule],
    declarations: [
        DonutChartComponent,
        ComparedDonutChartComponent,
        PieChartComponent
    ],
    exports: [
        DonutChartComponent,
        ComparedDonutChartComponent,
        PieChartComponent,
    ],
    providers: [
        DonutChartService,
        ComparedDonutChartService,
        PieChartService,
    ]
})
export class ChartModule { }


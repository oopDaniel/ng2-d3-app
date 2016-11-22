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

@NgModule({
    imports: [CommonModule],
    declarations: [
        DonutChartComponent,
        ComparedDonutChartComponent,
    ],
    exports: [
        DonutChartComponent,
        ComparedDonutChartComponent,
    ],
    providers: [
        DonutChartService,
        ComparedDonutChartService,
    ]
})
export class ChartModule { }


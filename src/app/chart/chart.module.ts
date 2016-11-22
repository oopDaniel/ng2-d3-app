import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonutChartComponent } from './donut/donut-chart.component';
import { DonutChartService } from './donut/donut-chart.service';

@NgModule({
    imports: [CommonModule],
    declarations: [
        DonutChartComponent,
    ],
    exports: [
        DonutChartComponent,
    ],
    providers: [
        DonutChartService,
    ]
})
export class ChartModule { }


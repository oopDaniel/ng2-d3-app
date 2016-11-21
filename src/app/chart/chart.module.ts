import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { DonutChartComponent } from './donut/donut-chart.component';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    DonutChartComponent,
  ],
  exports: [
    DonutChartComponent
  ],
  providers:    [  ]
})
export class ChartModule {}


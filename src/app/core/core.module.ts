import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';

import { ChartSwitcherComponent } from './chart-switcher/chart-switcher';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [ ChartSwitcherComponent ],
  exports:      [ ChartSwitcherComponent ],
})
export class CoreModule {}

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { ChartService }         from './../chart-base.service';
import { DonutChartModel }  from './donut-chart.model';
import { MOCK_DATA } from './mock-data';

@Injectable()
export class DonutChartService extends ChartService<DonutChartModel> {
    getData() {
        let data = MOCK_DATA;

        let total = this.getRandInt(9, 2);
        for (let i = 0; i < total; ++i) {
            data.data.push({
                yData: this.getRandInt(300)
            })
        }
        
        return Observable.of(MOCK_DATA);
    }
}


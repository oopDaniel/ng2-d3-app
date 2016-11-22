import { Injectable }       from '@angular/core';

import { ChartService }     from './../chart-base.service';
import { DonutChartModel }  from './donut-chart.model';
import { MOCK_DATA }        from './mock-data';
import { Utility }          from './../../shared/utility';

@Injectable()
export class DonutChartService extends ChartService<DonutChartModel> {

    getMockData(): DonutChartModel {
        let data: DonutChartModel = Utility.clone(MOCK_DATA);

        let total = this.getRandInt(9, 2);
        for (let i = 0; i < total; ++i) {
            data.data.push({
                yData: this.getRandInt(300)
            });
        }

        return data;
    }

}


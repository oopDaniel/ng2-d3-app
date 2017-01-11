import { Injectable }       from '@angular/core';

import { ChartService }     from './../chart-base.service';
import { BarChartModel }  from './bar-chart.model';
import { MOCK_DATA }        from './mock-data';
import { Utility }          from './../../shared/utility';

@Injectable()
export class BarChartService extends ChartService<BarChartModel> {

    getMockData(mockData = MOCK_DATA): BarChartModel {
        let data: BarChartModel = Utility.clone(mockData);

        let total = this.getRandInt(9, 5);
        let totalGroups = this.getRandInt(2, 1);

        for (let i = 1; i <= total; ++i) {
            for (let j = 0; j < totalGroups; ++j) {
                data.data.push({
                    yData: this.getRandInt(300),
                    xData: i + 1,
                    name:  `Brand${j}`,
                });
            }
        }

        return data;
    }

}


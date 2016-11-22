import { Injectable }   from '@angular/core';

import { Utility }      from './../../shared/utility';
import {
    DonutChartService,
    DonutChartModel,
    MOCK_DATA,
} from './../donut/donut-chart';

@Injectable()
export class ComparedDonutChartService extends DonutChartService {
    getMockData(mockData = MOCK_DATA): DonutChartModel {
        let data: DonutChartModel = Utility.clone(mockData);
        data.base.feature.threshold = 30;

        let index = this.getRandInt(1, 0);
        data.data[index]   = {
            name:  this.getRandName(),
            yData: this.getRandInt(300)
        };
        data.data[+!index] = {
            yData: this.getRandInt(300)
        }

        return data;
    }
}

import { Injectable }           from '@angular/core';

import { DonutChartService }    from './../donut/donut-chart';
import { PieChartModel }        from './pie-chart.model';
import { MOCK_DATA }            from './mock-data';

@Injectable()
export class PieChartService extends DonutChartService {
    getMockData(mockData = <any>MOCK_DATA): PieChartModel {
        return super.getMockData(<any>MOCK_DATA);
    }
}

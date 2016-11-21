import { ChartBaseModel } from './../chart-base.model';

export enum DonutChartAnimation { Spin };

export interface DonutChartData {
    yData:      number;
    name?:      string;
};

export interface DonutChartModel {
    base: ChartBaseModel & {
        feature: {
            thickness:          number;
            angle: {
                start:          number; // 0
                total:          number; // 2 * Math.PI,
            };
            animation?: {
                type:           DonutChartAnimation,
                duration:       number;
            };
        };
    };
    data: DonutChartData[];
};


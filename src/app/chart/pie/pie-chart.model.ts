import { ChartBaseModel } from './../chart-base.model';
import { DonutChartModel } from './../donut/donut-chart.model';


export interface PieChartModel extends DonutChartModel {
    base: ChartBaseModel & {
        feature: {
            angle?: {
                start?:          number; // 0
                total?:          number; // 2 * Math.PI,
                padding?:        number; // .012
            };
            /// hide all labels by not passing this property
            label?: {
                threshold?:      number; // 6,
                /// The factor to be applied on the distance of labels of small angles 
                scaleFactor?:    number; // 2.2,
                /// Hide small labels
                hideSmall?:      boolean;
                format:          string; // '.1f' -> d3 number formater
            },
        };
    };
};


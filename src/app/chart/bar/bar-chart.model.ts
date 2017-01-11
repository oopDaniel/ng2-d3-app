import { D3AnimateEase, ChartBaseModel } from './../chart-base.model';

export enum BarChartAnimation { Grow, Domino };
export enum BarDirection { Vertical, Horizontal };

export interface BarChartData {
    xData:               number;
    yData:               number;
    name:                string;
    xFormat?:            string;
};

export interface BarChartFeature {
    direction:              BarDirection;
    maxWidth:               number;             // 50
    // "tickLineWidth"?:     number;             // 1.5
    animation?: {
        type:               BarChartAnimation;
        delay?:             number;             // 800
        ease?:              D3AnimateEase;      // exp
    };
};

export interface BarChartModel {
    base: ChartBaseModel;
    feature: BarChartFeature;
    data: BarChartData[];
};

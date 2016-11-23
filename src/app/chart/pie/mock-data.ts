import { ChartAxisPosition }    from './../chart-base.model';
import { DonutChartAnimation }  from './../donut/donut-chart.model';

export const MOCK_DATA = {
    "feature": {
        "angle": {
            "start": 0,
            "total": 2 * Math.PI,
            "padding": .012
        },
        "label": {
            "threshold": 6,
            "scaleDactor": 3.2,
            "format": '.1f'    // d3 number formater
        },
        "animation": {
            "type": DonutChartAnimation.Spin,
            "duration": 700,
        }
    },
    base: {
        "xAxis": {
            "position": ChartAxisPosition.Hidden,

        },

        "yAxis": {
            "position": ChartAxisPosition.Hidden,
        },

        "legends": {
            "height": 0,
        },

        "margin": "0",
        "padding": "10%",
    },

    data: []
};

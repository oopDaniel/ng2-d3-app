import { ChartAxisPosition }    from './../chart-base.model';
import { DonutChartAnimation }  from './donut-chart.model';

export const MOCK_DATA = {
    base: {
        'feature': {
            'thickness': 20,
            'angle': {
                'start': 0,
                'total': 2 * Math.PI,
            },
            'animation': {
                'type': DonutChartAnimation.Spin,
                'duration': 700,
            }
        },

        xAxis: {
            'position': ChartAxisPosition.Hidden,
            'height': 30,
            'format': '{%m}/{%d}',
            'ticks': {
              // 'domain': [0,5],
              // 'step': 1
              'step': 86400000
            }
        },

        yAxis: {
            'position': ChartAxisPosition.Hidden,
            'width': 50,
            'format': '{%H}:00',
            'ticks': {
              // 'domain': [0, 86400000-1000*60*60],
              // 'domain': [86400000-1, 0],
              'domain': [0, 86400000],
              'step': 1000 * 60 * 60 * 4
            }
        },

        'legends': {
            'height': 0,
        },

        'margin': '0',
        'padding': '10%',
    },

    data: []
};

import {
    ChartAxisPosition,
    D3AnimateEase,
}    from './../chart-base.model';
import {
    BarChartAnimation,
    BarDirection,
}  from './bar-chart.model';

export const MOCK_DATA = {
    'feature': {
        'direction': BarDirection.Vertical,
        'maxWidth': 50,
        'animation': {
            'type': BarChartAnimation.Grow,
            'duration': 700,
            'ease': D3AnimateEase[D3AnimateEase.exp],
        }
    },
    base: {
        xAxis: {
            'position': ChartAxisPosition.Hidden,
            'height': 30,
            'format': '{%m}/{%d}',
            'ticks': {
              // 'domain': [0,5],
              'step': 1
            //   'step': 86400000
            }
        },

        yAxis: {
            'position': ChartAxisPosition.Hidden,
            'width': 50,
            'format': '{%H}:00',
            'ticks': {
              // 'domain': [0, 86400000-1000*60*60],
              // 'domain': [86400000-1, 0],
              'domain': [0, 300],
              'step': 50,
            }
        },

        'legends': {
            'height': 0,
        },

        'margin': '30 40',
        'padding': '0',
    },

    data: []
};

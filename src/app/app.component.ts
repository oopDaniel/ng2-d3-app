import { Component } from '@angular/core';
import { DonutChartService } from './chart/donut/donut-chart.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [
        // {provide: 'Donut', useExisting: DonutChartService}
    ]
})
export class AppComponent {
    title = 'D3 app works!';

    constructor(private chart: DonutChartService) {}

    connect(): void {
        this.chart.connect();
    }
    disconnect(): void {
        this.chart.disconnect();
    }

    next(): void {
        this.chart.nextData();
    }
}

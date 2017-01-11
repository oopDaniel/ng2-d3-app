import {
    Component,
    OnInit,
} from '@angular/core';

import { DonutChartService }         from './chart/donut/donut-chart';
import { ComparedDonutChartService } from './chart/compared-donut/compared-donut-chart';
import { PieChartService }           from './chart/pie/pie-chart';
import { BarChartService }           from './chart/bar/bar-chart';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        // {provide: 'Donut', useExisting: DonutChartService}
    ]
})
export class AppComponent implements OnInit {
    private availableCharts: string[];
    private current: string;
    private currentService;
    
    charts = {
        Donut:              this.donut,
        'Compared Donut':   this.cDonut,
        Pie:                this.pie,
        Bar:                this.bar,
    };

    constructor(
        private donut:  DonutChartService,
        private cDonut: ComparedDonutChartService,
        private pie:    PieChartService,
        private bar:    BarChartService,
    ) {}


    ngOnInit(): void {
        this.availableCharts = Object.keys(this.charts);
        this.current         = this.availableCharts[0];
        this.currentService  = this.charts[this.current];
    }

    select(target: string): void {
        console.log(`${target} was selected`);

        this.connect();
        this.current        = target;
        this.currentService = this.charts[target];
    }

    connect(): void {
        this.currentService.connect();
    }
    disconnect(): void {
        this.currentService.disconnect();
    }

    next(): void {
        this.currentService.nextData();
    }
}

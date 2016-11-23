import {
    Component,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';

@Component({
    selector: 'chart-switcher',
    templateUrl: './chart-switcher.component.html',
    styleUrls: ['./chart-switcher.component.scss'],
})
export class ChartSwitcherComponent {
    @Input('charts') charts: string[];
    @Output() selected = new EventEmitter<string>();


    private shouldShowOpts: boolean = false;


    showOptions(): void {
        this.shouldShowOpts = !this.shouldShowOpts;
    }

    select(target: string): void {
        this.selected.emit(target);
        this.shouldShowOpts = false;
    }
}

import { Injectable }   from '@angular/core';
import { Utility }      from './../shared/utility';

@Injectable()
export abstract class ChartService<T> {
    public abstract getData();

    /**
     *  Produce mock data
     */


    /**
     *  @Input:     '3/30'
     *  @Input2:    2
     *  @Output:    '4/1'
     */
    getIncreasedDate(dateStr: string, days2add: number): string {
        let regex = /^(\d{1,2})\/(\d{1,2})$/;
        let tmp, month, date;
        try {
            [tmp, month, date] = regex.exec(dateStr);
            let time = new Date();
            time.setUTCDate(Number(date) + days2add);
            time.setUTCMonth(Number(month - 1));
            let m = time.getUTCMonth() + 1;
            let d = time.getUTCDate();
            return `${m}/${d}`;
        } catch (e) {
            throw `Invalid date string: ${e}`;
        }
    }


    /**
     *  @Input:     '12/7'  /  '2/20' / '1/30'
     *  @Output:    Timestamp for target date
     */
    getDateByStr(dateStr: string): number {
        let regex = /^(\d+)\/(\d+)/g;
        let tmp, month, date;
        try {
            [tmp, month, date] = regex.exec(dateStr);
            if (month > 12  || month < 1 ||
                date > 31   || date < 1  ||
                month === 2 && date > 29) {
                throw 'Invalid date string';
            }
            let time = new Date();
            time.setUTCMonth(Number(month) - 1);
            time.setUTCDate(Number(date));
            let timestamp = Number(time);
            timestamp -= timestamp % 86400000;
            return timestamp;
        } catch (e) {
            throw `Invalid date string: ${e}`;
        }
    }

    getRandName(): string {
        let roll: number = this.getRandInt(2, 0);
        let name: string = 0 === roll
            ? 'SiteA'
            : 1 === roll
                ? 'SiteB'
                : 'SiteC';
        return name;
    }

    /// Timestamp for hours, 0 <= timestamp < 86400000
    getHourData(hour: number): number {
        let d = new Date().setUTCHours(hour) % 86400000;
        return d - d % (60 * 60 * 1000);
    }

    /// Random int
    getRandInt(top = 9, down = 1): number {
        return Math.round(Math.random() * top + down);
    }

    /// Random timestamp
    getRandDate(start: number, end = Number(new Date())): number {
        return Number(new Date(Math.random() * (end - start) + start));
    }



    clone(obj): any {
        return Utility.clone(obj);
    }
}

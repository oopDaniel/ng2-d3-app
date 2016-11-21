

export class Utility {

    /************************
     *      Type Check
     */
    public static isNumber(arg: any): boolean {
        if (undefined === arg || null === arg) {
            return false;
        } else if ('number' === typeof (arg)) {
            return true;
        } else if ('string' === typeof (arg)) {
            const regex: RegExp = /^[0-9]+$/;
            return regex.test(arg);
        }
        return false;
    }

    public static isArray(arg: any): boolean {
        return !arg ? false : Array.isArray(arg);
    }

    public static isObject(arg: any): boolean {
        return !arg ? false : arg instanceof Object;
    }

    public static isPureObject(arg: any): boolean {
        return Utility.isObject(arg) && !Utility.isArray(arg);
    }

    public static isEmptyObject(arg: any): boolean {
        return Utility.isObject(arg) && 0 === Object.keys(arg).length;
    }

    public static isSameObject(a, b): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    public static isString(arg: any): boolean {
        return !arg ? false : 'string' === typeof (arg);
    }


    /**
     *      Utility
     */

    public static clone(source: any) {
        return JSON.parse(JSON.stringify(source));
    }

    public static nextTick(func: Function) {
        setTimeout(() => func(), 0);
    }

}

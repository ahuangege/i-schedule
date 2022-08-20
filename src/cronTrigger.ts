
import { Dic, I_trigger } from "./job";
import schedule from "./schedule";

let i_second = 0;
let i_minute = 1;
let i_hour = 2;
let i_day = 3;
let i_month = 4;
let i_week = 5;

let limit = [
    [0, 59],        // i_second
    [0, 59],        // i_minute
    [0, 23],        // i_hour
    [1, 31],        // i_day
    [1, 12],        // i_month
    [1, 7]          // i_week
];

type timeV = number | number[]

export class CronTrigger implements I_trigger {
    private cronTimeStr: string;
    private cronTimes: timeV[] = [];
    time: number = null as any;

    constructor(cronTime: string) {
        this.cronTimeStr = cronTime;
        let times = this.decodeCronTimeStr(cronTime);
        if (times != null) {
            this.cronTimes = times;
            this.time = this.nextExcuteTime();
        }
    }

    nextExcuteTime() {
        let cronTimes = this.cronTimes;
        let date = new Date(schedule.getTime() + 1000); // add 1000ms ,to the next time.
        date.setMilliseconds(0);
        let maxYear = date.getFullYear() + 1;

        while (true) {
            if (date.getFullYear() > maxYear) {
                console.error(`Can't compute the next time. ${this.cronTimeStr}`);
                return null as any;
            }

            if (!timeMatch(date.getMonth() + 1, cronTimes[i_month])) {
                let nextMonth = nextCronTime(date.getMonth() + 1, cronTimes[i_month]);

                if (nextMonth <= date.getMonth() + 1) {
                    date.setFullYear(date.getFullYear() + 1, 0, 1);
                    date.setHours(0, 0, 0);
                    continue;
                }
                date.setMonth(nextMonth - 1, 1);
                date.setHours(0, 0, 0);
            }

            if (!timeMatch(date.getDate(), cronTimes[i_day]) || !timeMatch(date.getDay(), cronTimes[i_week])) {
                let dayLimit = getDayLimit(date.getFullYear(), date.getMonth());
                let monthChange = false;

                do {
                    let nextDay = nextCronTime(date.getDate(), cronTimes[i_day]);

                    //If the date is in the next month, add month
                    if (nextDay <= date.getDate() || nextDay > dayLimit) {
                        date.setMonth(date.getMonth() + 1, 1);
                        date.setHours(0, 0, 0);
                        monthChange = true;
                        break;
                    }
                    date.setDate(nextDay);
                } while (!timeMatch(date.getDay(), cronTimes[i_week]));

                if (monthChange) {
                    continue;
                }
                date.setHours(0, 0, 0);
            }

            if (!timeMatch(date.getHours(), cronTimes[i_hour])) {
                let nextHour = nextCronTime(date.getHours(), cronTimes[i_hour]);

                if (nextHour <= date.getHours()) {
                    date.setDate(date.getDate() + 1);
                    date.setHours(nextHour, 0, 0);
                    continue;
                }
                date.setHours(nextHour, 0, 0);
            }

            if (!timeMatch(date.getMinutes(), cronTimes[i_minute])) {
                let nextMinute = nextCronTime(date.getMinutes(), cronTimes[i_minute]);

                if (nextMinute <= date.getMinutes()) {
                    date.setHours(date.getHours() + 1, nextMinute, 0);
                    continue;
                }
                date.setMinutes(nextMinute, 0);
            }

            if (!timeMatch(date.getSeconds(), cronTimes[i_second])) {
                let nextSecond = nextCronTime(date.getSeconds(), cronTimes[i_second]);

                if (nextSecond <= date.getSeconds()) {
                    date.setMinutes(date.getMinutes() + 1, nextSecond);
                    continue;
                }
                date.setSeconds(nextSecond);
            }
            break;
        }

        this.time = date.getTime();
        return this.time;
    }


    private decodeCronTimeStr(cronTimeStr: string) {
        let timeStrArr: string[] = cronTimeStr.trim().split(" ");
        for (let i = timeStrArr.length - 1; i >= 0; i--) {
            if (timeStrArr[i] === "") {
                timeStrArr.splice(i, 1);
            }
        }
        if (timeStrArr.length !== 6) {
            console.error(`cronTime wrong: ${cronTimeStr}`)
            return null;
        }

        let cronTimes: timeV[] = [];
        for (let i = 0; i < timeStrArr.length; i++) {
            let timeOne = this.decodeTimeStr(timeStrArr[i], i);
            if (timeOne == null) {
                console.error(`cronTime wrong: ${cronTimeStr}`)
                return null;
            }
            cronTimes[i] = timeOne;
        }

        return cronTimes;
    }

    private decodeTimeStr(time: string, index: number): timeV | null {
        if (time === "*") {
            return -1;
        }
        let arr = time.split(",");
        let timeWrong = false;
        let numObj: Dic<number> = {};
        for (let one of arr) {
            if (one.includes("-")) {
                if (!this.parseRange(one, numObj, index)) {
                    timeWrong = true;
                }
            } else if (one.includes("/")) {
                if (!this.parseStep(one, numObj, index)) {
                    timeWrong = true;
                }
            } else if (!this.parseNum(one, numObj, index)) {
                timeWrong = true;
            }
            if (timeWrong) {
                break;
            }
        }
        if (timeWrong) {
            return null;
        }
        if (index === i_week && numObj[7] != null) {  // week
            numObj[0] = 0;
            delete numObj[7];
        }
        let numArr: number[] = [];
        for (let x in numObj) {
            numArr.push(numObj[x]);
        }
        if (numArr.length === 0) {
            return null;
        }
        if (numArr.length === 1) {
            return numArr[0];
        }
        numArr.sort((a, b) => {
            return a < b ? -1 : 1
        });
        return numArr;
    }
    private parseNum(str: string, numObj: Dic<number>, index: number) {
        let num = parseInt(str);
        if (isNaN(num)) {
            return false;
        }
        if (this.isInLimit(num, index)) {
            numObj[num] = num;
        }
        return true;
    }
    private parseRange(str: string, numObj: Dic<number>, index: number) {
        let arr = str.split("-");
        if (arr.length !== 2) {
            return false;
        }
        let num1 = parseInt(arr[0]);
        let num2 = parseInt(arr[1]);
        if (isNaN(num1) || isNaN(num2) || num1 > num2) {
            return false;
        }
        for (let num = num1; num <= num2; num++) {
            if (this.isInLimit(num, index)) {
                numObj[num] = num;
            }
        }
        return true;
    }
    private parseStep(str: string, numObj: Dic<number>, index: number) {
        let arr = str.split("/");
        if (arr.length !== 2) {
            return false;
        }
        let start = parseInt(arr[0]);
        let step = parseInt(arr[1]);
        if (isNaN(start) || isNaN(step) || step <= 0) {
            return false;
        }
        let max = limit[index][1];
        for (let num = start; num <= max; num += step) {
            if (this.isInLimit(num, index)) {
                numObj[num] = num;
            }
        }
        return true;
    }
    private isInLimit(num: number, index: number) {
        if (num >= limit[index][0] && num <= limit[index][1]) {
            return true;
        }
        return false;
    }

}


function timeMatch(value: number, cronTime: timeV) {
    if (!Array.isArray(cronTime)) {
        if (cronTime === -1) {
            return true;
        }
        return value === cronTime;
    } else {
        if (value < cronTime[0] || value > cronTime[cronTime.length - 1]) {
            return false;
        }
        return cronTime.includes(value);
    }
}

function nextCronTime(value: number, cronTime: timeV): number {
    value += 1;

    if (!Array.isArray(cronTime)) {
        if (cronTime === -1) {
            return value;
        }
        return cronTime;
    } else {
        if (value <= cronTime[0] || value > cronTime[cronTime.length - 1]) {
            return cronTime[0];
        }

        for (let i = 0; i < cronTime.length; i++) {
            if (value <= cronTime[i]) {
                return cronTime[i];
            }
        }
        return cronTime[0]
    }
}

function getDayLimit(year: number, month: number) {
    let date = new Date(year, month + 1, 0);
    return date.getDate();
}

import { e_timeType, I_trigger } from "./job";
import schedule from "./schedule";

export class SimpleTrigger implements I_trigger {
    private timeType: e_timeType;
    private timeout: number;
    time: number;

    constructor(timeType: e_timeType, timeout: number) {
        this.timeType = timeType;
        if (this.timeType == e_timeType.interval && timeout < 10) {
            timeout = 10;
        }
        this.timeout = timeout;
        this.time = schedule.getTime() + timeout;
    }

    nextExcuteTime() {
        if (this.timeType === e_timeType.interval) {
            this.time = schedule.getTime() + this.timeout;
            return this.time;
        }
        return null as any;
    }
}
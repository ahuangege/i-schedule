import { CronTrigger } from "./cronTrigger";
import { SimpleTrigger } from "./simpleTrigger";


let jobId = 1;

export class Job {
    id: number;
    time: number = null as any;
    private handler: Function;
    private data?: any;
    private trigger: I_trigger = null as any;

    constructor(timeType: e_timeType, handler: Function, timeout: any, data?: any) {
        this.id = jobId++;
        this.handler = handler;
        this.data = data;

        if (timeType === e_timeType.timeout || timeType === e_timeType.interval) {
            this.trigger = new SimpleTrigger(timeType, timeout as any);
        } else if (timeType === e_timeType.cron) {
            this.trigger = new CronTrigger(timeout);
        }
        if (this.trigger) {
            this.time = this.trigger.time;
        }
    }

    excute() {
        try {
            this.handler(this.data);
        } catch (e) {
            process.nextTick(() => {
                throw e;
            });
        }
    }

    nextExcuteTime() {
        this.time = this.trigger.nextExcuteTime();
        return this.time;
    }
}


export enum e_timeType {
    timeout,
    interval,
    cron,
}

export interface I_trigger {
    time: number;
    nextExcuteTime(): number;
}

export interface Dic<T> {
    [key: string]: T
}

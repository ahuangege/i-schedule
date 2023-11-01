import { Dic, e_timeType, Job } from "./job";
import { Queue } from "./queue";
import { setTimeoutPro, TimeoutPro } from "./timeoutPro";

class Schedule {
    private timeDiff = 0;
    private queue = new Queue();
    private jobs: Dic<Job> = {};
    private timer: TimeoutPro = null as any;

    /** reset time */
    resetTime() {
        if (this.timeDiff === 0) {
            return;
        }
        this.timeDiff = 0;

        this.setTimer();
    }

    /** set time */
    setTime(time: number | string | Date) {
        let tmp = new Date(time);
        let tmpTime = tmp.getTime();
        if (isNaN(tmpTime)) {
            console.warn("setNowTime()  invalid time :", time);
            return;
        }
        this.timeDiff = tmpTime - Date.now();

        this.setTimer();
    }

    /** get time */
    getTime() {
        return Date.now() + this.timeDiff;
    }

    setTimeout(handler: Function, timeout: number, data?: any) {
        return this.createJob(e_timeType.timeout, handler, timeout, data);
    }

    setInterval(handler: Function, timeout: number, data?: any) {
        return this.createJob(e_timeType.interval, handler, timeout, data);
    }

    cron(handler: Function, cronTime: string, data?: any) {
        return this.createJob(e_timeType.cron, handler, cronTime, data);
    }

    cancelJob(jobId: number) {
        let job = this.jobs[jobId];
        if (!job) {
            return;
        }
        delete this.jobs[jobId];
        let curJob = this.queue.peek();
        this.queue.remove(job);
        if (curJob === job) {
            this.setTimer();
        }
    }

    private createJob(timeType: e_timeType, handler: Function, timeout: number | string, data?: any): number {
        let job = new Job(timeType, handler, timeout, data);
        if (job.time == null) {
            return 0;
        }
        this.jobs[job.id] = job;

        let queue = this.queue;
        let curJob = queue.peek();
        queue.enqueue(job);
        if (!curJob || job.time < curJob.time) {
            this.setTimer();
        }
        return job.id;
    }

    private setTimer() {
        if (this.timer) {
            this.timer.stop();
        }
        let job = this.queue.peek();
        if (job) {
            this.timer = setTimeoutPro(this.excuteJob.bind(this), job.time + 40 - this.getTime());
        }
    }

    private excuteJob() {
        let queue = this.queue;
        let job = queue.peek();
        while (job && job.time + 20 <= this.getTime()) {
            queue.dequeue();
            job.excute();

            if (this.jobs[job.id]) {    // may be be canceled
                let nextTime = job.nextExcuteTime();
                if (nextTime == null) {
                    delete this.jobs[job.id];
                } else {
                    queue.enqueue(job);
                }
            }

            job = queue.peek();
        }

        if (job) {
            this.setTimer();
        }
    }

}


export default new Schedule() 
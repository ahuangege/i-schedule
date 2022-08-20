const TimePer: number = 20 * 24 * 3600 * 1000;      // 不可大于int32

export function setTimeoutPro(callback: (...args: any[]) => void, ms: number, ...args: any[]): TimeoutPro {
    return new TimeoutPro(callback, ms, ...args)
}

export class TimeoutPro {
    private callback: (...args: any[]) => void;
    private ms: number;
    private args: any[];
    private timer: any = null as any;
    constructor(callback: (...args: any[]) => void, ms: number, ...args: any[]) {
        this.callback = callback;
        this.ms = ms;
        this.args = args;
        this.nextTime();
    }

    private nextTime() {
        let delay = this.ms;
        if (this.ms > TimePer) {
            delay = TimePer;
            this.ms -= TimePer;
        } else {
            this.ms = 0;
        }
        this.timer = setTimeout(this.func.bind(this), delay);
    }

    private func() {
        if (this.ms === 0) {
            this.callback(...this.args);
        } else {
            this.nextTime();
        }
    }

    /**
     * 停止计时器
     */
    stop() {
        clearTimeout(this.timer);
        this.timer = null as any;
    }
}

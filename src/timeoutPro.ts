const TimePer: number = 20 * 24 * 3600 * 1000;      // 不可大于int32

export function setTimeoutPro(callback: () => void, ms: number): TimeoutPro {
    return new TimeoutPro(callback, ms)
}

export class TimeoutPro {
    private callback: () => void;
    private ms: number;
    private timer: any = null as any;
    constructor(callback: () => void, ms: number,) {
        this.callback = callback;
        this.ms = ms;
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
            this.callback();
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

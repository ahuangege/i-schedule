const TimePer: number = 20 * 24 * 3600 * 1000;      // 不可大于int32

export function setTimeoutPro(callback: () => void, ms: number): TimeoutPro {
    return new TimeoutPro(callback, ms)
}

export class TimeoutPro {
    private callback: () => void;
    private time: number;
    private timeout: any = null as any;
    constructor(callback: () => void, ms: number,) {
        this.callback = callback;
        this.time = Date.now() + ms;
        this.nextTime();
    }

    private nextTime() {
        let delay = this.time - Date.now();
        if (delay > TimePer) {
            delay = TimePer;
        }
        this.timeout = setTimeout(this.func.bind(this), delay);
    }

    private func() {
        if (Date.now() >= this.time) {
            this.callback();
        } else {
            this.nextTime();
        }
    }

    /**
     * 停止计时器
     */
    stop() {
        clearTimeout(this.timeout);
        this.timeout = null as any;
    }
}

import { Job } from "./job";

export class Queue {

    private arr: Job[] = []

    enqueue(tile: Job) {
        this.arr.push(tile);
        this.move_up(this.arr.length - 1);
    }


    dequeue(): Job {
        if (this.arr.length === 0) {
            return undefined as any;
        }
        let min = this.arr[0];
        this.arr[0] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(0);
        return min;
    }

    peek() {
        return this.arr[0];
    }


    remove(tile: Job) {
        let index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        this.arr[index] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(index);
    }


    private move_up(idx: number) {
        let parentIdx = Math.floor((idx - 1) / 2);
        while (0 <= parentIdx) {
            if (this.arr[idx].time > this.arr[parentIdx].time) {
                break;
            }
            let tmp = this.arr[idx]
            this.arr[idx] = this.arr[parentIdx];
            this.arr[parentIdx] = tmp;
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    }

    private move_down(idx: number) {
        while (true) {
            let leftChildIdx = idx * 2 + 1;
            let rightChildIdx = idx * 2 + 2;
            let targetPos = idx;
            if (leftChildIdx < this.arr.length && this.arr[targetPos].time > this.arr[leftChildIdx].time) {
                targetPos = leftChildIdx;
            }

            if (rightChildIdx < this.arr.length && this.arr[targetPos].time > this.arr[rightChildIdx].time) {
                targetPos = rightChildIdx;
            }

            if (targetPos === idx) {
                break;
            }

            let tmp = this.arr[idx];
            this.arr[idx] = this.arr[targetPos];
            this.arr[targetPos] = tmp;
            idx = targetPos;
        }
    }

    // getLen() {
    //     return this.arr.length;
    // }
}

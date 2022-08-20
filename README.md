# i-schedule
a simple node scheduler

# Install

```bash
npm i i-schedule
```

# Usage

```

import schedule from "i-schedule";

// excute 2 seconds later
schedule.setTimeout(() => {

}, 2000);

// excute every 2 seconds
schedule.setInterval(() => {

}, 2000);

// excute every 5 seconds
schedule.cron(() => {

}, "0/5 * * * * *");

// change the schedule now time
schedule.setTime("2022-8-21 00:00:00");

```

The cron format consists of:
```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (1 - 7) (7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59)
```
cron string `" 1-3 2/3 1,2 * * * "`  means:  
`1-3` represents `1,2,3`  
`2/3` represents `2,5,8...`
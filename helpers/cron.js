import {RecurrenceRule} from "node-schedule";

export function generateCronRule(minute, hour) {
    const rule = new RecurrenceRule();
    rule.minute = minute;
    rule.hour = hour;
    rule.tz = 'US/Central';

    return rule
}

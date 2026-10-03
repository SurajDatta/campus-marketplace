/**
 * getTotalTimes.ts
 * util to be used to get the total times in a schedule
 * @AshokSaravanan222
 * 10-16-2024
 */

import { Availability, AvailabilityLocations, Schedule } from "@/types";

export const getCurrentDays = (schedule: Schedule, startingDate: Date): Availability => {
    return Object.keys(schedule.days as Availability).reduce((acc, curr) => {
        if (new Date(curr) < startingDate) {
            return acc
        } else {
            return { ...acc, [curr]: (schedule.days as Availability)[curr] }
        }
    }, {});
}

export const getTotalTimes = (schedule: Schedule, startingDate: Date): number => {
    return schedule.monday.length + schedule.tuesday.length + schedule.wednesday.length + schedule.thursday.length + schedule.friday.length + schedule.saturday.length + schedule.sunday.length + Object.values(getCurrentDays(schedule, startingDate)).reduce((acc, curr) => acc + curr.length, 0);
}

export const getTotalLocations = (sellerLocations: AvailabilityLocations): number[] => {
    const allLocations = Object.values(sellerLocations).map((day) => {
        return Object.values(day).reduce((acc2, curr2) => {
            return [...acc2, ...curr2]
        }, [])
    }).reduce((acc, curr) => [...acc, ...curr], [])
    const uniqueLocations = [...new Set(allLocations)]
    return uniqueLocations
}


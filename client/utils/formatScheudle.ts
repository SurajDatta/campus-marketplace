import { Availability, BuyerMeetups, MeetupLocations, MeetupSchedule, MeetupTimes } from "@/types";

const weekdayMap: { [key: string]: string } = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
};

export const mapWeekdayToDate = (days: string[], generalAvailability: MeetupSchedule | undefined) => {
    return days.reduce((acc, day) => {
        const date = new Date(day);
        const weekday = weekdayMap[date.getDay()];
        if (generalAvailability && generalAvailability[weekday]) {
            acc[day] = generalAvailability[weekday].map((date) => date.time);
        }
        return acc;
    }, {} as MeetupTimes);
}

export const newMapWeekdayToDate = (days: string[], generalAvailability: Availability | undefined) => {
    return days.reduce((acc, day) => {
        const date = new Date(day);
        const weekday = weekdayMap[date.getDay()];
        if (generalAvailability && generalAvailability[weekday]) {
            acc[day] = generalAvailability[weekday];
        }
        return acc;
    }, {} as Availability);
}

export const mapWeekdayToLocation = (days: string[], generalAvailability: MeetupSchedule | undefined) => {
    return days.reduce((acc, day) => {
        const date = new Date(day);
        const weekday = weekdayMap[date.getDay()];
        if (generalAvailability && generalAvailability[weekday]) {
            acc[day] = generalAvailability[weekday].reduce((acc, date) => {
                if (date.locations && date.locations.length >= 2) {
                    acc[date.time] = [date.locations[0], date.locations[1]];
                } else {
                    acc[date.time] = [true, false];
                }
                return acc;
            }, {} as MeetupLocations['key']);
        }
        return acc;
    }, {} as MeetupLocations);
}







export const formatSelectedLocations = (availability: MeetupTimes, locations: MeetupLocations) => {
    return Object.keys(locations).reduce((acc, day) => {
        if (availability[day] && locations[day] && Object.keys(locations[day]).length > 0) {
            acc[day] = availability[day].reduce((acc, time) => {
                acc[time] = locations[day][time];
                return acc;
            }, {} as MeetupLocations['key']);
        }
        return acc;
    }, {} as MeetupLocations)
}




// NEW
export const formatSelectedTimes = (availability: MeetupTimes) => {
    return Object.keys(availability).reduce((acc, day) => {
        if (availability[day] && availability[day].length > 0) {
            acc[day] = availability[day];
        }
        return acc;
    }, {} as MeetupTimes)
};

export const formatSelectedMeetups = (availability: MeetupTimes, buyerMeetups: BuyerMeetups): BuyerMeetups => {
    return Object.keys(availability).reduce((acc, day) => {
        if (availability[day] && availability[day].length > 0) {
            if (buyerMeetups[day]) {
                acc[day] = buyerMeetups[day];
            } else {
                acc[day] = availability[day].reduce((acc, time) => {
                    acc[time] = {
                        location: 0
                    }
                    return acc;
                }, {} as BuyerMeetups['key']);
            }
        }
        return acc;
    }, {} as BuyerMeetups)
}

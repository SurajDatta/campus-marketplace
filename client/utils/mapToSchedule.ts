import {Availability, BuyerMeetups, MeetupLocations, MeetupTimes, PotentialMeetup, Time } from "@/types";

export const mapToScheudle = (availability: MeetupTimes, locations: MeetupLocations, allTimes: Time[], sellerLocations: number[]): PotentialMeetup[] => {
    let meetupTimes = Object.keys(availability).map(date => {
      return availability[date].map((time) => {
        const [hours, minutes] = allTimes[(time - 1)].timez.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const datePart = new Date(date);
        const combinedDate = new Date(
          datePart.getFullYear(),
          datePart.getMonth(),
          datePart.getDate(),
          hour,
          minute
        );
        const location = locations[date]?.[time]?.[0] ? sellerLocations?.[0] : sellerLocations?.[1]; // change this up later to get the location id (TODOO)
        return { time: combinedDate.toISOString(), location: location };
      })
    }
    ).flat()
    meetupTimes.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()); // sort in ascending order
    return meetupTimes;
  }

  export const newMapToSchedule = (meetups: BuyerMeetups, allTimes: Time[]): PotentialMeetup[] => {
    let meetupTimes = Object.keys(meetups).map(date => {
      return Object.keys(meetups[date]).map((time) => {
        const timeAsNumber = Number(time)
        const [hours, minutes] = allTimes[(timeAsNumber - 1)].timez.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const datePart = new Date(date);
        const combinedDate = new Date(
          datePart.getFullYear(),
          datePart.getMonth(),
          datePart.getDate(),
          hour,
          minute
        );
        const location = meetups[date][timeAsNumber].location
        return { time: combinedDate.toISOString(), location: location };
      })
    }
    ).flat()
    meetupTimes.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()); // sort in ascending order
    return meetupTimes;
  }
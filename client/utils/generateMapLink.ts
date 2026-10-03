import { Coordinate } from "@/types";

export const generateMapLink = (location: Coordinate) => {
    const { latitude, longitude } = location;
    const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    return googleMapsLink; // This will work on both Apple and Google Maps by default
};
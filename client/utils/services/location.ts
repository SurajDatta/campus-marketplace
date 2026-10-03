/**
 * utils/services/location.ts
 * Will be used to call Noatiam's location service to get the location of the user.
 * @AshokSaravanan222
 * 09-09-2024
 */

import { Coordinate } from "@/types";
import { upsertNominatimLocation } from "./sell";


export const findLatLong = async (locationId: number | null, userId: string, addressQuery: string): Promise<{coords: Coordinate, address: string, name: string} | null> => {
    try {
        const query = addressQuery.replace(" ", "+");
        const response = await fetch(`https://nominatim.openstreetmap.org/search?addressdetails=1&q=${query}&format=jsonv2&limit=1`)
        const data = await response.json()

        // Check if the response contains the necessary fields
        if (data?.length > 0 && data[0]?.lat && data[0]?.lon) {
            const latitude = Number(data[0].lat);
            const longitude = Number(data[0].lon);
            const address = data[0].display_name;
            const name = data[0].name;
            const place_id = data[0].place_id;

            // Ensure lat and lon are valid numbers
            if (!isNaN(latitude) && !isNaN(longitude) && address && name && place_id) {
                const {success, error} = await upsertNominatimLocation(locationId, userId, name, place_id, address, latitude, longitude);
                if (success) {
                    return {
                        coords: { latitude, longitude },
                        address: address,
                        name: name
                    }
                } else {
                    throw new Error(error);
                }
            }
        }

        // If the response is invalid, throw an error
        throw new Error("Location not found or invalid response");

    } catch (error) {
        console.error(error);
        return null; // Ensure null is returned on failure
    }
};


export const findAddress = async (locationId: number | null, userId: string, latitude: number, longitude: number): Promise<{address: string, name: string} | null> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`)
        const data = await response.json()

        // Check if the response contains the necessary fields
        if (data?.display_name) {
            const address = data.display_name;
            const name = data.name;
            const place_id = data.place_id;

            // Ensure lat and lon are valid numbers
            if (address && name && place_id) {
                const {success} = await upsertNominatimLocation(locationId, userId, name, place_id, address, latitude, longitude);
                if (success) {
                    return {
                        address: address,
                        name: name
                    }
                } else {

                }
            }
        }

        // If the response is invalid, throw an error
        throw new Error("Location not found or invalid response");

    } catch (error) {
        console.error(error);
        return null; // Ensure null is returned on failure
    }

}
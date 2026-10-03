/**
 * services/sell.ts
 * Service functions used to handle sell operations, like creating a new item and updating seller preferences.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import { createClient } from "../supabase/server";

export const upsertItemListing = async (
    id: string | null,
    title: string,
    condition: string,
    categories: number[],
    price: number,
    description: string,
    sellerId: string,
    photoUrls: string[],
    photoSizes: { x: number, y: number, w: number, h: number }[],
    contact: boolean,
    schedule: boolean,
    contactPreferences: string[],
    schedulePreferences: string[],
    isActive: boolean,
    negotiable: boolean,
    returnAfterCancellation: boolean,
    safeMeetup: boolean,
    verified: boolean, // if the seller is verified
    development: boolean, // whether in a development environment
    last_edited: string
): Promise<{ success: boolean; error: string; id: string | null }> => {
    const supabase = createClient();
    const itemData: any = {
        title,
        condition,
        categories,
        price,
        description,
        seller_id: sellerId,
        photo_urls: photoUrls,
        photo_sizes: photoSizes,
        meetup_preferences: {
            quick: contact,
            scheduled: schedule,
        },
        active: isActive,
        contact_preferences: contactPreferences,
        schedule_preferences: schedulePreferences,
        negotiable: negotiable,
        return_after_cancellation: returnAfterCancellation,
        safe_meetup: safeMeetup,
        live: !development,
    };

    // Only add the 'id' key if it is not null
    if (id) {
        itemData['id'] = id;
        itemData['last_edited'] = last_edited;
    } else {
        itemData['listing_price'] = price;
    }

    if (development) {
        itemData['test_verified'] = verified;
    } else {
        itemData['verified'] = verified;
    }

    try {
        const { data, error } = await supabase
            .from('items')
            .upsert(itemData)
            .select('id')
            .single();

        if (error || !data) {
            console.error('Error upserting item:', error);
            return { success: false, error: error?.message || 'Unknown error', id: null };
        }

        return { success: true, error: "", id: data.id };
    } catch (error: any) {
        console.error('Error during upsert operation:', error);
        return { success: false, error: error.message, id: null };
    }
};


export const uploadItemPhotos = async (
    photoData: FormData,
    itemId: string
): Promise<{ success: boolean; photoURLs: string[]; error: string }> => {
    const supabase = createClient();
    const photoURLs: string[] = [];
    const errors: string[] = [];

    for (let key of photoData.keys()) {
        try {
            const photo = photoData.get(key) as File;
            if (!photo) {
                throw new Error('Invalid photo file');
            }

            const timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Generate a timestamp in UTC
            const filePath = `item/${itemId}/${timestamp}_${photo.name}`;

            const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, photo);

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            photoURLs.push(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${filePath}`);
        } catch (error: any) {
            console.error('Error processing image:', error);
            // Push a default URL if there's any error in processing or uploading
            photoURLs.push(process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp");
            errors.push(error.message);
        }
    }

    const success = errors.length === 0;
    const error = success ? "" : errors.join("; ");

    return { success, photoURLs, error };
};

export const uploadLocationPhoto = async (
    photoData: FormData,
    locationId: number
): Promise<{ success: boolean; photoURL: string; error: string }> => {
    const supabase = createClient();
    const photo = photoData.get("photo") as File;
    if (!photo) {
        return { success: false, photoURL: "", error: "Invalid photo file" };
    }

    const timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Generate a timestamp in UTC
    const filePath = `locations/${locationId}/${timestamp}_${photo.name}`;

    const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, photo);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { success: false, photoURL: "", error: uploadError.message };
    }

    const photoURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${filePath}`;
    return { success: true, photoURL: photoURL, error: "" };
}

export const updateLocation = async (locationId: number, name: string, photoURL: string, address: string, notes: string, latitude: number, longitude: number): Promise<{ success: boolean, error: string }> => {
    const supabase = createClient();
    const { error } = await supabase
        .from('locations')
        .update({ id: locationId, name: name, img_url: photoURL, address: address, notes: notes, latitude: latitude, longitude: longitude })
        .eq('id', locationId);

    if (error) {
        console.error('Error updating location:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const deleteLocation = async (locationId: number): Promise<{ success: boolean, error: string }> => {
    const supabase = createClient();
    const { error } = await supabase
        .from('locations')
        .update({ id: locationId, deleted: true })
        .eq('id', locationId);

    if (error) {
        console.error('Error deleting location:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const getAllTimes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('times')
        .select('*');

    if (error) {
        console.error('Error fetching all times:', error);
        return [];
    }
    return data;
};

export const createLocation = async (userId: string, name: string): Promise<{ success: boolean, error: string, id: number }> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('locations')
        .insert({ name: name, created_by: userId })
        .select('id')
        .single();

    if (error) {
        console.error('Error creating location:', error);
        return { success: false, error: error.message, id: 0 };
    }
    return { success: true, error: "", id: Number(data.id) };
}

export const upsertNominatimLocation = async (locationId: number | null, userId: string, name: string, placeId: string, address: string, latitude: number, longitude: number): Promise<{ success: boolean, error: string, id: number }> => {
    const supabase = createClient();
    const updates = locationId ? { 
        id: locationId,
        created_by: userId,
        name: name,
        place_id: placeId,
        address: address,
        latitude: latitude,
        longitude: longitude
    } : {
        created_by: userId,
        name: name,
        place_id: placeId,
        address: address,
        latitude: latitude,
        longitude: longitude
    }
    const { data, error } = await supabase
        .from('locations')
        .upsert(updates)
        .select('id')
        .single();

    if (error) {
        console.error('Error creating location:', error);
        return { success: false, error: error.message, id: 0 };
    }
    return { success: true, error: "", id: Number(data.id) };
}


export const updateCustomerId = async (userId: string, customerId: string, development: boolean, isActive: boolean): Promise<{ success: boolean, error: string }> => {
    const supabase = createClient();
    const updates = development ? {
        test_customer_id: isActive ? customerId : null
    } : {
        customer_id: isActive ? customerId : null
    }
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating customer ID:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateSellerVerifiedItems = async (userId: string, development: boolean, status: boolean): Promise<{ success: boolean, error: string }> => {
    const supabase = createClient();
    const updates = development ? {
        test_verified: status
    } : {
        verified: status
    }
    const { error } = await supabase
        .from('items')
        .update(updates)
        .eq('seller_id', userId);
    if (error) {
        console.error('Error updating verified items:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const fetchSellerId = async (customerId: string): Promise<{ sellerId: string | null, development: boolean | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select("*")
        .or(`customer_id.eq.${customerId}, test_customer_id.eq.${customerId}`)
        .single();
    if (error) {
        console.error('Error fetching seller ID:', error);
        return { sellerId: null, development: null };
    }
    const id = data?.id;
    let development = null;
    if (data.test_customer_id === customerId) {
        development = true;
    } else if (data.customer_id === customerId) {
        development = false;
    }
    return { sellerId: id, development: development };
}

export const updateUserListingsCreated = async (userId: string, newListingsCreated: number, development: boolean): Promise<{ success: boolean, error: string }> => {
    const supabase = createClient();
    const updates = development ? {
        test_listings_created: newListingsCreated
    } : {
        listings_created: newListingsCreated
    }
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating listings created:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const markSellerJourneyComplete = async (userId: string, development: boolean): Promise<{ success: boolean, error: string }> => {
    const supabase = createClient();
    const updates = development ? {
        test_completed_journey: true
    } : {
        completed_journey: true
    }
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error marking journey complete:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const deleteItem = async (itemId: string) => {
    const client = createClient();
    const { error } = await client
        .from('items')
        .update({
            deleted: true
        })
        .eq("id", itemId)

    if (error) {
        return {success: false, error: error.message};
    }
    return {success: true, error: ""};
}

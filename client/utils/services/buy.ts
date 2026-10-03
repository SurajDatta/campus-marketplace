/**
 * services/buy.ts
 * Service functions used to handle buy operations, like fetching items and meetup statuses.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import { Item, Meetup, MeetupStatus, Location, Coordinate, PotentialMeetup } from "@/types";
import { createClient } from "../supabase/server";
import { createAlert } from "./alerts";
import { Database, Json } from "@/database.types";

export const confirmBuyer = async (meetupId: string) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('meetup')
        .update({ buyer_confirmed: true, buyer_confirmed_at: date })
        .eq('id', meetupId);
    if (error) {
        return { success: false, error: error.message };
    } else {
        return { success: true, error: "" };
    }

}

export const unconfirmBuyer = async (meetupId: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('meetup')
        .update({ buyer_confirmed: false, buyer_confirmed_at: null })
        .eq('id', meetupId);
    if (error) {
        return { success: false, error: error.message };
    } else {
        return { success: true, error: "" };
    }

}

export const confirmSeller = async (meetupId: string) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('meetup')
        .update({ seller_confirmed: true, seller_confirmed_at: date })
        .eq('id', meetupId);
    if (error) {
        return { success: false, error: error.message };
    } else {
        return { success: true, error: "" };
    }
}

export const checkInBuyer = async (meetupId: string, buyerNotes: string, checkedIn: boolean, title: string, imgURL: string, link: string, buyerId: string, sellerId: string, checkInDate: string) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('meetup')
        .update({ buyer_met: true, buyer_met_at: date })
        .eq('id', meetupId);
    if (error) {
        return { success: false, error: error.message };
    } else {
        const sellerAlertId = await createAlert(sellerId, `The buyer has successfully checked in to the meetup at ${checkInDate} for ${title}. Meet the buyer at the specified meetup location, using instructions on the MyStuff page.`, imgURL, link);
        if (!sellerAlertId) {
            return { success: false, error: "Error creating seller alert" };
        }

        return { success: true, error: "" };
    }
}

export const checkInSeller = async (meetupId: string, sellerNotes: string, checkedIn: boolean, title: string, imgURL: string, link: string, buyerId: string, sellerId: string, checkInDate: string) => {
    const date = new Date().toISOString()
    const supabase = createClient();
    // if buyer has met, then we should make the buyer
    const { error } = await supabase
        .from('meetup')
        .update({ seller_met: true, seller_met_at: date, seller_notes: sellerNotes })
        .eq('id', meetupId);
    if (error) {
        return { success: false, error: error.message };
    } else {

        const buyerAlertId = await createAlert(buyerId, `The seller has successfully checked in to the meetup at ${checkInDate} for ${title}. Meet the seller at the specified meetup location, using instructions on the MyStuff page.`, imgURL, link);
        if (!buyerAlertId) {
            return { success: false, error: "Error creating buyer alert" };
        }

        return { success: true, error: "" };
    }
}


// Function to fetch item by ID
export const fetchItemById = async (itemId: string, development: boolean): Promise<Item | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .eq('live', !development)
        .single();

    if (error) {
        console.error('Error fetching item:', error);
        return null;
    }

    return data;
};

export const fetchBuyItems = async (development: boolean) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('active', true)
        .eq('live', !development)
        .eq('status', 'available');

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }

    return data;
}

export const fetchSellItems = async (userId: string, development: boolean) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('seller_id', userId)
        .eq('live', !development)
        .or(`status.eq.available, status.eq.canceled`);

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }

    return data;
}

export const fetchBuyingItems = async (userId: string, development: boolean) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('buyer_id', userId)
        .eq('live', !development)
        .neq('status', 'available')

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }

    return data;
}

export const fetchSellingItems = async (userId: string, development: boolean) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('seller_id', userId)
        .eq('live', !development)
        .neq('status', 'available')

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }

    return data;
}


export const fetchCategories = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data;
};

export const fetchLocations = async (userId: string): Promise<Location[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .or(`created_by.eq.${userId},created_by.is.null`)

    if (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
    return data;
};

export const fetchMeetup = async (meetupId: string | null): Promise<Meetup | null> => {
    const supabase = createClient();
    if (!meetupId) {
        return null;
    }
    const { data, error } = await supabase
        .from('meetup')
        .select('*')
        .eq('id', meetupId)
        .single();

    if (error) {
        console.error('Error fetching meetup:', error);
        return null;
    }
    return data;
};


export const getCategory = async (categoryId: number) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data.name;
};

export const updateMeetupConfirmed = async (meetupId: string, time: string, location: number, paymentIntentId: string | null) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const expiry_time = new Date(new Date(time).getTime() + 60 * 60 * 1000).toISOString() // 1 hour after
    const { error } = await supabase
        .from('meetup')
        .update({ time: time, location: location, meetup_confirmed_at: date, expires_at: expiry_time, confirm_payment_intent_id: paymentIntentId })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating times:', error);
        return { success: false };
    }
    return { success: true };
};

export const updatePrice = async (meetupId: string, price: number) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('meetup')
        .update({ meetup_price: price })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating price:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const getLocationsByIds = async (locationIds: number[]): Promise<Location[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .in('id', locationIds);

    if (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
    return data;
};

export const updateTimeCompleted = async (meetupId: string, time: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('meetup')
        .update({ time_completed: time })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating time met:', error);
        return { success: false };
    }
    return { success: true };
}

export const updateFavorites = async (userId: string, newFavorites: string[]) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ favorites: newFavorites })
        .eq('id', userId);

    if (error) {
        console.error('Error updating favorite:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const createMeetup = async (buyerId: string, sellerId: string, listedAt: string, contactEnabled: boolean, scheduleEnabled: boolean, safeMeetupEnabled: boolean, contact: string[], potentialMeetups: PotentialMeetup[], title: string, description: string, condition: string, price: number, photoURLs: string[], photoSizes: Json[], negotiable: boolean, development: boolean, expiresAt: string, paymentIntentId: string, itemId: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('meetup')
        .insert({
            buyer_id: buyerId,
            seller_id: sellerId,
            listed_at: listedAt,
            contact_enabled: contactEnabled,
            schedule_enabled: scheduleEnabled,
            safe_meetup_enabled: safeMeetupEnabled,
            contact: contact,
            potential_meetups: potentialMeetups,
            meetup_price: price,
            item_id: itemId,
            item_title: title,
            item_description: description,
            item_condition: condition as Database['public']['Tables']['items']['Row']['condition'],
            item_price: price,
            item_photo_urls: photoURLs,
            item_photo_sizes: photoSizes,
            item_negotiable: negotiable,
            live: !development,
            expires_at: expiresAt,
            payment_intent_id: paymentIntentId
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error inserting meetup:', error);
    }

    if (data !== null) {
        return data
    } else {
        console.error('Data is null');
    }
}

export const rescheduleMeetup = async (meetupId: string, potentialMeetups: PotentialMeetup[]) => {
    const supabase = createClient();
    const date = new Date().toISOString()

    const { error } = await supabase
        .from('meetup')
        .update({
            potential_meetups: potentialMeetups,
            rescheduled: true,
            rescheduled_at: date,
            schedule_enabled: true,
            buyer_met: false,
            seller_met: false,
            buyer_met_at: null,
            seller_met_at: null,
            buyer_notes: null,
            seller_notes: null,
            buyer_location: null,
            seller_location: null,
        })
        .eq('id', meetupId);

    if (error) {
        console.error('Error rescheduling meetup:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateMeetupStatus = async (meetupId: string, newStatus: MeetupStatus) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('meetup')
        .update({ status: newStatus })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating meetup table with status:', error);
        return { success: false }
    }
    return { success: true }
}

export const updateMeetupCancelFee = async (meetupId: string, cancelFee: number | null) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('meetup')
        .update({ cancel_fee: cancelFee })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating profiles table with cancel fee:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateMeetupCancelReason = async (meetupId: string, cancelReason: string | null) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('meetup')
        .update({ cancel_reason: cancelReason })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating profiles table with cancel reason:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateItemQuantity = async (itemId: string, quantity: number) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('items')
        .update({ quantity: quantity })
        .eq('id', itemId);

    if (error) {
        console.error('Error updating profiles table with quantity:', error);
        return { success: false }
    }
    return { success: true }
}

export const updateActiveStatus = async (itemId: string, active: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('items')
        .update({ active: active })
        .eq('id', itemId);

    if (error) {
        console.error('Error updating profiles table with active:', error);
        return { success: false }
    }
    return { success: true }
}

export const updatePaymentDetails = async (meetupId: string, paymentIntentId: string) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('meetup')
        .update({ payment_intent_id: paymentIntentId, payment_completed_at: date })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating profiles table with buyer:', error);
        return { success: false }
    }
    return { success: true }
}


export const updateExpiryTime = async (meetupId: string, isoExpiryTime: string | null) => {
    const supabase = createClient()

    const { error } = await supabase
        .from('meetup')
        .update({ expires_at: isoExpiryTime })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating expiry time:', error);
        return { success: false };
    }
    return { success: true };

}

export const createMessage = async (meetupId: string, senderId: string, message: string, location: Coordinate | null) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('messages')
        .insert({ meetup_id: meetupId, sender_id: senderId, message: message, location: location })
    if (error) {
        console.error('Error creating message:', error);
        return { success: false, error: error.message };
    } else {
        return { success: true, error: "" };
    }
}

export const updateCheckInLocation = async (meetupId: string, buyer: boolean, location: Coordinate) => {
    const supabase = createClient();

    const { error } = await supabase
        .from('meetup')
        .update(buyer ? { buyer_location: location } : { seller_location: location })
        .eq('id', meetupId);

    if (error) {
        console.error('Error updating check-in location:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };

}

export const updateItemClick = async (userId: string, itemId: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('clicks')
        .insert({ user_id: userId, item_id: itemId });

    if (error) {
        console.error('Error updating item click:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

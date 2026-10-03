import Stripe from "stripe"
import { Database } from "./database.types"
import { User as AuthUser } from "@supabase/supabase-js"
import { SupabaseClient } from '@supabase/supabase-js'

export type User = AuthUser
export type Item = Database['public']['Tables']['items']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Meetup = Database['public']['Tables']['meetup']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type MeetupType = Database['public']['Enums']['meetup_type']
export type Time = Database['public']['Tables']['times']['Row']
export type Locations = Database['public']['Tables']['profiles']['Row']['seller_locations']
export type Categories = Database['public']['Tables']['categories']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type Schedule = Database['public']['Tables']['schedules']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Calendar = Database['public']['Tables']['calendar']['Row']

export type PurchaseStatus = Database['public']['Enums']['purchase_status']
export type PhotoType = Database['public']['Enums']['photo']
export type AccountStatus = Database['public']['Enums']['account_status']
export type MeetupStatus = Database['public']['Enums']['meetup_status']
export type ContactSubject = Database['public']['Enums']['subject']
export type Device = Database['public']['Tables']['credentials']['Row']
export type Biometric = Database['public']['Tables']['biometric']['Row']

export type EmailSendRequest = {
    email: string;
    subject: string;
    message: string;
}


export type CheckoutType = "subscription" | "buy" | "confirm"

export type CheckoutMetadata = {
    development: string,
    origin: string,
    item_id: string,
    buyer_id: string, 
    seller_id: string, 
    contact_enabled: string, 
    schedule_enabled: string, 
    safe_meetup_enabled: string,
    contact: string, 
    potential_meetups: string, 
    price: string, 
    expiry_time: string,
}

export type ConfirmMetadata = {
    meetup_id: string,
    buyer_id: string,
    seller_id: string,
    item_title: string,
    item_photo: string,
    time: string,
    location: string,
}

export type PaymentIntentType = "purchase" | "confirmation"

export type PaymentIntentData = {
    origin: string,
    item_id: string,
    development: string,
    meetup_id: string,
}

export type SubscriptionData = {
    user_id: string,
    development: string,
}

// for buyer and seller realtime location.
export type Coordinate = {
    latitude: number;
    longitude: number;
}

export type Click = {
    user_id: string;
    time: string;
}
export type MeetupTimes = {
    [key: string]: number[]
}

export type MeetupLocations = {
    [key: string]: {
        [timeId: number]: [boolean, boolean]; // [primary, secondary]
    };
}

export type PotentialMeetup = {
    time: string;
    location: number;
}

export type MeetupSchedule = {
    [key: string]: { time: number, locations: boolean[] }[]
}

export type MeetupPreferences = {
    quick: boolean;
    scheduled: boolean;
}

export type TypedSupabaseClient = SupabaseClient<Database>

export type Availability = { [key: string]: number[] }

export type AvailabilityLocations = {
    [key: string]: {
        [timeId: number]: number[]
    };
}

export type BuyerMeetups = {
    [key: string]: {
        [timeId: number]: {
            location: number;
        }
    };
}

export type SellerSchedule = {
    [key: string]: { location: number, times: Availability }
}

export type ItemSchedule = { id: string, times: Availability }[]
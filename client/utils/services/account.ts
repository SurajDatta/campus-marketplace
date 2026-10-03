/**
 * services/account.ts
 * Service functions used to handle account operations, like changing password/phone and updating account information.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import { createClient } from "../supabase/server";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { resendSignupConfirmationEmail, resendSignupConfirmationSMS } from "./auth";
import { MeetupSchedule, Profile } from "@/types";
import { Json } from "@/database.types";

export const clearPhone = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase.rpc('clear_user_phone', {
        user_id: userId,
    })
    if (error) {
        return { success: false, error: error.message }
    }
    return { success: true, error: "" }
}


export const updatePhone = async (userId: string, phone: string, oldPhoneConfirm: boolean) => { // updates phone and sends an otp
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !url) {
        return { success: false, error: "Service role key or URL not set" };
    }
    const authSupabase = createAuthClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    const phoneConfirm = false; // always set to false for now
    const { data, error } = await authSupabase.auth.admin.updateUserById(
        userId,
        { phone: phone, phone_confirm: !phoneConfirm }
    )
    if (error) {
        console.error('Error updating email:', error);
        return { success: false, error: error.message, errorCode: error.code };
    } else {
        if (phoneConfirm) {
            const { error: phoneError } = await resendSignupConfirmationSMS(phone)
            if (phoneError) {
                return { success: false, errorCode: phoneError.code ?? "", user: data.user };
            }
        }
        return { success: true, errorCode: "", user: data.user };
    }
}

export const updateExistingEmail = async (email: string, redirectURL: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
        email: email,
    }, { emailRedirectTo: redirectURL })
    const { error: resendError } = await supabase.auth.resend({
        type: 'email_change',
        email: email,
    })
    if (resendError) {
        console.error('Error updating email:', error);
        return { success: false, error: resendError.message };
    }
    if (error) {
        console.error('Error updating email:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateEmail = async (userId: string, email: string, emailConfirm: boolean, redirectURL: string) => {
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !url) {
        return { success: false, error: "Service role key or URL not set" };
    }
    const authSupabase = createAuthClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    const {error } = await authSupabase.auth.admin.updateUserById(
        userId,
        { email: email, email_confirm: !emailConfirm }
    )
    if (error) {
        console.error('Error updating email:', error);
        return { success: false, error: error.message, errorCode: error.code };
    } else {
        if (emailConfirm) {
            const { error: emailError } = await resendSignupConfirmationEmail(email, redirectURL)
            if (emailError) {
                return { success: false, errorCode: "", error: emailError };
            }
        }
        return { success: true, errorCode: "", error: "" }
    }
}

export const updateName = async (userId: string, firstName: string | null, lastName: string | null) => {
    const supabase = createClient();
    let update = {} as { first_name?: string, last_name?: string }

    if (firstName) {
        update.first_name = firstName
    }
    if (lastName) {
        update.last_name = lastName
    }


    const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateNotificationSettings = async (userId: string, email: boolean, sms: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: email, sms_notifications: sms })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const changePassword = async (newPassword: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth
        .updateUser({ password: newPassword })

    if (error) {
        console.error('Error updating password:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateSellerLocations = async (userId: string, locations: number[]) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, seller_locations: locations, last_updated_preferences: date });

    if (error) {
        console.error('Error inserting location:', error);
        return { success: false };
    }
    return { success: true };
}

export const updateSellerContact = async (userId: string, contact: string[]) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .update({ seller_contact: contact, last_updated_preferences: date })
        .eq('id', userId);

    if (error) {
        console.error('Error updating seller contact:', error);
        return { success: false };
    }
    return { success: true };
}


export const updateTimes = async (userId: string, timeData: MeetupSchedule) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .update({ seller_schedule: timeData, last_updated_preferences: date })
        .eq('id', userId);

    if (error) {
        console.error('Error updating times:', error);
        return { success: false };
    }
    return { success: true };
};

export const updateSchedule = async (userId: string) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .update({ last_updated_preferences: date })
        .eq('id', userId);

    if (error) {
        console.error('Error updating schedule:', error);
        return { success: false };
    }
    return { success: true };
}

export const updateTimeSchedule = async (scheduleId: string, monday: number[], tuesday: number[], wednesday: number[], thursday: number[], friday: number[], saturday: number[], sunday: number[], days: Json) => {
    const supabase = createClient();
    const { error } = await supabase
        .from("schedules")
        .update({
            monday: monday,
            tuesday: tuesday,
            wednesday: wednesday,
            thursday: thursday,
            friday: friday,
            saturday: saturday,
            sunday: sunday,
            days: days
        })
        .eq('id', scheduleId);

    if (error) {
        console.error('Error updating schedule:', error);
        return { success: false };
    }
    return { success: true };
}

export const updateLocationSchedule = async (scheduleId: string, newLocation: number) => {
    const supabase = createClient();
    const { error } = await supabase
        .from("schedules")
        .update({
            location: newLocation
        })
        .eq('id', scheduleId);

    if (error) {
        console.error('Error updating schedule:', error);
        return { success: false };
    }
    return { success: true };
}

export const updateContactDetails = async (userId: string, contactDetails: { [key: string]: string }) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ contact_details: contactDetails })
        .eq('id', userId);

    if (error) {
        console.error('Error updating contact details:', error);
        return { success: false, error: error.message };
    }
    return { success: true, error: "" };
}

export const updateMeetupPreferences = async (userId: string, quick: boolean, scheduled: boolean) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .update({
            seller_meetup: {
                quick: quick,
                scheduled: scheduled
            }, last_updated_preferences: date
        })
        .eq('id', userId);

    if (error) {
        console.error('Error updating meetup preferences:', error);
        return { success: false };
    }
    return { success: true };
}

// Function to fetch user by ID
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.error('No user found with the provided ID:', userId);
            return null;
        }
        console.error('Error fetching user:', error);
        return null;
    }

    return data;
};

export const updateSignupTime = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ signed_up_at: new Date().toISOString() })
        .eq('id', userId);
    if (error) {
        console.error('Error updating signup time:', error);
        return { success: false, error: error.message };
    } else {
        return { success: true, error: "" };
    }
}


// function to upload to supabase
export const createSellerAccount = async (userId: string, stripeAccountId: string, development: boolean) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const updates = development ? {
        test_account_id: stripeAccountId,
        test_account_created_at: date
    } : {
        account_id: stripeAccountId,
        account_created_at: date
    }
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        return { success: false, error: error.message }
    }
    return { success: true, error: "" }
}

export const deleteSellerAccount = async (userId: string, development: boolean) => {
    const supabase = createClient();
    const updates = development ? {
        test_account_id: null,
        test_account_created_at: null,
        test_account_requirements: []
    } : {
        account_id: null,
        account_created_at: null,
        account_requirements: []
    }
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        return { success: false, error: error.message }
    }
    return { success: true, error: "" }
}


export const updateAccountRequirements = async (accountId: string, requirements: string[], development: boolean) => {
    const supabase = createClient();
    if (development) {
        const { error } = await supabase
            .from('profiles')
            .update({ test_account_requirements: requirements })
            .eq('test_account_id', accountId)
        if (error) {
            console.error('Error updating profiles table with verification status:', error);
            return { success: false }
        }
    } else {
        const { error } = await supabase
            .from('profiles')
            .update({ account_requirements: requirements })
            .eq('account_id', accountId)
        if (error) {
            console.error('Error updating profiles table with verification status:', error);
            return { success: false }
        }
    }
    return { success: true }
}

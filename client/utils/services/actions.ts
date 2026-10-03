/**
 * services/actions.ts
 * Service functions that are miscelaneous and do not fit into a specific category.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server";
import { ContactSubject } from "@/types";
import { createClient } from "../supabase/server";

export const canInitSupabaseClient = () => {
  try {
    createClient();
    return true;
  } catch (e) {
    return false;
  }
};

export const fetchGoogleMapsAPIKey = async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Google Maps API key not found.', key: '' };
  } else {
    return { success: true, error: null, key: apiKey };
  }
}

export const sendContactMessage = async (name: string, subject: ContactSubject, message: string) => {
  const supabase = createClient();

  // Insert the message
  const { error } = await supabase
    .from('contact')
    .insert({
      name: name,
      subject: subject,
      message: message
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: '' };
}

export const markBannerViewed = async (userId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ viewed_banner: true })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: '' };
}

export const markInitialModalViewed = async (userId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ viewed_initial: true })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message, id: userId };
  }

  return { success: true, error: '', id: userId };
}

export const subscribeUserStatus = async (userId: string, status: boolean) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ subscribed: status })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: '' };
}
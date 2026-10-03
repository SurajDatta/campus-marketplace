/**
 * services/google.ts
 * Service functions used to handle google login.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-09-02
 *
 *
 */
"use server"
import {
  google,   // The top level object used to access services
  calendar_v3,
  Auth,     // Namespace for auth related types
} from 'googleapis';

import { createClient } from "../supabase/server";
import { Calendar, MeetupTimes, Time } from '@/types';
import { fetchUser } from './auth';

export const fetchCalendar = async (calendarId: string): Promise<Calendar | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar')
    .select('*')
    .eq('id', calendarId)
    .single();

  if (error) {
    console.error('Error fetching calendar:', error.message)
    return null
  }
  return data
}

export const addGoogleCalendar = async (callbackURL: string, redirectURL: string): Promise<{ success: boolean, error: string, url: string }> => {
  const oauth2Client = await getAuthenticatedClient(callbackURL);
  if (!oauth2Client) {
    return { success: false, error: "Error getting authenticated client.", url: "" }
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar.freebusy',
  ];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt: 'consent',
    // If you only need one scope, you can pass it as a string
    scope: scopes,
    state: redirectURL,
  });
  return { success: true, error: "", url: url }
}

export const addCodes = async (code: string, callbackURL: string): Promise<{ success: boolean, error: string }> => {
  const user = await fetchUser();
  if (!user) {
    return { success: false, error: "Error fetching user." }
  }

  const oauth2Client = await getAuthenticatedClient(callbackURL);
  if (!oauth2Client) {
    return { success: false, error: "Error getting authenticated client." }
  }
  const { tokens } = await oauth2Client.getToken(code)
  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    return { success: false, error: "Error getting tokens." }
  }
  const expiryDate = new Date(tokens.expiry_date)
  const calendarId = await upsertCalendar(tokens.access_token, tokens.refresh_token, expiryDate.toISOString(), undefined, user.id)
  if (!calendarId) {
    return { success: false, error: "Error creating calendar." }
  }
  return { success: true, error: "" }
}

export const removeGoogleCalendar = async (calendarId: string): Promise<{ success: boolean, error: string }> => {
  const userCalendar = await fetchCalendar(calendarId)
  if (!userCalendar) {
    return { success: false, error: "Error fetching calendar." }
  }

  const oauth2Client = await getAuthenticatedClient(undefined, userCalendar);
  if (!oauth2Client) {
    return { success: false, error: "Error getting authenticated client." }
  }
  const accessToken = oauth2Client.credentials.access_token
  if (!accessToken) {
    return { success: false, error: "Error getting access token." }
  }
  const response = await oauth2Client.revokeToken(accessToken)
  if (response.status === 200) {
    const { success, error } = await updateCalendarActive(userCalendar.id, false)
    if (!success) {
      return { success: false, error: error }
    }
  } else {
    return { success: false, error: "Error revoking token." }
  }
  return { success: true, error: "" }
}

export const upsertCalendar = async (provider_token: string, provider_refresh_token: string, expires_at: string, calendarId: string | undefined, userId: string): Promise<string | null> => {
  const supabase = createClient();
  let updates = calendarId ? {
    provider_token: provider_token,
    refresh_token: provider_refresh_token,
    expires_at: expires_at,
    user_id: userId,
  } : {
    id: calendarId,
    provider_token: provider_token,
    refresh_token: provider_refresh_token,
    expires_at: expires_at,
    user_id: userId,
  }
  const { data, error } = await supabase
    .from('calendar')
    .upsert(updates)
    .select('id')
    .single();

  if (error) {
    console.error('Error updating tokens:', error.message)
    return null
  }
  return data.id
}

export const updateCalendarActive = async (calendarId: string, active: boolean): Promise<{ success: boolean, error: string }> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('calendar')
    .update({ active: active })
    .eq('id', calendarId);

  if (error) {
    console.error('Error updating calendar active:', error.message)
    return { success: false, error: error.message }
  }
  return { success: true, error: "" }
}

export const fetchTokens = async (calendarId: string): Promise<{ provider_token: string, provider_refresh_token: string, expires_at: string } | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar')
    .select('provider_token, refresh_token, expires_at')
    .eq('id', calendarId)
    .single();

  if (error) {
    console.error('Error fetching tokens:', error.message)
    return null
  }
  return { provider_token: data.provider_token, provider_refresh_token: data.refresh_token, expires_at: data.expires_at }
}


async function getAuthenticatedClient(callbackURL?: string, userCalendar?: Calendar): Promise<Auth.OAuth2Client | null> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,     // Your Google client ID
    process.env.GOOGLE_CLIENT_SECRET, // Your Google client secret
    callbackURL     // Your redirect URI
  );

  if (!userCalendar) {
    return oauth2Client;
  }

  oauth2Client.setCredentials({
    access_token: userCalendar.provider_token,
    refresh_token: userCalendar.refresh_token,
  });
  if (new Date(userCalendar.expires_at) < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (credentials.access_token && credentials.refresh_token && credentials.expiry_date) {
      const expiryDate = new Date(credentials.expiry_date)
      const id = await upsertCalendar(credentials.access_token, userCalendar.refresh_token, expiryDate.toISOString(), userCalendar.id, userCalendar.user_id)
      if (!id) {
        console.error('Error updating tokens:', credentials)
        return null
      }
      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
      });
      return oauth2Client;
    } else {
      console.error('Error refreshing tokens:', credentials)
      return null
    }
  } else {
    return oauth2Client;
  }
}



export const fetchBusyTimes = async (userCalendar: Calendar, days: string[], allTimes: Time[]): Promise<MeetupTimes | null> => {
  let oauth2Client;
  try {
    oauth2Client = await getAuthenticatedClient(undefined, userCalendar);
  } catch (error: any) {
    // need to reset the calendarId for the user
    const {success, error: updateCalendarError} = await updateCalendarActive(userCalendar.id, false)
    if (!success) {
      console.error('Error updating calendar ID:', updateCalendarError)
    }
  }

  if (!oauth2Client) {
    return null;
  }


  const calendar: calendar_v3.Calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  });

  try {
    // Prepare time range for FreeBusy query
    const timeMin = new Date(days[0]).toISOString();
    const timeMax = new Date(new Date(days[days.length - 1]).setDate(new Date(days[days.length - 1]).getDate() + 1)).toISOString();

    // FreeBusy request for the primary calendar
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: 'primary' }],  // Use 'primary' for the default user calendar
      },
    });

    const calendars = response.data.calendars;
    if (!calendars || !calendars['primary']) {
      console.error('Error fetching busy times:', response.data);
      return null;
    }

    // Extract and map busy times from the primary calendar
    const busyTimes = calendars['primary'].busy?.reduce((acc: MeetupTimes, { start, end }) => {
      if (start && end) {
        let startDate = new Date(start);
        let endDate = new Date(end);

        // Round to the nearest half-hour
        startDate.setMinutes(Math.floor(startDate.getMinutes() / 30) * 30);
        endDate.setMinutes(Math.ceil(endDate.getMinutes() / 30) * 30);

        // Increment through time slots
        while (startDate < endDate) {
          const time = startDate.getHours() * 60 + startDate.getMinutes();
          const timeId = allTimes.find(({ timez }) => {
            const [hours, minutes] = timez.split(':');
            return parseInt(hours, 10) * 60 + parseInt(minutes, 10) === time;
          })?.id;

          if (timeId) {
            const day = startDate.toDateString();
            if (!acc[day]) {
              acc[day] = [];
            }
            acc[day].push(timeId);
          }
          startDate.setMinutes(startDate.getMinutes() + 30);
        }
      }
      return acc;
    }, {});

    return busyTimes ?? null;
  } catch (error) {
    console.error('Error during FreeBusy query:', error);
    return null;
  }
}
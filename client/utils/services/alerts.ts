/**
 * services/alerts.ts
 * Service functions used to handle sending alerts and emails to users.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-30
 *
 *
 */
"use server"
import { Alert } from "@/types";
import { createClient } from "../supabase/server";
import { Resend } from "resend";
import EmailTemplate from "@/components/Email/email-template";
import { retriveUser } from "./auth";

// create a new alert in the database
export const createAlert = async (userId: string, message: string, imgUrl: string, link: string): Promise<string | null> => {
    const supabase = createClient();

    // creating alert
    const { data, error } = await supabase
        .from('alerts')
        .insert({
            user_id: userId,
            message: message,
            image_url: imgUrl,
            link: link
        })
        .select('id')
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    if (data !== null && data.id) {
        return data.id
    } else {
        console.error("Error creating alert");
        return null;
    }

}

export const markAlertRead = async (alertId: string, status: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('alerts')
        .update({ read: status })
        .eq('id', alertId)

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, error: "" };
}

export const markAlertsRead = async (alertIds: string[]) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .in('id', alertIds)

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, error: "" };
}

export const markAlertDeleted = async (alertId: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('alerts')
        .update({ deleted: true })
        .eq('id', alertId)

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, error: "" };
}


export const fetchAlert = async (alertId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    return data as Alert;
}

export const fetchAlerts = async (alertIds: string[]) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .in('id', alertIds);

    if (error) {
        return { success: false, error: error.message, alerts: null };
    }

    return { success: true, error: "", alerts: data };
}

export const updateAlertSent = async (alertId: string) => {
    const supabase = createClient();
    const date = new Date().toISOString();
    const { error } = await supabase
        .from('alerts')
        .update({ email_sent_at: date })
        .eq('id', alertId)

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, error: "" };
}

// send email to user using Resend API
export const sendEmail = async (userId: string, alertId: string, subject: string, itemTitle: string, actionText: string, heading: string) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        return { success: false, error: "Email delivery is not configured" };
    }
    const resend = new Resend(resendKey);
    const { success, user, error } = await retriveUser(userId)
    if (!success || !user || !user.email) {
        return { success: false, error: error };
    }

    const alert = await fetchAlert(alertId)
    if (!alert) {
        return { success: false, error: "Alert not found" };
    }

    try {
        const { error } = await resend.emails.send({
            from: 'Campus Marketplace <support@campus-marketplace.local>',
            to: [user.email],
            subject: subject,
            react: EmailTemplate({ message: alert.message, link: alert.link, imgURL: alert.image_url, itemTitle: itemTitle, actionText: actionText, heading: heading}) as React.ReactElement,
        });

        if (error) {
            return { success: false, error: error.message };
        } else {
            const { success, error } = await updateAlertSent(alertId);
            if (!success) {
                return { success: false, error: error };
            }
            return { success: true, error: "" };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

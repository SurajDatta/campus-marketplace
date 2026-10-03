/**
 * services/auth.ts
 * Service functions used to handle login, signup, logout, and user authentication.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import { User } from "@/types";
import { createClient } from "../supabase/server";
import { EmailOtpType, createClient as createAuthClient } from "@supabase/supabase-js";

export const login = async (password: string, email: string | null, phone: string | null) => {
    const supabase = createClient();
    if (email) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) {
            console.error('Error signing in with email:', error);
            return { success: false, error: error.message, errorCode: error.code, data: data };
        }
        return { success: true, error: "", errorCode: "", data: data };
    } else if (phone) {
        const { data, error } = await supabase.auth.signInWithPassword({
            phone: phone,
            password: password
        });
        if (error) {
            console.error('Error signing in with phone:', error);
            return { success: false, error: error.message, errorCode: error.code, data: data };
        }
        return { success: true, error: "", errorCode: "", data: data };
    }
    return { success: false, error: "No email or phone provided", errorCode: "", data: null };
}

export const otpLogin = async (email: string | null, phone: string | null) => {
    const supabase = createClient();
    if (email) {
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                // set this to false if you do not want the user to be automatically signed up
                shouldCreateUser: false
            },
        });
        if (error) {
            console.error('Error signing in with email:', error);
            return { success: false, error: error.message, errorCode: error.code };
        }
        return { success: true, error: "", errorCode: "" };
    } else if (phone) {
        const { error } = await supabase.auth.signInWithOtp({
            phone: phone,
            options: {
                // set this to false if you do not want the user to be automatically signed up
                shouldCreateUser: false,
                channel: 'sms'
            },
        });
        if (error) {
            console.error('Error signing in with phone:', error);
            return { success: false, error: error.message, errorCode: error.code };
        }
        return { success: true, error: "", errorCode: "" };
    }
    return { success: false, error: "No email or phone provided", errorCode: "" };
}

export const verifyOTP = async (token: string, email: string | null, phone: string | null) => {
    const supabase = createClient();
    if (email) {
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: token,
            type: 'email',
        });
        if (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, error: error.message, data: data };
        } else if (data.session) {
            return { success: true, error: "", data: data };
        } else {
            return { success: false, error: "Invalid token", data: data };
        }
    } else if (phone) {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms',
        });
        if (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, error: error.message, data: data };
        } else if (data.session) {
            return { success: true, error: "", data: data };
        } else {
            return { success: false, error: "Invalid token", data: data };
        }
    }
    return { success: false, error: "No email or phone provided", data: null };
}

export const resendSignupConfirmationEmail = async (email: string, redirectURL: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
            emailRedirectTo: redirectURL, // should be the origin of the website
        }
    })
    if (error) {
        console.error('Error resending signup confirmation email:', error);
        return { success: false, error: error.message };
    } else {
        return { success: true, error: "" };
    }
}

export const resendSignupConfirmationSMS = async (phone: string) => {
    const supabase = createClient();
    return await supabase.auth.resend({
        type: 'sms',
        phone: phone
    })
}


export const adminSignUp = async (firstName: string, lastName: string, email: string, phone: string, password: string, smsNotifications: boolean, redirectURL: string): Promise<{ success: boolean, errorCode: string, user: User | null }> => {
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !url) {
        return { success: false, errorCode: "url or service key not set", user: null };
    }
    const authSupabase = createAuthClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    const phoneConfirm = false // always false for now
    const { data, error } = await authSupabase.auth.admin.createUser({
        email: email,
        phone: phone,
        password: password,
        user_metadata: {
            first_name: firstName,
            last_name: lastName,
            campus_email: email,
            sms_notifications: smsNotifications
        },
        phone_confirm: !phoneConfirm, // has different function than names, we should always set this to !true
    })

    if (error) {
        console.error('Error signing up:', error);
        return { success: false, errorCode: error.code ?? "", user: data.user };
    } else {
        if (phoneConfirm) {
            const { error: phoneError } = await resendSignupConfirmationSMS(phone)
            if (phoneError) {
                return { success: false, errorCode: phoneError.code ?? "", user: data.user };
            }
        } else {
            const { error: emailError } = await resendSignupConfirmationEmail(email, redirectURL)
            if (emailError) {
                return { success: false, errorCode: "", user: data.user };
            }
        }
        return { success: true, errorCode: "", user: data.user };
    }
}

export const newAdminSignUp = async (firstName: string, lastName: string, email: string, phone: string, emailConfirm: boolean, smsConfirm: boolean, redirectURL: string): Promise<{ success: boolean, errorCode: string, user: User | null }> => {
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !url) {
        return { success: false, errorCode: "url or service key not set", user: null };
    }
    const authSupabase = createAuthClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    // passwordless
    const phoneConfirm = true // always true for now
    const { data, error } = await authSupabase.auth.admin.createUser({
        email: email,
        phone: phone,
        user_metadata: {
            first_name: firstName,
            last_name: lastName,
            sms_notifications: smsConfirm
        },
        phone_confirm: !phoneConfirm, // has different function than names, we should always set this to !true
        email_confirm: !emailConfirm
    })

    if (error) {
        console.error('Error signing up:', error);
        return { success: false, errorCode: error.code ?? "", user: data.user };
    } else {
        if (phoneConfirm) {
            const { error: phoneError } = await resendSignupConfirmationSMS(phone)
            if (phoneError) {
                return { success: false, errorCode: phoneError.code ?? "", user: data.user };
            }
        } else {
            const { error: emailError } = await resendSignupConfirmationEmail(email, redirectURL)
            if (emailError) {
                return { success: false, errorCode: "", user: data.user };
            }
        }
        return { success: true, errorCode: "", user: data.user };
    }
}

export const updatePassword = async (userId: string, password: string) => {
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !url) {
        return { success: false, errorCode: "url or service key not set", user: null };
    }
    const authSupabase = createAuthClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { data, error } = await authSupabase.auth.admin.updateUserById(userId, {
        password: password
    })
    if (error) {
        console.error('Error updating password:', error);
        return { success: false, errorCode: error.code ?? "", user: data.user };
    } else {
        return { success: true, errorCode: "", user: data.user };
    }
}

export const verifySignup = async (tokenHash: string, type: EmailOtpType) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type });
    if (error) {
        console.error('Error verifying signup:', error);
        return { success: false, error: error.message, data: data };
    } else {
        return { success: true, error: "", data: data };
    }
}


export const checkUserEmail = async (email: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('check_user_by_email', {
        user_email: email,
    });
    if (error) {
        console.error('Error checking user email:', error);
        return { success: false, error: error.message, userId: null };
    } else {
        if (data) {
            return { success: true, error: "", userId: data };
        } else {
            return { success: false, error: "No user found", userId: null };
        }
    }
}

export const checkUserPhone = async (phone: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('check_user_by_phone', {
        user_phone: phone
    });
    if (error) {
        console.error('Error checking user phone:', error);
        return { success: false, error: error.message, userId: null };
    } else {
        if (data) {
            return { success: true, error: "", userId: data };
        } else {
            return { success: false, error: "No user found", userId: null };
        }
    }
}

export const checkCampusEmail = async (email: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('campus_email', email)
    if (error) {
        return { success: false, error: error.message, userId: null };
    } else {
        if (data && data.length > 0) {
            return { success: true, error: "", userId: data[0].id };
        } else {
            return { success: false, error: "No user found", userId: null };
        }
    }
}

export const checkValidStudent = async (campusEmail: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.edu$/i.test(campusEmail);
    return isValid
        ? { success: true, error: "", name: "" }
        : { success: false, error: "A valid .edu email is required", name: "" };
}

export const retriveUser = async (userId: string) => {
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !url) {
        return { success: false, errorCode: "url or service key not set", user: null };
    }
    const authSupabase = createAuthClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    const { data, error } = await authSupabase.auth.admin.getUserById(userId);
    if (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: error.message, user: null };
    } else {
        return { success: true, error: "", user: data.user };
    }
}

// Function to fetch the current user
export const fetchUser = async (accessToken?: string) => {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser(accessToken);
    return user;
};

// Function to fetch the current user
export const signOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut({
        scope: 'local'
    });

    if (error) {
        console.error('Error signing out:', error);
    }

};


export const verifyAccount = async (userId: string) => {
    const supabase = createClient();
    const date = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .update({ last_verified: date })
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error verifying account:', error);
        return { success: false, error: error.message };
    }

    return { success: true, error: "" };
}

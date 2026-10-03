import { TypedSupabaseClient } from "@/types";

export async function retrieveUser(authClient: TypedSupabaseClient, userId: string) {
    const { data, error } = await authClient.auth.admin.getUserById(userId);
    if (error) {
        throw new Error(error.message);
    }
    return data.user
}
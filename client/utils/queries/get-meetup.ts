import { TypedSupabaseClient } from "@/types";

export async function getMeetup(client: TypedSupabaseClient, meetupId: string | null) {
    if (!meetupId) {
        return null;
    }
    const { data, error } = await client
        .from('meetup')
        .select('*')
        .eq('id', meetupId)
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data
}        
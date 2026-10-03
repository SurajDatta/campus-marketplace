import { TypedSupabaseClient } from "@/types";


export async function getMessages(client: TypedSupabaseClient, meetupId: string) {
    const {data, error} = await client
        .from('messages')
        .select('*')
        .eq('meetup_id', meetupId)
        .order('created_at', {ascending: true});
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

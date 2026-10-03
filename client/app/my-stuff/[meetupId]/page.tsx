/**
 * app/buy/[id]/meetup/page.tsx
 * Meetup page for the buyer and seller to confirm the meetup and exchange the item.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import Meetup from "@/components/Buy/Meetup/Meetup";

export default async function MeetupPage({ params }: { params: {meetupId: string } }) {
    const development = process.env.NEXT_PUBLIC_ENV === 'development';
    const mapsAPIKey = process.env.GOOGLE_MAPS_API_KEY;

    // creating auth supabase for the meetup page
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY ?? ''; // Ensure this is set in your environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

    return (
        <Meetup development={development} mapsAPIKey={mapsAPIKey} meetupId={params.meetupId} url={url} serviceRoleKey={serviceRoleKey} />
    );
}
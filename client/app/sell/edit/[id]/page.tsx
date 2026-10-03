/**
 * app/sell/listing/[id]/page.tsx
 * Sell edit page where users can edit their listings.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import useSupabaseServer from '@/utils/supabase/supabase-server'
import { getItem } from '@/utils/queries/get-item'
import SellEditPage from '@/components/Sell/Listing/NewEditListing';
import { createQueryClient } from '@/utils/react-query/queryClient';

export default async function SellEdit({ params }: { params: { id: string } }) {
  const queryClient = createQueryClient();
  const cookieStore = cookies();
  const supabase = useSupabaseServer(cookieStore);
  const development = process.env.NEXT_PUBLIC_ENV === 'development';
  const mapsAPIKey = process.env.GOOGLE_MAPS_API_KEY;

  await queryClient.prefetchQuery({
    queryKey: ['item', params.id],
    queryFn: () => getItem(supabase, params.id, development)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SellEditPage development={development} mapsAPIKey={mapsAPIKey} itemId={params.id} />
    </HydrationBoundary>
  );
}

/**
 * app/buy/[sellerId]/page.tsx
 * Page where people can view other items for sale by a given seller. E.g migrating the profile page to this page.
 * @AshokSaravanan222
 * @2024-09-26
 */
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import useSupabaseServer from '@/utils/supabase/supabase-server'
import { getUserProfile } from '@/utils/queries/get-user-profile';
import SellProfilePage from '@/components/Sell/Profile/Profile';
import { getSellItems } from '@/utils/queries/get-sell-items';
import { createQueryClient } from '@/utils/react-query/queryClient';

export default async function SellProfile({ params }: { params: { sellerId: string } }) {
  const queryClient = createQueryClient();
  const cookieStore = cookies();
  const supabase = useSupabaseServer(cookieStore);
  const development = process.env.NEXT_PUBLIC_ENV === 'development';

  await queryClient.prefetchQuery({
    queryKey: ['userProfile', params.sellerId],
    queryFn: () => getUserProfile(supabase, params.sellerId)
  });

  await queryClient.prefetchQuery({
    queryKey: ['sellItems', params.sellerId],
    queryFn: () => getSellItems(supabase, params.sellerId, development)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SellProfilePage development={development} sellerId={params.sellerId} />
    </HydrationBoundary>
  );
}


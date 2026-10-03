/**
 * app/privacy/page.tsx
 * Privacy policy page for Campus Marketplace.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React from 'react';
import Layout from '@/components/Layout/Layout';
import Privacy from '@/components/Privacy/Privacy';
import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';
import { getUser } from '@/utils/queries/get-user';

export default function PrivacyPage() {
  const supabase = useSupabaseBrowser()

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(supabase),
  });

  // Step 2: Fetch user profile, only if user exists
  const { data: userProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => getUserProfile(supabase, user!.id),
    enabled: !!user, // This query will only run if `user` is not null
  });

  // Step 3: Fetch alerts, only if userProfile exists
  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: () => getAlerts(supabase, userProfile!.id),
    enabled: !!user, // This query will only run if `userProfile` is not null
  });

  return (
    <Layout
      user={user}
      userProfile={userProfile}
      alerts={alerts}
      loadingUser={loadingUser}
      loadingProfile={loadingProfile}
      loadingAlerts={loadingAlerts}
      visitorContent={
        <Privacy />
      }>
      <Privacy />
    </Layout>
  );




}



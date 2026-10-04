/**
 * app/terms/page.tsx
 * Terms of Service for Licks.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React from 'react';
import Layout from '@/components/Layout/Layout';
import TermsOfService from '@/components/Terms/TermsOfService';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';

export default function Terms() {
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
        <TermsOfService />
      }>
      <TermsOfService />
    </Layout>
  )

}
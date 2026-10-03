/**
 * Item.tsx
 * Component that will show the item details, this time using react query to cache the results.
 * @AshokSaravanan222
 * 09-26-2024
 */
'use client'
import Layout from "@/components/Layout/Layout"
import { BuyerMeetups, Item, Location, MeetupPreferences, Profile, Schedule } from "@/types";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getUserProfile } from "@/utils/queries/get-user-profile";
import { getCategories } from "@/utils/queries/get-categories";
import { getTimes } from "@/utils/queries/get-times";
import { getLocations } from "@/utils/queries/get-locations";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBreakpointValue, useToast } from "@chakra-ui/react";
import { newMapToSchedule } from "@/utils/mapToSchedule";
import { createCheckoutSession } from "@/utils/services/stripe";
import { useQuery } from "@tanstack/react-query";
import { getItem } from "@/utils/queries/get-item";
import { getUser } from "@/utils/queries/get-user";
import { getAlerts } from "@/utils/queries/get-alerts";
import ItemDetails, { BuyerSelectFormData } from "./Details/ItemDetails";
import { getUserSchedules } from "@/utils/queries/get-user-schedules";
import { FormikHelpers } from "formik";
import { getCalendar } from "@/utils/queries/get-calendar";
import { retriveUser } from "@/utils/services/auth";

type ItemDetailsPageProps = {
    itemId: string
    sellerId: string
    development: boolean;
    mapsAPIKey: string | undefined
}


export default function ItemDetailsPage({ itemId, sellerId, development, mapsAPIKey }: ItemDetailsPageProps) {
    // hooks
    const supabase = useSupabaseBrowser()
    const pathname = usePathname()
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
    const router = useRouter();
    const toast = useToast();

    // state variables
    const [displayPathName, setDisplayPathName] = useState<string>('')

    const [contact, setContact] = useState<boolean>(false)
    const [schedule, setSchedule] = useState<boolean>(true)
    const [safeMeetup, setSafeMeeup] = useState<boolean>(true)

    const [buyerLocations, setBuyerLocations] = useState<number[]>([])
    const [buyerContact, setBuyerContact] = useState<string[]>(["phone"]);
    const [buyerMeetups, setBuyerMeetups] = useState<BuyerMeetups>({}); // buyer location availability

    // functions
    const generateNextWeek = (): Date[] => {
        const now = new Date();
        // const start = new Date(now.setHours(now.getHours() + 48));
        const nextWeek: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            nextWeek.push(date);
        }
        return nextWeek;
    };
    const nextWeek = generateNextWeek();
    const days = nextWeek.map((date) => date.toDateString())

    const getMeetupPreferences = (sellerProfile: Profile, item: Item) => {
        if (Object.keys(item.meetup_preferences as MeetupPreferences || {}).length !== 0) {
            // takes priority
            return item.meetup_preferences as MeetupPreferences
        } else {
            return sellerProfile.seller_meetup as MeetupPreferences
        }
    }

    const getContactPreferences = (sellerProfile: Profile, item: Item) => {
        if (item.contact_preferences.length == 0) {
            return sellerProfile.seller_contact
        } else {
            return item.contact_preferences
        }
    }

    const getSchedulePreferences = (schedules: Schedule[], item: Item): Schedule[] => {
        if (item.schedule_preferences.length == 0) {
            return schedules
        } else {
            return item.schedule_preferences.map((id) => schedules.find((schedule) => schedule.id === id) as Schedule).filter((schedule) => schedule !== undefined)
        }
    }

    const handleSubmit = async (values: BuyerSelectFormData, actions: FormikHelpers<BuyerSelectFormData>) => {
        try {
            if (item && user && userProfile && sellerProfile && times && locations) {
                const {success, error, user: sellerUser} = await retriveUser(sellerId);
                if (!success || !sellerUser) {
                    throw new Error(error);
                }

                let accountId: string | null
                if (development) {
                    accountId = sellerProfile.test_account_id && sellerProfile.test_account_requirements.length === 0 ? sellerProfile.test_account_id : null
                } else {
                    accountId = sellerProfile.account_id && sellerProfile.account_requirements.length === 0 ? sellerProfile.account_id : null
                }
                
                const contactPreferences = getContactPreferences(sellerProfile, item);
                let selectedContact: string[] = [];
                if (contact) {
                    const userContact = userProfile.contact_details as { [key: string]: string };
                    selectedContact = contactPreferences.filter(contact => userContact[contact] !== '');
                }

                const meetupTimes = newMapToSchedule(values.buyerMeetups, times);
                const expiry_time = new Date(new Date(meetupTimes[meetupTimes.length - 1].time).getTime()).toISOString(); // expires at the last meetup time. As soon as it is confirmed, then it will be 1 hour after the meetup time.

                if (!user.email) {
                    throw new Error("User's email is not set")
                }
                if (!sellerUser.email) {
                    throw new Error("Seller's email is not set")
                }

                // creating alerts for the buyer and seller
                const session = await createCheckoutSession(user.email, sellerUser.email, pathname, accountId, development, item.id, user.id, item.seller_id, values.contact, values.schedule, values.safeMeetup, selectedContact, meetupTimes, item.title, item.price, item.photo_urls, expiry_time);
                if (session.url) {
                    router.push(session.url);
                } else {
                    throw new Error('Failed to create checkout session');
                }
            } else {
                throw new Error('Item, user, userProfile, sellerProfile, times, or locations is not set');
            }
        } catch (error: any) {
            toast({
                title: 'Error buying item.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    }
    
    
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(supabase)
    })

    const { data: times, isLoading: loadingTimes } = useQuery({
        queryKey: ['times'],
        queryFn: () => getTimes(supabase)
    })

    const { data: locations, isLoading: loadingLocations } = useQuery({
        queryKey: ['locations'],
        queryFn: () => getLocations(supabase),
    })

    const { data: item, isLoading: loadingItem } = useQuery({
        queryKey: ['item', itemId],
        queryFn: () => getItem(supabase, itemId, development)
    })

    const { data: scheduleData, isLoading: loadingSchedule } = useQuery({
        queryKey: ['schedule', sellerId],
        queryFn: () => getUserSchedules(supabase, sellerId),
    })

    const { data: sellerProfile, isLoading: loadingSellerProfile } = useQuery({
        queryKey: ['userProfile', sellerId],
        queryFn: () => getUserProfile(supabase, sellerId),
    })

    const { data: googleCalendarUnavailability, isLoading: loadingGoogleCalendarUnavailability } = useQuery({
        queryKey: ['calendar', sellerId],
        queryFn: () => getCalendar(supabase, sellerId, days, times ?? []),
        enabled: !!times
    })


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
        queryFn: () => getAlerts(supabase, user!.id),
        enabled: !!user, // This query will only run if `userProfile` is not null
    });

    // useEffects
    useEffect(() => {
        if (item && sellerProfile) {
            // setting pathname for breadcrumbs
            var paths = pathname.split('/');
            for (let i = 0; i < paths.length; i++) {
                if (paths[i] === item.id) {
                    paths[i] = item.title;
                } else if (paths[i] === item.seller_id) {
                    // if i want to take it out
                    paths[i] = ''
                    // paths[i] = sellerProfile.first_name + ' ' + sellerProfile.last_name
                }
            }
            setDisplayPathName(paths.join('/'));
        }
    }, [item, sellerProfile])


    useEffect(() => {
        if (item && scheduleData) {
            const locations = getSchedulePreferences(scheduleData, item).map((schedule) => schedule.location);
            setBuyerLocations(locations);
        }
    }, [item, scheduleData])

    const renderItemDetails = (locked: boolean) => {
        return (
            <ItemDetails
                id={item?.id}
                title={item ? item.title : ""}
                listing_price={item ? item.listing_price : 0}
                price={item ? item.price : 0}
                condition={item ? item.condition : ""}
                categories={item ? item.categories : [0]}
                description={item ? item.description : ""}
                photos={
                    item ? item.photo_urls.map((url, index) => ({
                        photo_url: url, photo_size: item.photo_sizes[index] ?? {
                            x: 0, y: 0, w: 100, h: 100
                        }
                    }) as { photo_url: string, photo_size: { x: number, y: number, w: number, h: number } }) : []
                }
                isMobile={isMobile ?? true}
                contact={contact}
                schedule={schedule}
                sellerContact={item && sellerProfile ? getContactPreferences(sellerProfile, item) : []}
                allCategories={categories ?? []}
                allTimes={times ?? []}
                allLocations={locations ?? []}
                itemLoading={loadingItem}
                scheduleLoading={loadingGoogleCalendarUnavailability || loadingItem}
                timesLoading={loadingTimes || loadingSchedule}
                sellerSchedules={item && scheduleData ? getSchedulePreferences(scheduleData, item) : []}
                locationsLoading={loadingLocations}
                days={days}
                isActive={item ? item.active : true}
                quantity={item ? item.quantity : 1}
                setContact={setContact}
                setSchedule={setSchedule}
                googleMapsAPIKey={mapsAPIKey ?? ""}
                user={user ?? null}
                userProfile={userProfile ?? null}
                contactLoading={loadingSellerProfile}
                buyerContact={buyerContact}
                setBuyerContact={setBuyerContact}
                buyerMeetups={buyerMeetups}
                setBuyerMeetups={setBuyerMeetups}
                contactEnabled={item && sellerProfile ? getMeetupPreferences(sellerProfile, item).quick : true}
                scheduleEnabled={item && sellerProfile ? getMeetupPreferences(sellerProfile, item).scheduled : false}
                negotiable={item ? item.negotiable : false}
                editable={false}
                verified={item ? (development ? item.test_verified : item.verified) : false}
                googleCalendarUnavailability={googleCalendarUnavailability?.meetupTimes ?? {}}
                safeMeetupEnabled={item ? item.safe_meetup : true}
                safeMeetup={safeMeetup}
                setSafeMeetup={setSafeMeeup}
                handleSubmit={handleSubmit}
                locked={locked}
                sellerId={sellerId}
                buyerLocations={buyerLocations}
                setBuyerLocations={setBuyerLocations}
                allSellerLocations={item && scheduleData && locations ? getSchedulePreferences(scheduleData, item).map((schedule) => schedule.location).map((locationId) => locations.find((location) => location.id === locationId) as Location) : []}
            />
        )
    }

    return (
        <Layout user={user} userProfile={userProfile ?? undefined} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts} loadingPathName={loadingItem || loadingSellerProfile} displayPathName={displayPathName} visitorContent={renderItemDetails(true)}>
            {renderItemDetails(false)}
        </Layout>
    )
}

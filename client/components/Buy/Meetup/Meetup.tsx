/**
 * Meetup.tsx
 * Will be used for react query to get the meetup information.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client"
import BlockedScreen from "@/components/Common/Other/BlockedScreen";
import Layout from "@/components/Layout/Layout";
import { Item, Location, Meetup, MeetupLocations, MeetupTimes, Message, Profile, Time, TypedSupabaseClient } from "@/types";
import { getAlerts } from "@/utils/queries/get-alerts";
import { getItem } from "@/utils/queries/get-item";
import { getLocations } from "@/utils/queries/get-locations";
import { getMeetup } from "@/utils/queries/get-meetup";
import { getUser } from "@/utils/queries/get-user";
import { getUserProfile } from "@/utils/queries/get-user-profile";
import { retrieveUser } from "@/utils/queries/retrieve-user";
import { subscribeToItemUpdates, subscribeToMeetupUpdates, subscribeToMessageUpdates } from "@/utils/services/realtime";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { Box, Center, Flex, Icon, Progress, Text, useBreakpointValue, useSteps, useToast, VStack } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import SuccessfulPurchaseAnimation from "./Confirmation/SuccessfulPurchaseAnimation";
import { checkInBuyer, checkInSeller, confirmBuyer, confirmSeller, createMessage, rescheduleMeetup, unconfirmBuyer, updateExpiryTime, updateMeetupCancelFee, updateMeetupCancelReason, updateMeetupStatus, updatePrice } from "@/utils/services/buy";
import { mapToScheudle } from "@/utils/mapToSchedule";
import { createAlert, sendEmail } from "@/utils/services/alerts";
import ItemInfo from "./ItemInfo";
import MeetupConfirmation from "./MeetupConfirmation";
import CheckInModal from "./CheckIn/CheckInModal";
import { Database } from "@/database.types";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { getMessages } from "@/utils/queries/get-messages";
import ItemStatus from "./ItemStatus";
import ItemStatusModal from "./ItemStatusModal";

const steps = [
    { title: 'Purchase', description: 'Item successfully purchased' },
    { title: 'Exchange', description: 'Buyer and seller exchange' },
    { title: 'Confirmation', description: 'Seller confirms receipt of goods' },
];

type MeetupProps = {
    meetupId: string;
    development: boolean;
    mapsAPIKey: string | undefined
    url: string;
    serviceRoleKey: string;

}

export default function MeetupPage({ meetupId, development, mapsAPIKey, url, serviceRoleKey }: MeetupProps) {
    const supabase = useSupabaseBrowser()
    const queryClient = useQueryClient();
    const toast = useToast();
    const pathname = usePathname();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
    const authSupabase = createAuthClient<Database>(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { activeStep, setActiveStep } = useSteps({
        index: 1,
        count: steps.length,
    });

    const [displayPathName, setDisplayPathName] = React.useState<string>('');
    const [meetup, setMeetup] = React.useState<Meetup | null>(null);
    const [messages, setMessages] = React.useState<Message[] | null>(null);

    const [showAnimation, setShowAnimation] = React.useState(false);
    const [openItemStatus, setOpenItemStatus] = React.useState(false);
    const [openCheckIn, setOpenCheckIn] = React.useState(false);
    const [openReschedule, setOpenReschedule] = React.useState(false);
    const [checkinLoading, setCheckinLoading] = React.useState(false);
    const [rescheuduleLoading, setRescheduleLoading] = React.useState(false);

    const { data: meetupData, isLoading: loadingMeetup } = useQuery({
        queryKey: ['meetup', meetupId],
        queryFn: () => getMeetup(supabase, meetupId),
    })

    const { data: messageData, isLoading: loadingMessages } = useQuery({
        queryKey: ["messages", meetupData?.id],
        queryFn: () => getMessages(supabase, meetupData!.id),
        enabled: !!meetupData,
    });

    const { data: locations, isLoading: loadingLocations } = useQuery({
        queryKey: ['locations'],
        queryFn: () => getLocations(supabase),
    })

    // Step 1: Fetch user
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

    const otherUserId = (userId: string, meetup: Meetup) => userId === meetup?.buyer_id ? meetup?.seller_id : meetup?.buyer_id
    const { data: otherUserProfile, isLoading: loadingOtherUserProfile } = useQuery({
        queryKey: ['userProfile', otherUserId(userProfile?.id ?? '', meetupData!)],
        queryFn: () => getUserProfile(supabase, otherUserId(userProfile?.id ?? '', meetupData!) ?? ''),
        enabled: !!meetupData && !!userProfile
    })

    const { data: otherUser, isLoading: loadingOtherUser } = useQuery({
        queryKey: ['retrieveUser', otherUserProfile?.id],
        queryFn: () => retrieveUser(authSupabase, otherUserProfile!.id),
        enabled: !!otherUserProfile
    })

    const handleCheckIn = async (buyer: boolean, meetupId: string, notes: string, checkedIn: boolean) => {
        setCheckinLoading(true);
        try {
            if (!meetup) {
                throw new Error('Meetup not found');
            }
            const date = new Date().toLocaleString();
            const { success: checkInSuccess, error: checkInError } = buyer ? await checkInBuyer(meetupId, notes, checkedIn, meetup.item_title, meetup.item_photo_urls[0], `${window.location.origin}/my-stuff/${meetupId}`, meetup.buyer_id, meetup.seller_id, date) : await checkInSeller(meetupId, notes, checkedIn, meetup.item_title, meetup.item_photo_urls[0], `${window.location.origin}/my-stuff/${meetupId}`, meetup.buyer_id, meetup.seller_id, date);
            if (!checkInSuccess) {
                throw new Error("Error checking in: " + checkInError)
            }

        } catch (error) {
            console.error("Failed to handle check in: ", error)
        } finally {
            setCheckinLoading(false);
            setOpenCheckIn(false)
        }
    }

    const newHandleCheckIn = async (): Promise<{success: boolean, error: string}> => {
        try {
            if (!meetup) {
                throw new Error('Meetup not found');
            }
            if (!userProfile) {
                throw new Error('User profile not found');
            }
            const buyer = userProfile.id === meetup.buyer_id;

            const date = new Date().toLocaleString();
            const { success: checkInSuccess, error: checkInError } = buyer ? await checkInBuyer(meetupId, "", false, meetup.item_title, meetup.item_photo_urls[0], `${window.location.origin}/my-stuff/${meetupId}`, meetup.buyer_id, meetup.seller_id, date) : await checkInSeller(meetupId, "", false, meetup.item_title, meetup.item_photo_urls[0], `${window.location.origin}/my-stuff/${meetupId}`, meetup.buyer_id, meetup.seller_id, date);
            if (!checkInSuccess) {
                throw new Error("Error checking in: " + checkInError)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ["alerts", userProfile.id]
                });
                const senderId = buyer ? meetup.buyer_id : meetup.seller_id;
                const {success, error} = await createMessage(meetup.id, senderId, `The ${buyer ? "buyer" : "seller"} has checked into the meetup.`, null)
                if (!success) {
                    throw new Error(error)
                } else {
                    queryClient.invalidateQueries({
                        queryKey: ["messages", meetup.id]
                    })
                }
            }
            return { success: true, error: '' }
        } catch (error: any) {
            console.error("Failed to handle check in: ", error)
            return { success: false, error: error.message }
        }
    }

    const handleReschedule = async (buyerTimes: MeetupTimes, buyerLocations: MeetupLocations, allTimes: Time[], allLocations: Location[], sellerLocations: number[]) => {
        setRescheduleLoading(true);
        try {
            if (!meetup) {
                throw new Error('Meetup not found');
            }

            const meetupTimes = mapToScheudle(buyerTimes, buyerLocations, allTimes, sellerLocations);
            const expiry_time = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

            const { success: updateRescheduleSuccess, error: updateRescheduleError } = await rescheduleMeetup(meetup.id, meetupTimes);
            if (!updateRescheduleSuccess) {
                throw new Error('Error rescheduling meetup: ' + updateRescheduleError);
            }

            // updating item status back to pending
            const { success: updateStatusSuccess } = await updateMeetupStatus(meetup.id, 'pending');
            if (!updateStatusSuccess) {
                throw new Error('Error updating item status');
            }

            const { success: expiryTimeSuccess } = await updateExpiryTime(meetup.id, expiry_time);
            if (!expiryTimeSuccess) {
                throw new Error('Error updating expiry time');
            }
            const meetupLocations: string[] = meetupTimes.map(({ time, location }) => `**${new Date(time).toLocaleString()}** at **${allLocations.find((loc) => loc.id === location)?.name}**`);

            const buyerAlertId = await createAlert(
                meetup.buyer_id,
                `You have requested to ${meetup.schedule_enabled ? "reschedule" : "schedule"} for the purchase of **${meetup.item_title}**, choosing the meetup times: ${meetupLocations.join(",")}. The seller has 24 hours (until **${new Date(expiry_time).toLocaleString()}**) to confirm a meetup time; otherwise, the purchase request will be canceled. You can check the item's status at any time on the MyStuff page. We will notify you once a time has been confirmed or if the transaction is canceled.`,
                meetup.item_photo_urls[0],
                `${window.location.origin}/my-stuff/${meetup.id}`
            );

            if (!buyerAlertId) {
                throw new Error("Failed to create alert for the buyer");
            }

            const sellerAlertId = await createAlert(
                meetup.seller_id,
                `A buyer has requested to ${meetup.schedule_enabled ? "reschedule" : "schedule"} for the purchase of **${meetup.item_title}**, proposing meeting at: ${meetupLocations.join(",")}. Make a selection of which time works best for you, and we will notify the buyer. You need to confirm a meetup time within the next 24 hours (you have until **${new Date(expiry_time).toLocaleString()}**), or the transaction will be canceled.`,
                meetup.item_photo_urls[0],
                `${window.location.origin}/my-stuff/${meetup.id}`
            );

            if (!sellerAlertId) {
                throw new Error("Failed to create alert for the seller");
            }

            // sending email
            // const { success: buyerSendEmailSuccess, error: buyerSendEmailError } = await sendEmail(meetup.buyer_id, buyerAlertId, `You have rescheduled the meetup for ${meetup.item_title}`, meetup.item_title, "View Meetup", "Reschedule Details");
            // if (!buyerSendEmailSuccess) {
            //     throw new Error("Failed to send email to buyer: " + buyerSendEmailError);
            // }
            // const { success: sellerSendEmailSuccess, error: sellerSendEmailError } = await sendEmail(meetup.seller_id, sellerAlertId, `The buyer has rescheduled the meetup for ${meetup.item_title}`, meetup.item_title, "View Meetup", "Reschedule Details");
            // if (!sellerSendEmailSuccess) {
            //     throw new Error("Failed to send email to seller: " + sellerSendEmailError);
            // }

            toast({
                title: 'Meetup rescheduled.',
                description: 'The meetup has been rescheduled. The seller has 24 hours to confirm the meetup.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error rescheduling meetup.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setRescheduleLoading(false);
            setOpenReschedule(false);
        }
    }


    const handlePriceChange = async (newPrice: number) => {
        try {
            const { success: priceChangeSuccess, error: priceChangeError } = await updatePrice(meetupId, newPrice);
            if (!priceChangeSuccess) {
                throw new Error("Error changing price: " + priceChangeError)
            }
        } catch (error) {
            console.error("Failed to handle price change: ", error)
        }
    }

    const handleBuyerVerification = async () => {
        try {
            const { success: confirmBuyerSuccess, error: confirmBuyerError } = await confirmBuyer(meetupId);
            if (!confirmBuyerSuccess) {
                throw new Error("Error confirming buyer: " + confirmBuyerError)
            }
        } catch (error) {
            console.error("Failed to handle buyer verification: ", error)
        }
    }

    const handleSellerVerification = async () => {
        try {
            const { success: confirmSellerSuccess, error: confirmSellerError } = await confirmSeller(meetupId);
            if (!confirmSellerSuccess) {
                throw new Error("Error confirming seller: " + confirmSellerError)
            }
        } catch (error) {
            console.error("Failed to handle seller verification: ", error)
        }
    }

    const handleCancellation = async () => {
        try {
            if (meetup == null) {
                throw new Error('Meetup ID is not set');
            }
            const { success: refundItemSuccess } = await updateMeetupStatus(meetup.id, 'canceled');
            if (!refundItemSuccess) {
                throw new Error('Failed to update item status');
            }

            // setting the item to active again for the seller???
        } catch (error) {
            console.error("Failed to handle buyer cancellation: ", error)
        }
    }

    const handleMeetupCancel = async (cancelFee: number | null) => {
        try {
            if (meetup == null) {
                throw new Error('Meetup ID is not set');
            }

            const { success: updateCancelFeeSuccess, error: updateCancelFeeError } = await updateMeetupCancelFee(meetup.id, cancelFee);
            if (!updateCancelFeeSuccess) {
                throw new Error("Error updating cancel fee: " + updateCancelFeeError);
            }

            const { success: cancelMeetupSuccess } = await updateMeetupStatus(meetup.id, 'canceled');
            if (!cancelMeetupSuccess) {
                throw new Error('Failed to update meetup status');
            }
            return { success: true, error: '' }
        } catch (error: any) {
            console.error("Failed to cancel meetup: ", error)
            return { success: false, error: error.message }
        }

    }

    const newHandleMeetupCancel = async (cancelReason: string | null) => {
        try {
            if (meetup == null) {
                throw new Error('Meetup ID is not set');
            }

            const { success: updateCancelReasonSuccess, error: updateCancelReasonError } = await updateMeetupCancelReason(meetup.id, cancelReason);
            if (!updateCancelReasonSuccess) {
                throw new Error("Error updating cancel reason: " + updateCancelReasonError);
            }

            const { success: cancelMeetupSuccess } = await updateMeetupStatus(meetup.id, 'canceled');
            if (!cancelMeetupSuccess) {
                throw new Error('Failed to update meetup status');
            }
            return { success: true, error: '' }
        } catch (error: any) {
            console.error("Failed to cancel meetup: ", error)
            return { success: false, error: error.message }
        }
    }

    const updateFinalMeetup = async () => {
        try {
            if (meetup == null) {
                throw new Error('Meetup ID is not set');
            } else {
                const { success: finalMeetupSuccess } = await updateMeetupStatus(meetup.id, 'confirmed');
                if (!finalMeetupSuccess) {
                    throw new Error('Failed to update meetup status');
                }
            }
        } catch (error) {
            console.error("Failed to update meetup: ", error)
        }
    }

    const handleSwipeEnd = async () => {
        await handleSellerVerification();
        await updateFinalMeetup();
    }

    const handleBuyerUnconfirmation = async () => {
        try {
            const { success: unconfirmBuyerSuccess, error: unconfirmBuyerError } = await unconfirmBuyer(meetupId);
            if (!unconfirmBuyerSuccess) {
                throw new Error("Error unconfirming buyer: " + unconfirmBuyerError)
            }
        } catch (error) {
            console.error("Failed to handle buyer unconfirmation: ", error)
        }
    }

    const renderInfo = (userProfile: Profile | null, meetup: Meetup | null, locations: Location[] | null, mapsAPIKey: string | null) => {
        if ((userProfile && meetup) ? userProfile.id === meetup.seller_id : true) { // seller side
            switch (meetup ? meetup.status : 'meeting') {
                case 'pending':
                case 'meeting':
                    return (
                        <MeetupConfirmation meetup={meetup} buyer={false} openItemModal={() => setOpenItemStatus(true)} openCheckInModal={() => setOpenCheckIn(true)} locations={locations} mapsAPIKey={mapsAPIKey} confirmed={meetup?.status !== "pending"} isMobile={isMobile} otherUser={otherUser ?? null} otherUserProfile={otherUserProfile ?? null} handlePriceChange={handlePriceChange} unconfirmBuy={handleBuyerUnconfirmation} confirmSeller={handleSwipeEnd} confirmBuy={handleBuyerVerification} cancelBuy={handleCancellation} user={user ?? null} openRescheduleModal={() => setOpenReschedule(true)} messages={messages ?? null} cancelMeetup={handleMeetupCancel} development={development} newCancelMeetup={newHandleMeetupCancel} handleCheckIn={newHandleCheckIn}/>
                    );
                case 'confirmed':
                    setShowAnimation(true);
                case 'complete':
                    return (
                        <ItemInfo
                            heading={"Congrats! Your item has been bought."}
                            description={`View the info ${isMobile ? "below" : "to the right"} to find more details.`}
                            actionContent={
                                <ItemStatus activeStep={activeStep} meetup={meetup} locations={locations} mapsAPIKey={mapsAPIKey} />
                            }
                            onAdjustPriceOpen={() => { }}
                            meetup={meetup}
                            isMobile={isMobile}
                            buyer={false}
                        />
                    );
                case 'canceled':
                    return (
                        <ItemInfo
                            heading={"Your purchase has been canceled."}
                            description={`View the info ${isMobile ? "below" : "to the right"} to find more details.`}
                            actionContent={<ItemStatus activeStep={activeStep} meetup={meetup} locations={locations} mapsAPIKey={mapsAPIKey} />}
                            onAdjustPriceOpen={() => { }}
                            meetup={meetup}
                            isMobile={isMobile}
                            buyer={false}
                        />
                    );
            }
        } else if ((userProfile && meetup) ? userProfile.id === meetup.buyer_id : true) { // buyer side
            switch (meetup ? meetup.status : 'meeting') {
                case 'pending':
                case 'meeting':
                    return (
                        <MeetupConfirmation meetup={meetup} buyer={true} openItemModal={() => setOpenItemStatus(true)} openCheckInModal={() => setOpenCheckIn(true)} locations={locations} mapsAPIKey={mapsAPIKey} confirmed={meetup?.status !== "pending"} isMobile={isMobile} otherUser={otherUser ?? null} otherUserProfile={otherUserProfile ?? null} confirmBuy={handleBuyerVerification} cancelBuy={handleCancellation} unconfirmBuy={handleBuyerUnconfirmation} confirmSeller={handleSwipeEnd} user={user ?? null} openRescheduleModal={() => setOpenReschedule(true)} messages={messages ?? null} cancelMeetup={handleMeetupCancel} development={development} newCancelMeetup={newHandleMeetupCancel} handleCheckIn={newHandleCheckIn} />
                    );
                case 'confirmed':
                    setShowAnimation(true);
                case 'complete':
                    return (
                        <ItemInfo
                            heading={"Congrats! You have successfully bought the item."}
                            description={`The seller thanks you for your purchase! View the info ${isMobile ? "below" : "to the right"} to find more details.`}
                            actionContent={
                                <ItemStatus activeStep={activeStep} meetup={meetup} locations={locations} mapsAPIKey={mapsAPIKey} />
                            }
                            onAdjustPriceOpen={() => { }}
                            meetup={meetup}
                            isMobile={isMobile}
                            buyer={true}
                        />
                    );
                case 'canceled':
                    return (
                        <ItemInfo
                            heading={"The purchase for this item has been canceled."}
                            description={`View the info ${isMobile ? "below" : "to the right"} to find more details.`}
                            actionContent={<ItemStatus activeStep={activeStep} meetup={meetup} locations={locations} mapsAPIKey={mapsAPIKey} />}
                            onAdjustPriceOpen={() => { }}
                            meetup={meetup}
                            isMobile={isMobile}
                            buyer={true}
                        />
                    );
            }
        } else {
            return <BlockedScreen blockedText='This meetup cannot be viewed.' />;
        }
    };


    useEffect(() => {
        const unsubscribeFromMeetupUpdates = subscribeToMeetupUpdates(
            supabase,
            meetup ? meetup.id : null,
            setMeetup,
            (error) => {
                toast({
                    title: 'Error',
                    description: `Error receiving meetup updates: ${error.message}`,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        );

        return () => {
            unsubscribeFromMeetupUpdates();
        };
    }, [meetup]);

    useEffect(() => {
        const unsubscribeFromMessageUpdates = subscribeToMessageUpdates(
            supabase,
            meetup ? meetup.id : null,
            setMessages,
            (error) => {
                toast({
                    title: 'Error',
                    description: `Error receiving message updates: ${error.message}`,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        );

        return () => {
            unsubscribeFromMessageUpdates();
        };
    }, [messages]);

    useEffect(() => {
        if (messageData) {
            setMessages(messageData);
        }
    }, [messageData]);

    useEffect(() => {
        queryClient.invalidateQueries({
            queryKey: ['meetup', meetupId]
        })
    }, [showAnimation]);

    useEffect(() => {
        if (meetupData) {

            // setting the display path name
            var paths = pathname.split('/');
            for (let i = 0; i < paths.length; i++) {
                if (paths[i] === meetupData.id) {
                    paths[i] = '' // removing the item id, and switching. Need to test!
                } else if (paths[i] === meetupId) {
                    paths[i] = meetupData.item_title + ' Meetup';
                }
            }
            setDisplayPathName(paths.join('/'));

            // setting the step
            switch (meetupData.status) {
                case 'pending':
                    setActiveStep(1);
                case 'meeting':
                    setActiveStep(2);
                    break;
                case 'confirmed':
                    setActiveStep(3);
                    break;
                case 'complete':
                    setActiveStep(4);
                    break;
                case 'canceled':
                    setActiveStep(4);
                    break;
                default:
                    setActiveStep(0);
                    break;
            }

            setMeetup(meetupData);
        }
    }, [meetupData]);

    if (showAnimation) {
        return <SuccessfulPurchaseAnimation onAnimationEnd={() => setShowAnimation(false)} />
    }

    return (
        <Layout user={user} userProfile={userProfile ?? undefined} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts} loadingPathName={loadingMeetup} displayPathName={displayPathName}>
            {renderInfo(userProfile ?? null, meetup, locations ?? null, mapsAPIKey ?? null)}
            <CheckInModal isOpen={openCheckIn} onClose={() => setOpenCheckIn(false)} meetup={meetup} buyer={userProfile?.id === meetup?.buyer_id} isCheckingIn={checkinLoading} onCheckIn={handleCheckIn} mapsApiKey={mapsAPIKey ?? ""} />
            <ItemStatusModal isOpen={openItemStatus} onClose={() => setOpenItemStatus(false)} meetup={meetup} activeStep={activeStep} locations={locations ?? null} mapsAPIkey={mapsAPIKey ?? null} />
            {/* <RescheduleMeetupModal isOpen={openReschedule} onClose={() => setOpenReschedule(false)} meetup={meetup} isRescheduling={rescheuduleLoading} onReschedule={handleReschedule} buyer={userProfile?.id === meetup?.buyer_id} userProfile={userProfile} otherUserProfile={otherUserProfile ?? null} googleMapsAPIKey={mapsAPIKey ?? null} setUserProfile={setUserProfile} /> */}
        </Layout>
    )
}
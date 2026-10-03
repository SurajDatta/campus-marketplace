/**
 * SellerJourneyCard.tsx
 * A card that will allow sellers to see what their first steps are in becoming a seller. It will have 4 checkmarks, 1.Creating a seller account 2. Finish signing up with Stripe, 3. Adding general preferences to their account, 4. Creating their first listing.
 * @AshokSaravanan222
 * 09-20-2024
 */

import { MeetupPreferences, MeetupSchedule, Profile } from "@/types";
import { CheckCircleIcon } from "@chakra-ui/icons";

type SellerJourneyCardProps = {
    userProfile: Profile | undefined;
    loading: boolean;
    isMobile: boolean;
}

import { Button, ButtonGroup, Box, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverFooter, VStack, Text, HStack, Icon, Skeleton, IconButton, useToast, SkeletonCircle, Badge } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { FaRegCircle } from "react-icons/fa";
import { MdSell } from "react-icons/md";
import * as NextLink from 'next/link';
import { markSellerJourneyComplete } from "@/utils/services/sell";
import AuthButton from "../Layout/Header/AuthButton";
import { useQueryClient } from "@tanstack/react-query";

export default function SellerJourneyCard({ userProfile, loading, isMobile }: SellerJourneyCardProps) {
    const queryClient = useQueryClient();
    const initialFocusRef = React.useRef(null);
    const development = process.env.NEXT_PUBLIC_ENV === 'development';
    const pathname = usePathname()
    const [btnLoading, setBtnLoading] = React.useState(false);
    const toast = useToast();

    const getActiveStep = (userProfile: Profile) => {
        if ((development ? userProfile.test_account_id : userProfile.account_id) === null) {
            return 0
        } else if ((development ? userProfile.test_account_requirements : userProfile.account_requirements).length !== 0) {
            return 1
        } else if ((development ? userProfile.test_listings_created : userProfile.listings_created) === 0) {
            return 2
        } else {
            return 3
        }
    }


    const [activeStep, setActiveStep] = React.useState(0);
    const steps = [
        {
            title: "Create a seller account",
            description: "Create a seller account to start selling your items on Campus Marketplace.",
            cta: "Create Account"
        },
        {
            title: "Finish signing up with Stripe",
            description: "Finish signing up with Stripe to start receiving payments.",
            cta: "Finish Signup"
        },
        {
            title: "Create your first listing",
            description: "Create your first listing to start selling your items.",
            cta: "Create Listing"
        },
        {
            title: "You're all set!",
            description: "You have completed all the steps to become a seller on Campus Marketplace.",
            cta: "Mark Complete"
        }
    ]

    const handleClick = async (userId: string, development: boolean) => {
        setBtnLoading(true);
        try {
            const { success, error } = await markSellerJourneyComplete(userId, development);
            if (!success) {
                throw new Error("Failed to mark journey complete: " + error)
            }
            queryClient.invalidateQueries({
                queryKey: ['userProfile', userId]
            });
            toast({
                title: 'Journey marked complete.',
                description: 'You have completed all the steps to become a seller on Campus Marketplace.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error marking journey complete.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setBtnLoading(false);
        }
    }

    useEffect(() => {
        if (userProfile) {
            setActiveStep(getActiveStep(userProfile));
        }
    }, [userProfile])


    return (
        <Popover
            initialFocusRef={initialFocusRef}
            closeOnBlur={true}
        >
            <PopoverTrigger>
                {loading ? <></> : (development ? (userProfile?.test_account_id && !userProfile?.test_completed_journey) : (userProfile?.account_id && !userProfile?.completed_journey)) ? <IconButton aria-label="Seller Journey" icon={<Icon as={MdSell} boxSize={7} />} isRound boxSize={"50px"} colorScheme="blue" /> : <></>}
            </PopoverTrigger>
            {!loading && isMobile && (development ? (userProfile?.test_account_id && !userProfile?.test_completed_journey) : (userProfile?.account_id && !userProfile?.completed_journey)) && <Text fontSize={"xs"}>Sell</Text>}
            <PopoverContent color='white' bg='blue.800' borderColor='blue.800'>
                {!loading && userProfile === null ?
                    <>
                        <PopoverHeader pt={4} fontWeight='bold' border='0'>
                            Seller Journey
                        </PopoverHeader>
                        <PopoverArrow bg='blue.800' />
                        <PopoverCloseButton />
                        <PopoverBody>
                            <Text>Create an account or sign in to start your seller journey.</Text>
                        </PopoverBody>
                        <PopoverFooter
                            border='0'
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                            pb={4}
                        >
                            <ButtonGroup size='sm'>
                                <AuthButton />
                            </ButtonGroup>
                        </PopoverFooter>
                    </> :
                    <>
                        <PopoverHeader pt={4} fontWeight='bold' border='0'>
                            Seller Journey
                        </PopoverHeader>
                        <PopoverArrow bg='blue.800' />
                        <PopoverCloseButton />
                        <PopoverBody>
                            <VStack align={"left"} >
                                <Text>Your steps to becoming a seller on the platform:</Text>
                                <Skeleton isLoaded={userProfile !== null}>
                                    <HStack>
                                        {activeStep > 0 ? <CheckCircleIcon color="green.500" /> : <Icon as={FaRegCircle} color={"white"} />}
                                        <Text>{steps[0].title}</Text>
                                    </HStack>
                                </Skeleton>
                                <Skeleton isLoaded={userProfile !== null}>
                                    <HStack>
                                        {activeStep > 1 ? <CheckCircleIcon color="green.500" /> : <Icon as={FaRegCircle} color={"white"} />}
                                        <Text>{steps[1].title}</Text>
                                    </HStack>
                                </Skeleton>
                                <Skeleton isLoaded={userProfile !== null}>
                                    <HStack>
                                        {activeStep > 2 ? <CheckCircleIcon color="green.500" /> : <Icon as={FaRegCircle} color={"white"} />}
                                        <Text>{steps[2].title}</Text>
                                    </HStack>
                                </Skeleton>
                                <Skeleton isLoaded={userProfile !== null}>
                                    <Text>{steps[activeStep].description}</Text>
                                </Skeleton>
                            </VStack>
                        </PopoverBody>
                        <PopoverFooter
                            border='0'
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                            pb={4}
                        >
                            <Skeleton isLoaded={userProfile !== null}>
                                <Box fontSize='sm'>{activeStep !== 4 ? `Step ${activeStep + 1} of 3` : 'Steps Complete'}</Box>
                            </Skeleton>
                            <Skeleton isLoaded={userProfile !== null}>
                                <ButtonGroup size='sm'>
                                    <Button colorScheme='blue' ref={initialFocusRef} as={NextLink.default} href={activeStep  === 3 ? `${window.location.origin}/${pathname}` : '/sell'} isLoading={btnLoading} onClick={() => {
                                        if (activeStep === 3 && userProfile) {
                                            handleClick(userProfile.id, development)
                                        }
                                    }}>{steps[activeStep].cta}</Button>
                                </ButtonGroup>
                            </Skeleton>
                        </PopoverFooter>
                    </>}
            </PopoverContent>
        </Popover>
    )
}
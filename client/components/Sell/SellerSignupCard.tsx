/**
 * SellerSignupCard.tsx
 * Card that will allow users to sign up to become a seller while waiting for the email to come in.
 * @AshokSaravanan222
 * 09-17-2024
 */

import { ArrowForwardIcon, CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import { Button, CircularProgress, CircularProgressLabel, HStack, Icon, Link, Skeleton, Text, useToast, VStack } from "@chakra-ui/react";
import { MdSell } from "react-icons/md";
import * as NextLink from 'next/link';
import { Profile, User } from "@/types";
import { useState } from "react";
import { createOnboardingLink, createStripeAccount } from "@/utils/services/stripe";
import { createSellerAccount } from "@/utils/services/account";
import { usePathname, useRouter } from "next/navigation";

type SellerSignupCardProps = {
    user: User | null
    userProfile: Profile | null;
    development: boolean;
}

export default function SellerSignupCard({ user, userProfile, development }: SellerSignupCardProps) {
    const [sellerStatusLoading, setSellerStatusLoading] = useState<boolean>(false);
    const toast = useToast();
    const router = useRouter();
    const pathname = usePathname()

    const handleSignUp = async () => {
        setSellerStatusLoading(true);
        try {
            if (!user || !userProfile) {
                throw new Error("User or Profile not found.")
            }

            const { accountId, error: stripeError } = await createStripeAccount(userProfile, user, development);
            if (accountId) {
                const { success, error } = await createSellerAccount(userProfile.id, accountId, development)
                if (!success) {
                    throw new Error("Failed to create account: " + error)
                } else {
                    const url = await createOnboardingLink(accountId, pathname, true)
                    if (url) {
                        router.push(url);
                    } else {
                        throw new Error("Failed to create onboarding link.")
                    }
                }
            } else {
                throw new Error("Failed to create account: " + stripeError)
            }
        } catch (error: any) {
            toast({
                title: 'Error creating account.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSellerStatusLoading(false)
        }
    };

    const handleContinue = async () => {
        if (!user || !userProfile) {
            throw new Error("User or Profile not found.")
        }
        const accountId = development ? userProfile.test_account_id : userProfile.account_id;
        if (!accountId) {
            throw new Error("Account not found.")
        }
        const url = await createOnboardingLink(accountId, pathname, true)
        if (url) {
            router.push(url);
        } else {
            toast({
                title: 'Error creating account.',
                description: "Failed to create onboarding link.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }

    return (
        <VStack align={"left"} p={4} borderRadius="lg" border={"1px solid black"}>
            <h1 className="text-xl font-bold">Want to become a seller?</h1>
            <Text fontSize={"sm"}>While waiting for the email to arrive, you can start becoming a seller using <Link color={"teal.500"} href='https://stripe.com' isExternal as={NextLink.default} rel="noopener noreferrer"
                target="_blank">Stripe</Link>. Learn more <Link color={"teal.500"} href="/about#sell-details" as={NextLink.default} rel="noopener noreferrer"
                    target="_blank">here</Link>.</Text>
            <HStack>
                {userProfile && (development ? userProfile.test_account_id : userProfile.account_id) ?
                    (development ? userProfile.test_account_requirements?.length : userProfile.account_requirements?.length) === 0 ?
                        <>
                            <Text fontSize={"sm"} as={"b"}>Account Created</Text>
                            <CheckCircleIcon color={"green.500"} />
                        </>
                        : <>
                            <Button size={"sm"} colorScheme='blue' isLoading={sellerStatusLoading} onClick={handleContinue} rightIcon={<ArrowForwardIcon />}>Continue</Button>
                            <CircularProgress value={100 - (((development ? (userProfile.test_account_requirements ? userProfile.test_account_requirements.length : 12) : (userProfile.account_requirements ? userProfile.account_requirements.length : 12)) / 12) * 100)} >
                                <CircularProgressLabel>{(100 - (((development ? (userProfile.test_account_requirements ? userProfile.test_account_requirements.length : 12) : (userProfile.account_requirements ? userProfile.account_requirements.length : 12)) / 12) * 100)).toFixed(0)}%</CircularProgressLabel>
                            </CircularProgress>
                        </>
                    :
                    <>
                        <Button size={"sm"} colorScheme='blue' leftIcon={<Icon as={MdSell} />} isLoading={sellerStatusLoading} onClick={handleSignUp}>Start Selling</Button>
                        <HStack>
                            <TimeIcon />
                            <Text fontSize={"sm"}>5 min remaining</Text>
                        </HStack>
                    </>

                }
            </HStack>
        </VStack>
    )
}
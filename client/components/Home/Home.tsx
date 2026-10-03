/**
 * Home.tsx
 * Will be used with pre-fetching to show the details of Campus Marketplace.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client"
import { Profile, User } from "@/types";
import Layout from "../Layout/Layout"
import { getUserProfile } from "@/utils/queries/get-user-profile";
import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getAlerts } from "@/utils/queries/get-alerts";
import { useEffect, useState } from "react";
import { AspectRatio, Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Icon, Link, SimpleGrid, Spacer, Text, useBreakpointValue, useToast, VStack } from "@chakra-ui/react";
import { TypeAnimation } from "react-type-animation";
import Image from "next/image";
import * as NextLink from "next/link";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import AnimatedIcon from "../Common/Other/AnimatedIcon";
import Carousel from "./Carousel";
import HowItWorks from "./HowItWorks";
import MadeForSellers from "./MadeForSellers";
import FAQ from "./FAQ";
import { useRouter } from "next/navigation";
import { fetchUser } from "@/utils/services/auth";
import { fetchUserProfile, updatePhone } from "@/utils/services/account";
import { getUser } from "@/utils/queries/get-user";

export default function Home() {
    const supabase = useSupabaseBrowser()
    const router = useRouter()
    const toast = useToast()
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;

    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [startBuyingButtonLoading, setStartBuyingButtonLoading] = useState(false);

    // Step 1: Fetch user data
    const { data: userData, isLoading: loadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUser(supabase),
    });

    // Step 2: Fetch user profile, only if user exists
    const { data: userProfileData, isLoading: loadingProfile } = useQuery({
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

    const renderHeroSection = (loggedIn: boolean) => {
        return (
            <div className="animate-in">
                <Flex
                    direction={{ base: 'column', md: 'row-reverse' }}
                    align="center"
                    justify="center"
                    position="relative"  // Keep relative to contain floating icons over the image
                    overflow="hidden"    // Ensure overflow is hidden if icons move outside
                >
                    {/* Image as a parent container for floating images */}
                    <Box position="relative" width={{ base: '70%', md: "45%" }}>
                        <Image
                            src={"/images/campus-marketplace-logo.png"}
                            height={600}
                            width={600}
                            alt='Campus Marketplace Logo'
                            priority
                        />
                    </Box>

                    <Spacer display={{ base: 'none', md: 'block' }} />
                    <VStack align={{ base: 'flex-start', md: 'flex-start' }} textAlign={{ base: 'left', md: 'left' }} spacing={4} maxW="2xl" p={4}>
                        <Text fontSize={{ base: '4xl', md: '7xl' }}>
                            A marketplace made
                            <TypeAnimation
                                sequence={[
                                    ' by',
                                    3000,
                                    ' for',
                                    3000,
                                ]}
                                deletionSpeed={10}
                                speed={10}
                                style={{ color: '#ceb888' }}
                                repeat={Infinity}
                            />
                            campus students
                        </Text>
                        <Text fontSize={{ base: 'md', md: '2xl' }} opacity="0.5">
                            Safe, secure, and easy, with <Link color={"#3182ce"} style={{ textDecoration: "none", cursor: "auto" }}>scam-free</Link> transactions in minutes.
                        </Text>
                        <Flex direction="row" justify="center" wrap="wrap" gap={2}>
                            <Button
                                role='group'
                                as={NextLink.default}
                                href={"/buy"}
                                colorScheme='blue'
                                isLoading={startBuyingButtonLoading}
                                onClick={() => setStartBuyingButtonLoading(true)}
                                rightIcon={
                                    <Icon
                                        as={ArrowForwardIcon}
                                        transition="transform 0.2s"
                                        _groupHover={{ transform: 'translateX(4px)' }}
                                    />
                                }
                            >
                                Start Buying
                            </Button>
                            {/* {loggedIn ? (
                                <Button
                                    role='group'
                                    as={NextLink.default}
                                    href={"/my-stuff"}
                                    colorScheme='blue'
                                    variant={'outline'}
                                    rightIcon={
                                        <Icon
                                            as={ArrowForwardIcon}
                                            transition="transform 0.2s"
                                            _groupHover={{ transform: 'translateX(4px)' }}
                                        />
                                    }
                                >
                                    My Stuff
                                </Button>
                            ) : (
                                <Button
                                    role='group'
                                    as={NextLink.default}
                                    href="/signup"
                                    colorScheme='blue'
                                    variant={'outline'}
                                    rightIcon={
                                        <Icon
                                            as={ArrowForwardIcon}
                                            transition="transform 0.2s"
                                            _groupHover={{ transform: 'translateX(4px)' }}
                                        />
                                    }
                                >
                                    Signup
                                </Button>
                            )} */}
                        </Flex>
                    </VStack>
                </Flex>
            </div>
        )
    }

    const renderWhoWeAreSection = () => {
        return (
            <VStack align={"left"}>
                <Text fontSize={{ base: '4xl', md: '7xl' }}>Who we are</Text>
                <SimpleGrid columns={isMobile ? 2 : 4} spacing={4}>
                    {[
                        { title: "Reliable", icon: "https://cdn.lordicon.com/xuyycdjx.json", description: "Buyers pay before receiving the item, ensuring genuine intent." },
                        { title: "Secure", icon: "https://cdn.lordicon.com/mjcariee.json", description: "Funds are released to the seller after the buyer verifies the item." },
                        { title: "Flexible", icon: "https://cdn.lordicon.com/qnpnzlkk.json", description: "If the seller allows, buyers can negotiate the price." },
                        { title: "Central", icon: "https://cdn.lordicon.com/jnikqyih.json", description: "No more hectic Snapchat stories or GroupMe groupchats." }
                    ].map((item, index) => (
                        <Box
                            key={index}
                            borderWidth="1px"
                            borderRadius="lg"
                            p={6}
                            bg={"#ceb888"}
                            transition="transform 0.2s ease-in-out"
                            _hover={{
                                transform: "scale(1.03)",
                            }}
                        >
                            <VStack align={"left"}>
                                <Heading>{item.title}</Heading>
                                <AnimatedIcon
                                    src={item.icon}
                                    trigger="hover"
                                    style={{ width: "100px", height: "100px" }}
                                    colors="primary:#000000"
                                >
                                </AnimatedIcon>
                                <Text>{item.description}</Text>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </VStack>
        )
    }

    const renderWhyCampusMarketplaceSection = () => {
        return (
            <VStack p={2} align={"end"}>
                <Text fontSize={{ base: '4xl', md: '7xl' }}>Why Campus Marketplace</Text>
                <Carousel />
            </VStack>
        )
    }

    const renderHowItWorksSection = () => {
        return (
            <HowItWorks isMobile={isMobile} />
        )
    }

    const renderMadeForSellersSection = () => {
        return (
            <VStack p={2} align={"end"}>
                <Text fontSize={{ base: '4xl', md: '7xl' }}>Designed For Students</Text>
                <MadeForSellers isMobile={isMobile} />
            </VStack>
        )
    }

    const renderFAQSection = () => {
        return (
            <VStack align={"left"}>
                <Text fontSize={{ base: '4xl', md: '7xl' }}>Frequently Asked Questions</Text>
                <FAQ />
            </VStack>
        )
    }

    const renderOurMissionSection = () => {
        return (
            <VStack>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg={"gray.100"}>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                        <GridItem colSpan={{ base: 3, md: 1 }}>
                            <Center>
                                <AspectRatio ratio={1} width={{ base: "30%", md: "50%" }} borderRadius={"lg"} bg={"white"}>
                                    <Link href='/buy' as={NextLink.default}>
                                        <Image
                                            src="/images/campus-marketplace-logo.png"
                                            alt="Campus Marketplace Logo"
                                            width={200}
                                            height={200}
                                        />
                                    </Link>
                                </AspectRatio>
                            </Center>
                        </GridItem>
                        <GridItem colSpan={{ base: 3, md: 2 }}>
                            <VStack align={"left"}>
                                <Text fontSize={{ base: '2xl', md: '5xl' }}>Our Mission</Text>
                                <Text fontSize={{ base: 'xl', md: '2xl' }} opacity="0.5">
                                    "To provide a safe, secure, and frictionless marketplace for students to buy and sell items."
                                </Text>
                                <HStack>
                                    <Button as={NextLink.default} href={"/about"} colorScheme='blue' m={2}>
                                        Learn More
                                    </Button>
                                    <Button as={NextLink.default} href={"/contact"} colorScheme='blue' variant='outline' m={2}>
                                        Contact Us
                                    </Button>
                                </HStack>
                            </VStack>
                        </GridItem>
                    </Grid>
                </Box>
            </VStack>
        )
    }


    const renderHomeContent = (loggedIn: boolean, isMobile: boolean) => {
        return (
            <VStack align={"left"} spacing={20}>
                {renderHeroSection(loggedIn)}
                {renderWhoWeAreSection()}
                {renderWhyCampusMarketplaceSection()}
                {renderHowItWorksSection()}
                {renderMadeForSellersSection()}
                {renderFAQSection()}
                {renderOurMissionSection()}
            </VStack>
        )
    }

    useEffect(() => {
        const fetchUserDetails = async (accessToken: string) => {
            const user = await fetchUser(accessToken);
            const userProfile = user ? await fetchUserProfile(user.id) : null;
            setUser(user);
            setUserProfile(userProfile);

            urlParams.delete('access_token');
            const newUrl = window.location.pathname + '?' + urlParams.toString();
            router.replace(newUrl);
            toast({
                title: "Welcome!",
                description: "You have successfully created an account.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        if (accessToken) {
            fetchUserDetails(accessToken);
        }
    }, [router]);

    useEffect(() => {
        if (userData) {
            setUser(userData);
        }
    }, [userData]);

    useEffect(() => {
        if (userProfileData) {
            setUserProfile(userProfileData);
        }
    }, [userProfileData]);


    return (
        <Layout user={user ?? undefined} userProfile={userProfile ?? undefined} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts} visitorContent={
            renderHomeContent(false, isMobile)
        }>
            {renderHomeContent(true, isMobile)}
        </Layout>
    )
}

/**
 * NewHeader.tsx
 * Header to be shown on the top of every screen, providing links to the main pages of the website, and the user's profile.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect, useRef } from "react";
import {
    Flex,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Icon,
    Box,
    Text,
    Link,
    HStack,
    SkeletonCircle,
    VStack,
    SkeletonText,
    Grid,
    GridItem,
    Center,
    Spacer,
    Menu,
    MenuButton,
    Skeleton
} from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";
import AuthButton from "./AuthButton";
import ProfileButton from "./ProfileButton";
import { Alert, Profile } from "@/types";
import * as NextLink from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { MdSell } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import AlertButton from "./Alert/AlertButton";
import Image from "next/image";
import AnimatedIcon from "@/components/Common/Other/AnimatedIcon";
import { IoPersonCircleOutline } from "react-icons/io5";

type HeaderProps = {
    userProfile: Profile | undefined;
    alerts: Alert[] | undefined;
    loading: boolean;
    loadingAlerts: boolean;
    loggedIn: boolean;
    isMobile: boolean;
    onSignOut: () => void;
    onClearAlerts: (alertIds: string[]) => Promise<void>;
    onAlertRead: (alertId: string, status: boolean) => Promise<void>;
    onDeleteAlert: (alertId: string) => Promise<void>;
    onViewedBanner: () => void;
};

export default function Header({ userProfile, loggedIn, loading, isMobile, onSignOut, onClearAlerts, onAlertRead, alerts, onViewedBanner, onDeleteAlert }: HeaderProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const size = 75
    const development = process.env.NEXT_PUBLIC_ENV === 'development';

    const unreadCount = alerts?.filter((alert) => !alert.read).length ?? 0;

    const alertButtonRef = useRef<HTMLButtonElement>(null);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            {<HStack
                width="100%"
                bg="#d1a954"
                transition="all 0.5s ease"
                height={userProfile ? (!userProfile.viewed_banner ? "40px" : "0px") : "0px"} // Smooth transition for height
                opacity={!userProfile?.viewed_banner ? 1 : 0} // Smooth transition for opacity
                overflow="hidden" // Hide content when collapsed
            >
                <Spacer />
                <Center>
                    <Text fontSize={"sm"} as={"b"}>We have launched! Click <Link as={NextLink.default} href={"/updates"} color={"teal.500"} onClick={() => {
                        onViewedBanner()
                    }}>here</Link> for more!</Text>
                </Center>
                <Spacer />
                <IconButton
                    aria-label='Close'
                    bg={"transparent"}
                    _hover={{
                        bg: "transparent"
                    }}
                    onClick={() => {
                        onViewedBanner()
                    }}
                    size={"xs"}
                    icon={<CloseIcon boxSize={5} pr={2} />}
                />
            </HStack>}
            <Box
                as="nav"
                width="100%"
                bg="#ceb888"
            >
                {isMobile ? (
                    (loggedIn) ? (
                        <Grid
                            templateRows="repeat(2, 1fr)"
                            templateColumns="repeat(5, 1fr)"
                            px={{ base: 4, md: 5 }}
                            py={{ base: 2, md: 4 }}
                            justifyContent="space-between"
                            alignItems="center"
                            mx="auto"
                            width="100%"
                        >
                            <GridItem rowSpan={1} colSpan={5}>
                                <Center>
                                    <Link href="/" as={NextLink.default}>
                                        <HStack spacing={1}>
                                            {/* <Box color={"white"} pb={2}>
                      <Image src={"/images/campus-marketplace-logo.png"} alt="Campus Marketplace Logo" height={size / 1.5} width={size / 1.5} />
                    </Box> */}
                                            <Box color={"white"}>
                                                <Box>
                                                    <Image src={"/images/campus-marketplace-wordmark.png"} alt="Campus Marketplace Logo" height={size / 2} width={300} />
                                                </Box>
                                            </Box>
                                        </HStack>
                                    </Link>
                                </Center>
                            </GridItem>
                            <GridItem rowSpan={1} colSpan={1}>
                                <Link href="/buy" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                    <VStack>
                                        <AnimatedIcon
                                            src="https://cdn.lordicon.com/pbrgppbb.json"
                                            trigger="hover"
                                            colors="primary:#000000"
                                            style={{ width: size / 4, height: size / 4 }}
                                        />
                                        <Text>Buy</Text>
                                    </VStack>
                                </Link>
                            </GridItem>
                            <GridItem rowSpan={1} colSpan={1}>
                                <Link href={`/sell`} as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                    <VStack>
                                        <AnimatedIcon
                                            src="https://cdn.lordicon.com/fnxnvref.json"
                                            trigger="hover"
                                            colors="primary:#000000"
                                            style={{ width: size / 4, height: size / 4 }}
                                        />
                                        <Text>Sell</Text>
                                    </VStack>
                                </Link>
                            </GridItem>
                            <GridItem rowSpan={1} colSpan={1}>
                                <Link href="/my-stuff" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                    <VStack>
                                        <AnimatedIcon
                                            src="https://cdn.lordicon.com/ipnwkgdy.json"
                                            trigger="hover"
                                            colors="primary:#000000"
                                            style={{ width: size / 4, height: size / 4 }}
                                        />
                                        <Text>MyStuff</Text>
                                    </VStack>
                                </Link>
                            </GridItem>
                            <GridItem rowSpan={1} colSpan={1}>
                                {/* <AnimatedIcon
                                        src={"https://cdn.lordicon.com/lznlxwtc.json"}
                                        trigger="hover"
                                        style={{ width: size / 4, height: size / 4 }}
                                        colors="primary:#000000"
                                    >
                                        {unreadCount > 0 && <Box
                                            position="absolute"
                                            top="-1"
                                            left="3"
                                            background="red.500"
                                            color="white"
                                            borderRadius="full"
                                            width={isMobile ? "3" : "4"}
                                            height={isMobile ? "3" : "4"}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontSize={isMobile ? "3xs" : "xs"}
                                            zIndex={1}
                                        >
                                            {unreadCount}
                                        </Box>}
                                    </AnimatedIcon> */}
                                <AlertButton
                                    userProfile={userProfile}
                                    loggedIn={loggedIn}
                                    loading={loading}
                                    height={size / 4}
                                    onClearAlerts={onClearAlerts}
                                    onMarkAlertRead={onAlertRead}
                                    alerts={alerts}
                                    isMobile={isMobile}
                                    onDeleteAlert={onDeleteAlert}
                                />
                            </GridItem>
                            <GridItem rowSpan={1} colSpan={1}>
                                {/* <AnimatedIcon
                                        src={"https://cdn.lordicon.com/hrjifpbq.json"}
                                        trigger="hover"
                                        style={{ width: size / 4, height: size / 4 }}
                                        colors="primary:#000000"
                                        fallback={<Icon as={IoPersonCircleOutline} boxSize={size / 4} />}
                                    /> */}
                                <ProfileButton
                                    isMobile={isMobile}
                                    userProfile={userProfile}
                                    loggedIn={loggedIn}
                                    loading={loading}
                                    onSignOut={onSignOut}
                                    height={size / 4}
                                    development={development}
                                />
                            </GridItem>
                        </Grid>
                    ) : <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        mx="auto"
                        px={{ base: 4, md: 5 }}
                        py={{ base: 2, md: 4 }}
                        width="100%"
                        height={size}
                        gap={{ base: 4, md: 4 }}
                    >
                        <Link href="/" as={NextLink.default}>
                            <HStack spacing={1}>
                                {/* <Box color={"white"} pb={2}>
                      <Image src={"/images/campus-marketplace-logo.png"} alt="Campus Marketplace Logo" height={size / 1.5} width={size / 1.5} />
                    </Box> */}
                                <Box color={"white"}>
                                    <Box>
                                        <Image src={"/images/campus-marketplace-wordmark.png"} alt="Campus Marketplace Logo" height={size / 2} width={300} />
                                    </Box>
                                </Box>
                            </HStack>
                        </Link>
                        <Skeleton isLoaded={!loading}>
                            <AuthButton />
                        </Skeleton>
                    </Flex>
                ) : (
                    <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        mx="auto"
                        px={{ base: 4, md: 5 }}
                        py={{ base: 2, md: 4 }}
                        width="100%"
                        height={size}
                        gap={{ base: 4, md: 4 }}
                    >
                        <Link href="/" as={NextLink.default}>
                            <HStack spacing={1}>
                                {/* <Box color={"white"} pb={2}>
                                    <Image src={"/images/campus-marketplace-logo.png"} alt="Campus Marketplace Logo" height={size / 1.5} width={size / 1.5} />
                                </Box> */}
                                <Image src={"/images/campus-marketplace-wordmark.png"} alt="Campus Marketplace Logo" height={size / 2} color={"white"} width={300} />
                            </HStack>
                        </Link>
                        {loggedIn ? <HStack spacing={12}>
                            <Link href="/buy" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                <HStack>
                                    <AnimatedIcon
                                        src="https://cdn.lordicon.com/pbrgppbb.json"
                                        trigger="hover"
                                        colors="primary:#000000"
                                        style={{ width: size / 2, height: size / 2 }}
                                    />
                                    <Text fontSize={"lg"} fontWeight={700}>Buy</Text>
                                </HStack>
                            </Link>
                            <Link href={`/sell`} as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                <HStack>
                                    <AnimatedIcon
                                        src="https://cdn.lordicon.com/fnxnvref.json"
                                        trigger="hover"
                                        colors="primary:#000000"
                                        style={{ width: size / 2, height: size / 2 }}
                                    />
                                    <Text fontSize={"lg"} fontWeight={700}>Sell</Text>
                                </HStack>
                            </Link>
                            <Link href="/my-stuff" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                <HStack>
                                    <AnimatedIcon
                                        src="https://cdn.lordicon.com/ipnwkgdy.json"
                                        trigger="hover"
                                        colors="primary:#000000"
                                        style={{ width: size / 2, height: size / 2 }}
                                    />
                                    <Text fontSize={"lg"} fontWeight={700}>MyStuff</Text>
                                </HStack>
                            </Link>
                            {/* <AnimatedIcon
                                    src={"https://cdn.lordicon.com/lznlxwtc.json"}
                                    trigger="hover"
                                    style={{ width: size / 2, height: size / 2 }}
                                    colors="primary:#000000"
                                    onClick={alertButtonRef.current?.click}
                                >
                                    {unreadCount > 0 && <Box
                                        position="absolute"
                                        top="-1"
                                        left="6"
                                        background="red.500"
                                        color="white"
                                        borderRadius="full"
                                        width={isMobile ? "3" : "4"}
                                        height={isMobile ? "3" : "4"}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontSize={isMobile ? "3xs" : "xs"}
                                        zIndex={1}
                                    >
                                        {unreadCount}
                                    </Box>}
                                </AnimatedIcon> */}
                            <AlertButton
                                userProfile={userProfile}
                                loggedIn={loggedIn}
                                loading={loading}
                                height={size / 2}
                                onClearAlerts={onClearAlerts}
                                onMarkAlertRead={onAlertRead}
                                alerts={alerts}
                                isMobile={isMobile}
                                onDeleteAlert={onDeleteAlert}
                            />

                            {/* <AnimatedIcon
                                    src={"https://cdn.lordicon.com/hrjifpbq.json"}
                                    trigger="hover"
                                    style={{ width: size / 2, height: size / 2 }}
                                    colors="primary:#000000"
                                    fallback={<Icon as={IoPersonCircleOutline} boxSize={size / 2} />}
                                /> */}
                            <ProfileButton
                                isMobile={isMobile}
                                userProfile={userProfile}
                                loggedIn={loggedIn}
                                loading={loading}
                                onSignOut={onSignOut}
                                height={size / 2}
                                development={development}
                            />

                            {/* <HStack>
                                <AlertButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingAlerts} height={size / 2} onClearAlerts={onClearAlerts} onMarkAlertRead={onAlertRead} alerts={alerts} isMobile={isMobile} onDeleteAlert={onDeleteAlert} />
                                <ProfileButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingProfile} onSignOut={onSignOut} height={size / 2} development={development} />
                            </HStack> */}

                            {/* <AlertButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingAlerts} height={size / 2} onClearAlerts={onClearAlerts} onMarkAlertRead={onAlertRead} alerts={alerts} isMobile={isMobile} onDeleteAlert={onDeleteAlert} />
              <ProfileButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingProfile} onSignOut={onSignOut} height={size / 2} development={development} /> */}

                        </HStack> :
                            <Skeleton isLoaded={!loading}>
                                <AuthButton />
                            </Skeleton>
                        }
                    </Flex>
                )
                }
                <Drawer placement="left" onClose={onClose} isOpen={isOpen} size={"xs"}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader bg={"#ceb888"}>
                            <Link href="/" as={NextLink.default}>
                                <HStack spacing={1}>
                                    {/* <Box color={"white"} pb={1}>
                    <Image src={"/images/campus-marketplace-logo.png"} alt="Campus Marketplace Logo" height={35} width={35} />
                  </Box> */}
                                    <Box color={"white"} pb={1} width={"70%"}>
                                        <Image src={"/images/campus-marketplace-wordmark.png"} alt="Campus Marketplace Logo" height={35} width={300} />
                                    </Box>
                                </HStack>
                            </Link>
                        </DrawerHeader>
                        <DrawerBody>
                            <VStack align={"left"}>
                                <Link href="/buy" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                    <HStack>
                                        <Icon as={FaShoppingCart} />
                                        <Text as={'b'} fontSize={"xl"}>Buy</Text>
                                    </HStack>
                                </Link>
                                <Link href={`/sell`} as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                    <HStack>
                                        <Icon as={MdSell} />
                                        <Text as={'b'} fontSize={"xl"}>Sell</Text>
                                    </HStack>
                                </Link>
                                <Link href="/my-stuff" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                                    <HStack>
                                        <Icon as={MdDashboard} />
                                        <Text as={'b'} fontSize={"xl"}>MyStuff</Text>
                                    </HStack>
                                </Link></VStack>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Box >
        </>
    )
}

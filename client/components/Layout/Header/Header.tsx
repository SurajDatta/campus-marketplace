/**
 * Header.tsx
 * Header to be shown on the top of every screen, providing links to the main pages of the website, and the user's profile. TODO: add back in the drawer, and have a 2 layered mobile view, with logo on top and 5 icons right below.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect } from "react";
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
  Spacer
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

type HeaderProps = {
  userProfile: Profile | undefined;
  alerts: Alert[] | undefined;
  loadingProfile: boolean;
  loadingAlerts: boolean;
  loggedIn: boolean;
  isMobile: boolean;
  onSignOut: () => void;
  onClearAlerts: (alertIds: string[]) => Promise<void>;
  onAlertRead: (alertId: string, status: boolean) => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void>;
  onViewedBanner: () => void;
};

export default function Header({ userProfile, loggedIn, loadingProfile, loadingAlerts, isMobile, onSignOut, onClearAlerts, onAlertRead, alerts, onViewedBanner, onDeleteAlert }: HeaderProps) {
  const [viewedBanner, setViewedBanner] = React.useState<boolean>(userProfile ? userProfile.viewed_banner : true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const size = 75
  const development = process.env.NEXT_PUBLIC_ENV === 'development';

  useEffect(() => {
    setViewedBanner(userProfile ? userProfile.viewed_banner : true);
  }, [userProfile]);

  return (
    <>
      {<HStack
        width="100%"
        bg="#d1a954"
        transition="all 0.5s ease"
        height={viewedBanner ? "0" : "40px"} // Smooth transition for height
        opacity={viewedBanner ? 0 : 1} // Smooth transition for opacity
        overflow="hidden" // Hide content when collapsed
      >
        <Spacer />
        <Center>
          <Text fontSize={"sm"} as={"b"}>We have launched! Click <Link as={NextLink.default} href={"/updates"} color={"teal.500"} onClick={() => {
            setViewedBanner(true);
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
            setViewedBanner(true);
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
                  <Icon as={FaShoppingCart} />
                  <Text>Buy</Text>
                </VStack>
              </Link>
            </GridItem>
            <GridItem rowSpan={1} colSpan={1}>
              <Link href={`/sell`} as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                <VStack>
                  <Icon as={MdSell} />
                  <Text>Sell</Text>
                </VStack>
              </Link>
            </GridItem>
            <GridItem rowSpan={1} colSpan={1}>
              <Link href="/my-stuff" as={NextLink.default} passHref style={{ textDecoration: "none" }}>
                <VStack>
                  <Icon as={MdDashboard} />
                  <Text>MyStuff</Text>
                </VStack>
              </Link>
            </GridItem>
            <GridItem rowSpan={1} colSpan={1}>
              <VStack>
                <AlertButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingAlerts} height={size / 4} onClearAlerts={onClearAlerts} alerts={alerts} onMarkAlertRead={onAlertRead} isMobile={isMobile} onDeleteAlert={onDeleteAlert} />
                <Text>Alerts</Text>
              </VStack>
            </GridItem>
            <GridItem rowSpan={1} colSpan={1}>
              <VStack>
                <ProfileButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingProfile} onSignOut={onSignOut} height={size / 4} development={development} isMobile={isMobile} />
                <Text>Profile</Text>
              </VStack>
            </GridItem>
          </Grid>
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
            <HStack>
              <IconButton
                colorScheme='transparent'
                color={"black"}
                aria-label='Menu'
                icon={<HamburgerIcon boxSize={7} />}
                onClick={onOpen}
              />
            </HStack>
            <Link href="/" as={NextLink.default}>
              <HStack spacing={1}>
                {/* <Box color={"white"} pb={2}>
                  <Image src={"/images/campus-marketplace-logo.png"} alt="Campus Marketplace Logo" height={size / 1.5} width={size / 1.5} />
                </Box> */}
                <Image src={"/images/campus-marketplace-wordmark.png"} alt="Campus Marketplace Logo" height={size / 2} color={"white"} width={300}/>
              </HStack>
            </Link>
            <HStack>
              <AlertButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingAlerts} height={size / 2} onClearAlerts={onClearAlerts} onMarkAlertRead={onAlertRead} alerts={alerts} isMobile={isMobile} onDeleteAlert={onDeleteAlert} />
              <ProfileButton userProfile={userProfile} loggedIn={loggedIn} loading={loadingProfile} onSignOut={onSignOut} height={size / 2} development={development} isMobile={isMobile} />
            </HStack>

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
                    <Image src={"/images/campus-marketplace-wordmark.png"} alt="Campus Marketplace Logo" height={35} width={300}/>
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

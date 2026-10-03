import { Alert, Profile } from "@/types";
import { Menu, MenuButton, MenuList, MenuItem, Icon, Center, Spinner, Text, Badge, Box, useToast, Skeleton, HStack, IconButton, useDisclosure } from '@chakra-ui/react';
import AuthButton from "../AuthButton";
import { BellIcon, DeleteIcon, NotAllowedIcon } from "@chakra-ui/icons";
import React, { forwardRef, useEffect, useState } from "react";
import AlertCard from "./AlertCard";
import { fetchAlerts, markAlertRead, markAlertsRead } from "@/utils/services/alerts";
import { FaCircle } from "react-icons/fa";
import * as NextLink from 'next/link';
import { subscribeToAlerts } from "@/utils/services/realtime";
import { BsThreeDotsVertical } from "react-icons/bs"
import { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverBody, PopoverFooter, Button } from "@chakra-ui/react";
import { Grid, GridItem, VStack, Image, AspectRatio } from "@chakra-ui/react";
import { removeBoldMarkers } from "@/utils/textConversion";
import AnimatedIcon from "@/components/Common/Other/AnimatedIcon";

type AlertButtonProps = {
    userProfile: Profile | undefined;
    loggedIn: boolean;
    loading: boolean;
    height: number;
    alerts: Alert[] | undefined;
    onClearAlerts: (alertIds: string[]) => Promise<void>;
    onMarkAlertRead: (alertId: string, status: boolean) => Promise<void>;
    onDeleteAlert: (alertId: string) => Promise<void>;
    isMobile: boolean;
}

export default function AlertButton(props: AlertButtonProps) {
    const {
        userProfile,
        loggedIn,
        loading,
        height,
        alerts,
        onClearAlerts,
        onMarkAlertRead,
        isMobile,
        onDeleteAlert,
    } = props;

    const [isClearing, setIsClearing] = useState(false);
    const [isChangingRead, setIsChangingRead] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteNotification = async (alertId: string) => {
        setIsDeleting(true);
        try {
            await onDeleteAlert(alertId);
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    }

    const handleMarkAlert = async (alertId: string, status: boolean) => {
        setIsChangingRead(true);
        try {
            await onMarkAlertRead(alertId, status);
        } catch (error: any) {
            console.error(error);
            return { success: false, error: error.message };
        } finally {
            setIsChangingRead(false);
            return { success: true, error: "" };
        }
    }

    const handleClearNotifications = async (alertIds: string[]) => {
        setIsClearing(true);
        try {
            await onClearAlerts(alertIds);
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsClearing(false);
        }
    }
    const toast = useToast();

    const unreadCount = alerts?.filter(alert => !alert.read).length || 0;

    return (
        <Menu >
            {isMobile ?
                <VStack>
                    <MenuButton as={IconButton} icon={
                        <AnimatedIcon
                            src={"https://cdn.lordicon.com/lznlxwtc.json"}
                            trigger="hover"
                            style={{ width: height, height: height }}
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
                                fontWeight={500}
                                fontSize={isMobile ? "3xs" : "xs"}
                                zIndex={1}
                            >
                                {unreadCount}
                            </Box>}
                        </AnimatedIcon>
                    } style={{ background: "transparent", border: "none" }} p={0} h={height} />
                    <Text fontSize={"md"} fontWeight={400}>Alerts</Text>
                </VStack> : <MenuButton fontSize={isMobile ? "md" : "lg"} fontWeight={isMobile ? 400 : 700} as={Button} leftIcon={
                    <AnimatedIcon
                        src={"https://cdn.lordicon.com/lznlxwtc.json"}
                        trigger="hover"
                        style={{ width: height, height: height }}
                        colors="primary:#000000"
                    >
                        {unreadCount > 0 && <Box
                            position="absolute"
                            top="-1"
                            left="5"
                            background="red.500"
                            color="white"
                            borderRadius="full"
                            width={isMobile ? "3" : "4"}
                            height={isMobile ? "3" : "4"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight={500}
                            fontSize={isMobile ? "3xs" : "xs"}
                            zIndex={1}
                        >
                            {unreadCount}
                        </Box>}
                    </AnimatedIcon>
                } style={{ background: "transparent", border: "none" }} p={0}>
                    Alerts
                </MenuButton>}
            {/* <AnimatedIcon
                src={"https://cdn.lordicon.com/lznlxwtc.json"}
                trigger="hover"
                style={{ width: height, height: height }}
                colors="primary:#000000"
            >
                <MenuButton ref={ref}>
                    {unreadCount > 0 && <Box
                        position="absolute"
                        top="-1"
                        right="-1"
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
                </MenuButton>
            </AnimatedIcon> */}
            <MenuList color="black">
                {!loading ?
                    <>
                        {(!loggedIn || !userProfile) ?
                            <Center>
                                <AuthButton />
                            </Center>
                            :
                            <Box maxH="300px" overflowY="auto">
                                {(alerts == null) ? (
                                    [...Array(3).keys()].map((key) => (
                                        <MenuItem key={key + 1} icon={<Icon as={FaCircle} color={"gray.100"} />}>
                                            <AlertCard alert={null} />
                                        </MenuItem>
                                    ))
                                ) : alerts.length === 0 ? (
                                    <Text p={2}>No alerts found.</Text>
                                ) : (
                                    <>
                                        <MenuItem icon={<NotAllowedIcon />} onClick={() => handleClearNotifications(alerts ? alerts.filter(alert => !alert.read).map(alert => alert.id) : [])} isDisabled={isClearing} key={0}>
                                            <Skeleton isLoaded={!isClearing}><Text>Mark All Notifications Read</Text></Skeleton>
                                        </MenuItem>
                                        {alerts.map((alert) => (
                                            <HStack pr={2}>
                                                <MenuItem
                                                    key={alert.id}
                                                    onClick={() => {
                                                        if (alert.read == false) {
                                                            handleMarkAlert(alert.id, true);
                                                        }
                                                    }}
                                                    width={"300px"}
                                                    as={NextLink.default}
                                                    href={alert.link}
                                                    pr={1}
                                                >
                                                    <AlertCard alert={alert} />
                                                </MenuItem>
                                                <VStack>
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <IconButton icon={<BsThreeDotsVertical />} aria-label="read/unread" size={"sm"} />
                                                        </PopoverTrigger>
                                                        <PopoverContent>
                                                            <PopoverArrow />
                                                            <PopoverHeader>
                                                                <Text opacity={0.5} noOfLines={1} fontSize={"xs"}>
                                                                    {new Date(alert.created_at).toLocaleString()}
                                                                </Text>
                                                            </PopoverHeader>
                                                            <PopoverCloseButton />
                                                            <PopoverBody>
                                                                <VStack align={"left"}>
                                                                    <Text fontSize={"xs"}>{removeBoldMarkers(alert.message)}</Text>
                                                                    <Button colorScheme='blue' isLoading={isChangingRead} onClick={async () => {
                                                                        const { success, error } = await handleMarkAlert(alert.id, !alert.read)
                                                                        toast({
                                                                            title: success ? "Success" : "Error",
                                                                            description: success ? `Alert marked as ${alert.read ? "unread" : "read"}` : error,
                                                                            status: success ? "success" : "error",
                                                                            duration: 5000,
                                                                            isClosable: true,
                                                                        });
                                                                    }}>
                                                                        Mark {alert.read ? "Unread" : "Read"}
                                                                    </Button>
                                                                </VStack>
                                                            </PopoverBody>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <IconButton icon={<DeleteIcon />} aria-label="read/unread" size={"sm"} colorScheme="red" />
                                                        </PopoverTrigger>
                                                        <PopoverContent>
                                                            <PopoverHeader>
                                                                <VStack align={"left"}>
                                                                    <Button colorScheme="red" onClick={() => handleDeleteNotification(alert.id)} size={"sm"} leftIcon={<DeleteIcon />} isLoading={isDeleting} >Delete Alert</Button>
                                                                </VStack>
                                                            </PopoverHeader>
                                                        </PopoverContent>
                                                    </Popover>
                                                </VStack>
                                            </HStack>
                                        ))}

                                    </>
                                )}
                            </Box>
                        }
                    </>
                    : <MenuItem icon={<Spinner size={"sm"} />}>Loading</MenuItem>}
            </MenuList>
        </Menu >
    );
}

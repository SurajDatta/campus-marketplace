/**
 * InitialModa.tsx
 * Will be used to show the user the initial modal right after the sign up, to tell them the next steps, and what they can do with the app.
 * @AshokSaravanan222
 * @09-20-2024
 */

import React from "react";
import { Button, ButtonGroup, Icon, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, UnorderedList, VStack } from "@chakra-ui/react";
import { MdDashboard, MdSell, MdShoppingCart } from "react-icons/md";
import { IoAccessibility } from "react-icons/io5";
import AnimatedIcon from "./AnimatedIcon";
import Image from "next/image";
import { ArrowForwardIcon, BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import { MdOutlineAccountCircle } from "react-icons/md";
import * as NextLink from "next/link";

type InitialModalProps = {
    isOpen: boolean;
    onClose: () => void;
}
export default function InitialModal({ isOpen, onClose }: InitialModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Welcome to Campus Marketplace!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align={"left"}>
                        <Image
                            src="/images/campus-marketplace-logo.png"
                            alt="Campus Marketplace Logo"
                            width={200}
                            height={200}
                        />
                        <Text>Thank you for creating an account with us -- You can now start using the marketplace!</Text>
                        <Text as={"b"}>Here are some tips to help you get started:</Text>
                        <UnorderedList>
                            <ListItem>Click the <b>Buy</b> <Icon as={MdShoppingCart} /> page to browse all items available for purchase. </ListItem>
                            <ListItem>Click the <b>Sell</b> <Icon as={MdSell} /> page to create and edit listings.</ListItem>
                            <ListItem>Click the <b>My Stuff</b> <Icon as={MdDashboard} /> page to see updates about your items.</ListItem>
                            <ListItem>Click the <b>Alerts</b> <BellIcon /> icon to see notifications.</ListItem>
                            <ListItem>Click the <b>Profile</b> <Icon as={MdOutlineAccountCircle} /> icon to manage account settings, preferences, and logout.</ListItem>
                            <ListItem>If you ever need help, you can press the  <b>Help</b> <Icon as={IoAccessibility} /> icon in the top right corner for more info.</ListItem>
                        </UnorderedList>
                        {/* <VStack>
                            <Text>Buy</Text>
                            <Text>1. Navigate to the buy page with the <Icon as={MdShoppingCart} /> on desktop or press the buy icon in the header on mobile.</Text>
                            <Text>2. Search by category to find the items you would like, and switch between different modes, like list and grid view, and preview images by hovering on them.</Text>
                            <Text>3. You can view more details by pressing on the items themselves.</Text>
                        </VStack>
                        <VStack>
                            <Text>Sell</Text>
                            <Text>1. Navigate to the sell page with the <Icon as={MdSell} /> on desktop or press the sell icon in the header on mobile.</Text>
                            <Text>2. Start selling, and track your progress with the seller journey icon located in the top right corner.</Text>
                            <Text>3. Create a listing using tools we have provided, like AI Autofill, Google Calendar Linking, and Blue Light Locations.</Text>
                        </VStack> */}
                        <Text></Text>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    {/* <Button mr={3} onClick={onClose}>
                        Close
                    </Button> */}
                    <ButtonGroup>
                        <Button colorScheme="blue" leftIcon={<Icon as={MdShoppingCart} />} onClick={onClose} as={NextLink.default} href={"/buy"}>Start Buying</Button>
                        <Button colorScheme="blue" leftIcon={<Icon as={MdSell} />} onClick={onClose} as={NextLink.default} href={"/sell"}>Start Selling</Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
/**
 * SubscriptionDrawer.tsx
 * Drawer to be used to describe to seller what benefits they will get from the pro verified plan
 * @AshokSaravanan222
 * 08-30-2024
 */
import React from "react"
import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Icon, Input, Text, useDisclosure } from "@chakra-ui/react"
import { MdCheckCircle, MdSell } from "react-icons/md"
import { List, ListItem, ListIcon } from "@chakra-ui/react"
import { CloseIcon } from "@chakra-ui/icons"

type SubscriptionDrawerProps = {
    handleSellerSubscription: () => void;
    submitLoading: boolean;
}

export default function SubscriptionDrawer({ handleSellerSubscription, submitLoading }: SubscriptionDrawerProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            <Button colorScheme='blue' onClick={onOpen} leftIcon={<Icon as={MdSell} />}>
                VSS
            </Button>
            <Drawer
                isOpen={isOpen}
                placement='bottom'
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        Verified Seller Subscription
                        <Text fontSize={"3xl"} color={"green.500"}>$5/month</Text>
                    </DrawerHeader>
                    
                    <DrawerBody>
                        <Text fontSize={"2xl"} as={"b"}>Why become a verified seller?</Text>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={MdCheckCircle} color={"blue.500"} />
                                Sell unlimited items for free, without us taking a $1 commission
                            </ListItem>
                            <ListItem>
                                <ListIcon as={MdCheckCircle} color='blue.500' />
                                Get a verified badge on your profile, so buyers know you are a trusted seller
                            </ListItem>
                            <ListItem>
                                <ListIcon as={MdCheckCircle} color='blue.500' />
                                Have your items show up first in search results, so you can gain more reach
                            </ListItem>
                        </List>
                    </DrawerBody>
                    <DrawerFooter>
                        <Button onClick={handleSellerSubscription} colorScheme="blue" isLoading={submitLoading}>Get Started</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}
/**
 * LocationSharingGuide.tsx
 * Guide to show the user how to share their location with the other person, if they don't have it enabled on safari.
 * @AshokSaravanan222
 * 09-09-2024
 */

import { Button, Divider, HStack, Icon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { FaApple, FaGoogle, FaLaptop, FaPhone } from 'react-icons/fa'

export default function LocationSharingGuide() {

    return (
        <Popover>
            <PopoverTrigger>
                <Button size={"sm"} colorScheme="blue">Open Guide</Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverHeader>Share Location Guide</PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>
                    <VStack align={"left"}>
                        <HStack>
                            <Icon as={FaPhone} />
                            <Text fontSize={"lg"} >Mobile</Text>
                        </HStack>
                        <Divider />
                        <VStack align={"left"} borderWidth={1} borderRadius={5} p={2}>
                            <HStack>
                                <Icon as={FaApple} />
                                <Text>Safari</Text>
                            </HStack>
                            <Text>{"Go to Settings > Privacy & Security > Location Services > Safari Websites > Ask Next Time Or When I Share. Enable Precise Location if desired."}</Text>
                        </VStack>

                        <HStack>
                            <Icon as={FaLaptop} />
                            <Text fontSize={"lg"}>Desktop</Text>
                        </HStack>
                        <Divider />

                        <VStack align={"left"} borderWidth={1} borderRadius={5} p={2}>
                            <HStack>
                                <Icon as={FaApple} />
                                <Text>Safari (Mac)</Text>
                            </HStack>
                            <Text>{"Go to Settings > Privacy & Security > Location Services > Safari. Flip the switch which allows you to share your location upon request."}</Text>
                        </VStack>

                        <VStack align={"left"} borderWidth={1} borderRadius={5} p={2}>
                            <HStack>
                                <Icon as={FaGoogle} />
                                <Text>Chrome</Text>
                            </HStack>
                            <Text>{"You may need to disable other extensions that can block location sharing, such as Location Guard. Click on the 3 dots in upper right corner (⌘, on Mac) > Settings > Privacy and Security > Location. You can decide which of the options you would like to allow under 'Sites can ask for your location'."}</Text>
                        </VStack>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}
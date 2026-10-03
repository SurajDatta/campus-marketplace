/**
 * HelpModal.tsx
 * Modal that users can view whenever they are stuck with the process. Will show them the basics of how to buy, sell, and FAQs about the platform. At the very bottom, it will show them a button to contact support if their questions were not answered.
 * @AshokSaravanan222
 * 09-20-2024
 */

import FAQ from "@/components/Home/FAQ";
import { BellIcon, CalendarIcon, QuestionIcon } from "@chakra-ui/icons";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Icon, IconButton, VStack, HStack, Tooltip, Divider, UnorderedList, ListItem, AspectRatio } from "@chakra-ui/react";
import { FaCalendar, FaMap, FaShoppingCart } from "react-icons/fa";
import { IoAccessibility } from "react-icons/io5";
import { MdDashboard, MdOutlineAccountCircle, MdPerson, MdSell, MdShoppingCart } from "react-icons/md";
import * as NextLink from "next/link";
import Image from "next/image";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from "@chakra-ui/react";
import { FaBoltLightning } from "react-icons/fa6";
import BuyGuide from "../Help/BuyGuide";
import SellGuide from "../Help/SellGuide";
import Navigation from "../Help/Navigation";

type HelpModalProps = {
    finalFocusRef: React.RefObject<HTMLElement>
}

export default function HelpModal({ finalFocusRef }: HelpModalProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            <Tooltip hasArrow label={"Need help?"} placement={"left-start"}>
                <IconButton aria-label="Help" icon={<Icon as={IoAccessibility} boxSize={7} />} isRound boxSize={"50px"} colorScheme="blue" variant={'outline'} onClick={onOpen} />
            </Tooltip>
            <Modal isOpen={isOpen} onClose={onClose} finalFocusRef={finalFocusRef}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Campus Marketplace Guide</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs variant='soft-rounded' colorScheme='blue' height={300} overflowY={'auto'}>
                            <TabList>
                                <Tab>
                                    <HStack>
                                        <Icon as={FaShoppingCart} />
                                        <Text>Buy</Text>
                                    </HStack>
                                </Tab>
                                {/* <Tab>
                                    <HStack>
                                        <Icon as={MdSell} />
                                        <Text>Sell</Text>
                                    </HStack>
                                </Tab> */}
                                <Tab>
                                    <HStack>
                                        <QuestionIcon />
                                        <Text>FAQ</Text>
                                    </HStack>
                                </Tab>
                                <Tab>
                                    <HStack>
                                        <Icon as={FaMap} />
                                        <Text>Navigation</Text>
                                    </HStack>
                                </Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
                                    <BuyGuide />
                                </TabPanel>
                                {/* <TabPanel p={0}>
                                    <SellGuide />
                                </TabPanel> */}
                                <TabPanel>
                                    <FAQ />
                                </TabPanel>
                                <TabPanel>
                                    <Navigation />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter>
                        <VStack width={"100%"} align={"left"}>
                            <Text>Unable to find an answer to your question?</Text>
                            <Button colorScheme='blue' leftIcon={<Icon as={MdPerson} />} width={"100%"} as={NextLink.default} href={"/contact"} onClick={onClose}>Contact Us</Button>
                        </VStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
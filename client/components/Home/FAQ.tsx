/**
 * FAQ.tsx
 * Component that displays the most frequently asked questions, with accordion functionality.
 * @AshokSaravanan222
 * 09-13-2024
 */

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function FAQ() {
    return (
        <VStack spacing={4} align="center" w="100%">
            <Accordion allowToggle w="100%">
                {/* <AccordionItem>
                    <AccordionButton>
                        <Box flex="1" textAlign="left">
                            <Text as={"b"}>How do I buy an item?</Text>
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        To buy an item, simply click on the "Buy" button on the item listing page, find the item you would like, and look at the listing page for more information.
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>How do I sell an item?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        To sell an item, you must first become a seller on our platform. After this 5 minute process, you can list any item for sale, and have funds directly deposited into your bank account.
                    </AccordionPanel>
                </AccordionItem> */}

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>Who can sign up?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        Right now, we require a .edu email to create an account. This helps keep the marketplace focused on campus communities.
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>How can I make payment?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        We use Stripe to securely process all payments on our platform, meaning that we do not handle any of your personal information. You can either use a credit card/debit card, Apple Pay/Google Pay, or Link to pay for items.
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>How do I get paid?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        After selling an item, the funds will be directly deposited into your bank account. You can set this up during the seller account creation process in Stripe. Note that for each transaction, we take a <b>$1.00</b> service fee. So if you sell an item for $10.00, you will receive $9.00.
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>How do I contact a seller?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        You will only be able to contact a seller once you have purchased an item. This is to ensure that all users are serious about their purchase. You can contact the seller through the chat feature once the meetup is created.
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>How can I issue a refund if I am not satisfied?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        We do not allow for refunds on our platform. However, we try our very best to make sure you are satisfied with the item before you purchase it. You are always able to cancel the purchase before the final confirmation, and if the seller has <b>negotiable</b> enabled for their item, you can ask them for a lower price while meeting up with them.
                    </AccordionPanel>
                </AccordionItem>

                {/* <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>What if I can't make a Scheduled meetup? What if I want to move out of Quick Meetup?</Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        If the seller has scheduled meetup enabled, you can reschedule the meetup for a time within the next week (after 48 hours). This goes even if you are in Quick Meetup and would like to set a date and time.
                    </AccordionPanel>
                </AccordionItem> */}

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                <Text as={"b"}>What if I run into any issues? </Text>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        For demo support, contact support@campus-marketplace.local.
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </VStack>
    );
}

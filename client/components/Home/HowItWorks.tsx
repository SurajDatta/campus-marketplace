/**
 * HowItWorks.tsx
 * Component that shows the user how the marketplace works. It shows the steps for quick and scheudled meetup
 * @AshokSaravanan222
 * 08-28-2024
 */
import React, { useEffect, useRef, useState } from 'react';
import { VStack, Text, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, useTab, useMultiStyleConfig, Button, Box, Grid, GridItem, AspectRatio, Stack, Icon, Heading, Divider, Center } from '@chakra-ui/react';
import { FaBoltLightning } from "react-icons/fa6";
import { CalendarIcon, CheckCircleIcon, CloseIcon, SmallCloseIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import AnimatedIcon from '../Common/Other/AnimatedIcon';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { FaCalendar } from 'react-icons/fa';


export default function HowItWorks({ isMobile }: { isMobile: boolean }) {
    const [step, setStep] = React.useState(0);
    const [tabIndex, setTabIndex] = React.useState(0); // 0 for quick, 1 for scheduled
    const stepRefs = useRef<HTMLDivElement[]>([]);

    // Scroll handler to detect which step should be active
    const handleScroll = () => {
        const offsets = stepRefs.current.map(ref => ref?.getBoundingClientRect().top);
        const windowHeight = window.innerHeight;

        offsets.forEach((offset, index) => {
            if (offset < windowHeight / 2 && offset > -windowHeight / 2) {
                setStep(index);
            }
        });
    };

    // Attach scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const renderBenefit = (benefit: string): React.ReactNode => {
        return (
            <HStack>
                <CheckCircleIcon color="green.500" boxSize={5} />
                <Text>{benefit}</Text>
            </HStack>
        );
    }

    const renderDownside = (downside: string): React.ReactNode => {
        return (
            <HStack>
                <SmallCloseIcon color="red.500" boxSize={5} />
                <Text>{downside}</Text>
            </HStack>
        );
    }

    const renderSteps = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <VStack align="left">
                        <HStack>
                            <AnimatedIcon
                                src="https://cdn.lordicon.com/pbrgppbb.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "50px", height: "50px" }}
                            />
                            <Heading>Buy</Heading>
                        </HStack>
                        <Text>Buy in seconds, with the flexibility to choose how you meet.</Text>
                        <HStack borderWidth="2px" borderRadius="md" p={4} bg="white" boxShadow="lg" mx="auto">
                            <VStack align={"left"}>
                                <Text fontSize={"xl"} as={"b"}>Campus Marketplace</Text>
                                {renderBenefit("Requires a .edu email")}
                                {renderBenefit("Pay before meeting up with the seller")}
                                {renderBenefit("Schedule a meetup at your convenience")}
                                {renderDownside("Exchange contact details")}
                            </VStack>
                            <Center height={100}>
                                <Divider orientation='vertical' />
                            </Center>
                            <VStack align={"left"}>
                                <Text fontSize={"xl"} as={"b"}>Other Platforms</Text>
                                {renderDownside("Requires a .edu email")}
                                {renderBenefit("Pay after meeting up with the seller")}
                                {renderDownside("Schedule a meetup at your convenience")}
                                {renderBenefit("Exchange contact details")}
                            </VStack>
                        </HStack>
                        {/* <QuickvScheduled quick={"Explore the Buy page for immediate access to the student marketplace. Browse the latest listings, including textbooks, microwaves, shoes, and more."} scheduled={"Visit the Buy page to access the student marketplace and schedule a meetup at your convenience. Browse the latest items—whether it's textbooks, microwaves, or shoes—and arrange to pick them up on your own time."} setQuick={(quick) => setQuick1(quick)} /> */}
                    </VStack>
                );
            case 1:
                return (
                    <VStack align="left">
                        <HStack>
                            <AnimatedIcon
                                src="https://cdn.lordicon.com/lomfljuq.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "50px", height: "50px" }}
                            />
                            <Heading>Check-In</Heading>
                        </HStack>
                        <Text>Check in using our easy and convenient options.</Text>
                        <HStack borderWidth="2px" borderRadius="md" p={4} bg="white" boxShadow="lg" mx="auto">
                            <VStack align={"left"}>
                                <Text fontSize={"xl"} as={"b"}>Campus Marketplace</Text>
                                {renderBenefit("Share location while meeting up")}
                                {renderBenefit("Meetup at designated ETS (Blue Light) Pole")}
                                {renderBenefit("Option to cancel a meetup at no cost")}
                                {renderBenefit("Add to calendar for reminders")}
                            </VStack>
                            <Center height={100}>
                                <Divider orientation='vertical' />
                            </Center>
                            <VStack align={"left"}>
                                <Text fontSize={"xl"} as={"b"}>Other Platforms</Text>
                                {renderDownside("Share location while meeting up")}
                                {renderDownside("Meetup at designated ETS (Blue Light) Pole")}
                                {renderBenefit("Option to cancel a meetup at no cost")}
                                {renderDownside("Add to calendar for reminders")}
                            </VStack>
                        </HStack>
                        {/* <QuickvScheduled quick={"Once you arrive at the meetup location, check in and reach out to the other party using the contact details you've exchanged. Follow any additional instructions provided in our app to ensure a smooth and seamless transaction."} scheduled={"Check in once you arrive at the meetup location. There's no need to exchange contact details—simply follow the instructions provided in our app for a smooth and secure transaction."} setQuick={(quick) => setQuick2(quick)} /> */}
                    </VStack>
                );
            case 2:
                return (
                    <VStack align="left">
                        <HStack>
                            <AnimatedIcon
                                src="https://cdn.lordicon.com/ogkflacg.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "50px", height: "50px" }}
                            />
                            <Heading>Confirm</Heading>
                        </HStack>
                        <Text>Confirm your purchase at a fair price and without scams.</Text>
                        <HStack borderWidth="2px" borderRadius="md" p={4} bg="white" boxShadow="lg" mx="auto">
                            <VStack align={"left"}>
                                <Text fontSize={"xl"} as={"b"}>Campus Marketplace</Text>
                                {renderBenefit("Negotiate the price at the meetup")}
                                {renderBenefit("Chance to inspect the item in person before buying")}
                                {renderBenefit("Cancel the purchase with guaranteed refund")}
                                {renderBenefit("2-way verification system for secure transactions")}
                            </VStack>
                            <Center height={100}>
                                <Divider orientation='vertical' />
                            </Center>
                            <VStack align={"left"}>
                                <Text fontSize={"xl"} as={"b"}>Other Platforms</Text>
                                {renderBenefit("Negotiate the price at the meetup")}
                                {renderBenefit("Chance to inspect the item in person before buying")}
                                {renderDownside("Cancel the purchase with guaranteed refund")}
                                {renderDownside("2-way verification system for secure transactions")}
                            </VStack>
                        </HStack>
                        {/* <QuickvScheduled quick={"Confirm the purchase through our secure 2-way verification system, ensuring a quick and efficient buying or selling experience. Buyers also have the option to cancel the purchase if needed."} scheduled={"Verify the purchase using our 2-way verification system, available only after you've had a chance to inspect the item in person. This ensures a careful and reliable buying or selling experience. Buyers also have the option to cancel the purchase if necessary."} setQuick={(quick) => setQuick3(quick)} /> */}
                    </VStack>
                );
            default:
                return null;
        }
    };

    return (
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem colSpan={isMobile ? 2 : 1} position="sticky" top={0} width="100%" zIndex={1500} bg={"gray.100"} borderRadius={"lg"}>
                <Box position="sticky" top={0} width="100%">
                    <Text fontSize={{ base: '5xl', md: '7xl' }} p={2}>How it Works</Text>
                    <QuickvScheduled
                        key={step}
                        step={step}
                        tabIndex={tabIndex}
                        setTabIndex={setTabIndex}
                    />
                </Box>
            </GridItem>
            <GridItem colSpan={isMobile ? 2 : 1}>
                {!isMobile && <>
                    <Text fontSize={{ base: '5xl', md: '7xl' }} color={"transparent"}>How it Works</Text>
                    <Box height={70} />
                </>}
                <VStack align="left" spacing={isMobile ? "200px" : "400px"}>
                    <div ref={el => (stepRefs.current[0] = el!)}>{renderSteps(0)}</div>
                    <div ref={el => (stepRefs.current[1] = el!)}>{renderSteps(1)}</div>
                    <div ref={el => (stepRefs.current[2] = el!)}>{renderSteps(2)}</div>
                </VStack>
                <Box height={30} />
            </GridItem>
        </Grid>
    );
}

function QuickvScheduled({ step, tabIndex, setTabIndex }: { step: number, tabIndex: number, setTabIndex: React.Dispatch<React.SetStateAction<number>> }) {

    const renderImage = (step: number, quick: boolean): React.ReactNode => {
        switch (step) {
            case 0:
                return (
                    <>
                        <AspectRatio ratio={16 / 9}>
                            {/* {quick ?
                                <iframe
                                    src="https://player.vimeo.com/video/1012373891?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=0m18s" // ends at 44s
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                    title="Campus Marketplace Quick Meetup (Buy)"
                                    width="640"
                                    height="360"
                                    allowFullScreen
                                />
                                :
                                <iframe
                                    src="https://player.vimeo.com/video/1012373953?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=0m32s" // ends at 1m06s
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                    title="Campus Marketplace Scheduled Meetup (Buy)"
                                    width="640"
                                    height="360"
                                    allowFullScreen
                                />} */}

                            <iframe
                                src="https://player.vimeo.com/video/1153438140?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=0m4s" // ends at 1m06s
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                title="Campus Marketplace Scheduled Meetup (Buy)"
                                width="640"
                                height="360"
                                allowFullScreen
                            />
                        </AspectRatio>
                        {/* <Text fontSize={"sm"} opacity={0.5} textAlign="center">{quick ? "Quick Meet (Buy)" : "Scheduled Meet (Buy)"}</Text> */}
                        <Text fontSize={"sm"} opacity={0.5} textAlign="center">Buy</Text>
                    </>
                );
            case 1:
                return (
                    <>
                        <AspectRatio ratio={16 / 9}>
                            {/* {quick ?
                                <iframe
                                    src="https://player.vimeo.com/video/1012373891?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=1m33s" // ends at 1m59s
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                    title="Campus Marketplace Quick Meetup (Check-In)"
                                    width="640"
                                    height="360"
                                    allowFullScreen
                                />
                                :
                                <iframe
                                    src="https://player.vimeo.com/video/1012373953?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=2m40s" // ends at 3m47s
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                    title="Campus Marketplace Scheduled Meetup (Check-In)"
                                    width="640"
                                    height="360"
                                    allowFullScreen
                                />} */}

                            <iframe
                                src="https://player.vimeo.com/video/1153438140?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=2m10s" // ends at 1m06s
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                title="Campus Marketplace Scheduled Meetup (Buy)"
                                width="640"
                                height="360"
                                allowFullScreen
                            />
                        </AspectRatio>
                        {/* <Text fontSize={"sm"} opacity={0.5} textAlign="center">{quick ? "Quick Meet (Check-In)" : "Scheduled Meet (Check-In)"}</Text> */}
                        <Text fontSize={"sm"} opacity={0.5} textAlign="center">Check-In</Text>
                    </>
                );
            case 2:
                return (
                    <>
                        <AspectRatio ratio={16 / 9}>
                            {/* {quick ?
                                <iframe
                                    src="https://player.vimeo.com/video/1012373891?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=2m58s" // ends at 3m26s
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                    title="Campus Marketplace Quick Meetup (Confirm)"
                                    width="640"
                                    height="360"
                                    allowFullScreen
                                />
                                :
                                <iframe
                                    src="https://player.vimeo.com/video/1012373953?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=5m05s" // ends at 5m25s
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                    title="Campus Marketplace Scheduled Meetup (Confirm)"
                                    width="640"
                                    height="360"
                                    allowFullScreen
                                />} */}
                            <iframe
                                src="https://player.vimeo.com/video/1153438140?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0#t=3m13s" // ends at 1m06s
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                title="Campus Marketplace Scheduled Meetup (Buy)"
                                width="640"
                                height="360"
                                allowFullScreen
                            />
                        </AspectRatio>
                        <Text fontSize={"sm"} opacity={0.5} textAlign="center">Confirm</Text>
                        {/* <Text fontSize={"sm"} opacity={0.5} textAlign="center">{quick ? "Quick Meet (Confirm)" : "Scheduled Meet (Confirm)"}</Text> */}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <VStack align={"left"} width={"100%"} p={4}>
            {renderImage(step, true)}
        </VStack>
    )


    return (
        <Tabs variant='soft-rounded' colorScheme='blue' onChange={setTabIndex} index={tabIndex}>
            <VStack>
                <TabList display="flex" justifyContent="space-between" p={2} width={"100%"} height={50}>
                    <Tab width={"100%"}>
                        <HStack>
                            <Icon as={FaBoltLightning} />
                            <Text isTruncated>Quick</Text>
                        </HStack>
                    </Tab>
                    <Tab width={"100%"}>
                        <HStack>
                            <Icon as={FaCalendar} />
                            <Text isTruncated>Scheduled</Text>
                        </HStack>
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        {renderImage(step, true)}
                    </TabPanel>
                    <TabPanel>
                        {renderImage(step, false)}
                    </TabPanel>
                </TabPanels>
            </VStack>
        </Tabs>
    );
}

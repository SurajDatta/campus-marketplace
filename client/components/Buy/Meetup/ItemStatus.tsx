/**
 * ItemStatus.tsx
 * Component that will show the timeline status of the item, and where it is in the process of being bought. This will be shown in the item status modal, and when the item has been complete/canceled. TODO: make the according changes since there will not be quick or scheduled meetups, but just options to share contact/schedule.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-08-25
 *
 *
 */
import React from 'react'
import {
    Box, Text, HStack, VStack,
    CircularProgress,
    CircularProgressLabel,
    Skeleton,
} from '@chakra-ui/react'
import {
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useBreakpointValue,
} from '@chakra-ui/react';
import { Meetup, Location } from '@/types';
import { Link } from '@chakra-ui/react';
import * as NextLink from 'next/link'
import { CheckIcon } from '@chakra-ui/icons';


type ItemStatusProps = {
    meetup: Meetup | null;
    locations: Location[] | null;
    mapsAPIKey: string | null;
    activeStep: number;
}

export default function ItemStatus({ activeStep, meetup, locations, mapsAPIKey }: ItemStatusProps) {
    const isMobile = useBreakpointValue({ base: true, md: false });
    const location = locations?.find((location) => location.id == meetup?.location);

    return (
        <Stepper size='lg' index={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'} colorScheme={meetup?.status == 'canceled' ? 'red' : 'blue'} height={"100%"}>
            <Step key={0}>
                <StepIndicator>
                    <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                    />
                </StepIndicator>
                <VStack align={"left"} maxW={"400px"}>
                    {activeStep == 0 ? (
                        <Skeleton isLoaded={meetup != null}>
                            <Box flexShrink='0'>
                                <StepTitle>{meetup?.item_title}</StepTitle>
                                <StepDescription>Click <Link as={NextLink.default} href={`/buy`} colorScheme='blue'>here</Link> to buy.</StepDescription>
                            </Box>
                        </Skeleton>
                    ) : (
                        <Skeleton isLoaded={meetup != null}>
                            <Box flexShrink='0'>
                                <StepTitle>{meetup?.item_title ?? "Title"}</StepTitle>
                                <StepDescription>Request placed on {new Date(meetup?.created_at ?? "").toLocaleString()}</StepDescription>
                            </Box>
                        </Skeleton>
                    )}

                </VStack>
                <StepSeparator />
            </Step>
            <Step key={1}>
                <StepIndicator>
                    <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                    />
                </StepIndicator>
                <VStack align={"left"} maxW={"400px"}>
                    <Skeleton isLoaded={meetup != null}>
                        <Box flexShrink='0'>
                            <StepTitle>Meetup {location ? "at " + location.name : ""}</StepTitle>
                            {((activeStep == 0) || (activeStep == 1)) ? (
                                <StepDescription>Undecided</StepDescription>
                            ) : (
                                <StepDescription>{meetup?.meetup_confirmed_at ? `Confirmed at ${new Date(meetup.meetup_confirmed_at).toLocaleString()}` : "Unconfirmed"}</StepDescription>
                            )}
                        </Box>
                    </Skeleton>

                </VStack>
                <StepSeparator />
            </Step>


            <Step key={2}>
                <StepIndicator>
                    <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                    />
                </StepIndicator>
                <VStack align={"left"} maxW={"400px"}>
                    <StepTitle>Check-In</StepTitle>
                    {activeStep == 0 ? (
                        <StepDescription>Not Started</StepDescription>
                    ) : (
                        <StepDescription>
                            <VStack align={"left"}>
                                <Skeleton isLoaded={meetup != null}>
                                    <HStack>
                                        {(meetup?.buyer_met && meetup.buyer_met_at) ? (
                                            <>
                                                <CircularProgress value={100} color={"green.400"} size={"25px"}><CircularProgressLabel>{<CheckIcon color="green.400" />}</CircularProgressLabel></CircularProgress>
                                                <Text>Buyer ({new Date(meetup.buyer_met_at).toLocaleString()})</Text>
                                            </>
                                        ) : (
                                            <>
                                                <CircularProgress value={100} color="red.400" size="24px" />
                                                <Text>Buyer</Text>
                                            </>
                                        )}
                                    </HStack>
                                </Skeleton>
                                <Skeleton isLoaded={meetup != null}>
                                    <HStack>
                                        {(meetup?.seller_met && meetup.seller_met_at) ? (
                                            <>
                                                <CircularProgress value={100} color={"green.400"} size={"25px"}><CircularProgressLabel>{<CheckIcon color="green.400" />}</CircularProgressLabel></CircularProgress>
                                                <Text>Seller ({new Date(meetup.seller_met_at).toLocaleString()})</Text>
                                            </>
                                        ) : (
                                            <>
                                                <CircularProgress value={100} color="red.400" size="24px" />
                                                <Text>Seller</Text>
                                            </>
                                        )}
                                    </HStack>
                                </Skeleton>
                            </VStack>
                        </StepDescription>
                    )
                    }
                </VStack>
                <StepSeparator />
            </Step>

            <Step key={3}>
                <StepIndicator>
                    <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                    />
                </StepIndicator>
                <VStack align={"left"} maxW={"400px"}>
                    <StepTitle>Confirmation</StepTitle>
                    {activeStep == 0 ? (
                        <StepDescription>Not Confirmed</StepDescription>
                    ) : (
                        <StepDescription>
                            <VStack align={"left"}>
                                <Skeleton isLoaded={meetup != null}>
                                    <HStack>
                                        {(meetup?.buyer_confirmed && meetup.buyer_confirmed_at) ? (
                                            <>
                                                <CircularProgress value={100} color={"green.400"} size={"25px"}><CircularProgressLabel>{<CheckIcon color="green.400" />}</CircularProgressLabel></CircularProgress>
                                                <Text>Buyer ({new Date(meetup.buyer_confirmed_at).toLocaleString()})</Text>
                                            </>
                                        ) : (
                                            <>
                                                <CircularProgress value={100} color="red.400" size="24px" />
                                                <Text>Buyer</Text>
                                            </>
                                        )}
                                    </HStack>
                                </Skeleton>
                                <Skeleton isLoaded={meetup != null}>
                                    <HStack>
                                        {(meetup?.seller_confirmed && meetup.seller_confirmed_at) ? (
                                            <>
                                                <CircularProgress value={100} color={"green.400"} size={"25px"}><CircularProgressLabel>{<CheckIcon color="green.400" />}</CircularProgressLabel></CircularProgress>
                                                <Text>Seller ({new Date(meetup.seller_confirmed_at).toLocaleString()})</Text>
                                            </>
                                        ) : (
                                            <>
                                                <CircularProgress value={100} color="red.400" size="24px" />
                                                <Text>Seller</Text>
                                            </>
                                        )}
                                    </HStack>
                                </Skeleton>
                            </VStack>
                        </StepDescription>
                    )
                    }
                </VStack>
                <StepSeparator />
            </Step>
        </Stepper>
    )
}
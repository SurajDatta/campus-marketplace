/**
 * ItemStatusModal.tsx
 * Modal that will show the status of the item. This is simply a wrapper of the ItemStatus component, shown in a modal.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React from 'react'
import {
    Text, HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Divider,
    Center,
    Tooltip,
    Skeleton,
} from '@chakra-ui/react'
import { Location, Meetup, PotentialMeetup } from '@/types';
import ExpiryDetails from '@/components/Common/Item/ExpiryDetails';
import ItemStatus from './ItemStatus';
type ItemStatusProps = {
    meetup: Meetup | null
    locations: Location[] | null
    mapsAPIkey: string | null
    activeStep: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ItemStatusModal({ activeStep, meetup, isOpen, onClose, locations, mapsAPIkey }: ItemStatusProps) {
    const expiryDate = () => {
        const potentialMeetups = meetup ? meetup.potential_meetups as PotentialMeetup[] : [];
        if (meetup?.schedule_enabled && potentialMeetups && potentialMeetups.length > 0) {
            const latestDate = potentialMeetups.at(-1)?.time
            return latestDate ? new Date(new Date(latestDate).getTime() + (24 * 60 * 60 * 1000)).toISOString() : null
        }
        return meetup?.expires_at
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent maxWidth="1200px">
                <ModalHeader>
                    <HStack>
                        <Text>Meetup Status</Text>
                        <Center height='50px'>
                            <Divider orientation='vertical' borderColor={"#ceb888"} />
                        </Center>
                        {(activeStep == 1) ? (
                            <Text color={"orange"}>Pending</Text>
                        ) : (activeStep == 2) ? (
                            <Tooltip label={"This is the final expiry time for this item. If not complete by this time, the purchase will be canceled."}>
                                <Text>
                                    <ExpiryDetails expiryDate={expiryDate() ?? ""} />
                                </Text>
                            </Tooltip>
                        ) : (
                            <Skeleton isLoaded={meetup != null}>
                                {meetup && <Text color={meetup.status == 'canceled' ? 'red' : meetup.status == "complete" ? 'green' : 'grey'}>{meetup.status == 'canceled' ? 'Purchase Canceled' : meetup.status == "complete" ? 'Purchase Complete' : 'Available'}</Text>}
                            </Skeleton>
                        )}
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <ItemStatus activeStep={activeStep} meetup={meetup} locations={locations} mapsAPIKey={mapsAPIkey} />
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>

        </Modal>
    )
}
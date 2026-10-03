/**
 * ItemPhotoModal.tsx
 * Modal that will be used to display the photo of an item. It will show the uncropped full image of the item, so people can see what it looks like if the crop has cut it off. TODO: add a description of the item, so people know how this pertains to the item (description could be 'front', 'back', 'side', etc.)
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Image,
    Center,
} from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { useState } from 'react';
import ReactCrop, { PercentCrop, PixelCrop, type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

type ItemPhotoModalProps = {
    photoUrl: string;
    photoSize: { x: number, y: number, w: number, h: number } | undefined;
    savePhotoSize(newSize: { x: number, y: number, w: number, h: number }): void;
    edit: boolean;
    isOpen: boolean;
    name: string;
    onClose: () => void;
}

export default function ItemPhotoModal({ photoUrl, photoSize, savePhotoSize, edit, isOpen, onClose, name }: ItemPhotoModalProps) {
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState<Crop>({
        unit: '%', // Can be 'px' or '%'
        x: photoSize?.x ?? 0,
        y: photoSize?.y ?? 0,
        width: photoSize?.w ?? 100,
        height: photoSize?.h ?? 100,
    });

    const saveCrop = () => {
        setLoading(true);
        savePhotoSize({ x: crop.x, y: crop.y, w: crop.width, h: crop.height });
        onClose();
        setLoading(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="500px">
                <ModalHeader>{edit ? `Adjust ${name}` : name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center>
                        {edit ? (
                            <ReactCrop crop={crop} onChange={(crop: PixelCrop, percentCrop: PercentCrop) => setCrop(percentCrop)} aspect={1} locked>
                                <img src={photoUrl} style={{ maxWidth: '100%', height: 'auto' }} />
                            </ReactCrop>
                        ) : (
                            <Image src={photoUrl} />
                        )}
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='gray' mr={3} onClick={onClose}>
                        Close
                    </Button>
                    {edit && <Button colorScheme='blue' onClick={saveCrop} isLoading={loading}>Save Position</Button>}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )



}
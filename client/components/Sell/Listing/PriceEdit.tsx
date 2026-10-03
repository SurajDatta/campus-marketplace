/**
 * PriceEdit.tsx
 * Component that will be used to edit the price in the edit listing page.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-10-14
 *
 *
 */
import ItemPrice from '@/components/Common/Item/ItemPrice';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons'
import {
    EditablePreview,
    useColorModeValue,
    IconButton,
    Input,
    useEditableControls,
    ButtonGroup,
    Editable,
    Tooltip,
    EditableInput,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    HStack,
    Icon,
    FormHelperText,
    FormErrorMessage,
    Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { MdOutlineSubtitles } from 'react-icons/md';

type PriceEditProps = {
    price: string
    listingPrice: string
    handleSave(newPrice: string): void
    saveListing(): void
}

export default function PriceEdit({ price, listingPrice, handleSave, saveListing }: PriceEditProps) {
    const [priceEdit, setPriceEdit] = useState<string>(price);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const formatPrice = (price: string) => {
        return "$" + Number(price).toFixed(2)
    }

    function EditableControls() {
        const { getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls()
        const cancelProps = getCancelButtonProps()
        const submitProps = getSubmitButtonProps()
        const editableProps = getEditButtonProps()

        return isEditing ? (
            <HStack>
                <IconButton aria-label={"save button"} icon={<CheckIcon boxSize={3} />} colorScheme='green' {...submitProps} onClick={async (e) => {
                    if (submitProps.onClick) {
                        await submitProps.onClick(e)
                        saveListing()
                    }
                }} />
                <IconButton aria-label={"cancel button"} icon={<CloseIcon boxSize={3} />} colorScheme='red' {...cancelProps} />
            </HStack>
        ) : <IconButton aria-label={"edit button"} icon={<EditIcon boxSize={3} />} colorScheme='blue' {...editableProps} />

    }

    return (
        <Editable
            defaultValue={price}
            placeholder={"Enter price"}
            isPreviewFocusable={true}
            selectAllOnFocus={false}
            value={isEditing ? priceEdit : formatPrice(price)}
            onChange={(value) => setPriceEdit(value)}
            onEdit={() => setIsEditing(true)} // Set editing state on start
            onSubmit={() => {
                setIsEditing(false)
                handleSave(priceEdit)
            }} // Reset editing state on submit
            onCancel={() => {
                setIsEditing(false)
                setPriceEdit(price);
            }} // Reset editing state on cancel
        >
            <HStack width={"100%"}>
                <Tooltip label={"Click here to edit"} shouldWrapChildren={true}>
                    <HStack>
                        {!isEditing && (Number(listingPrice) > Number(price)) && <Text as='s' fontSize={"lg"} textAlign="center" color={"green.500"} fontWeight="bold">${(Number(listingPrice) ?? 0).toFixed(2)}</Text>}
                        <EditablePreview
                            py={2}
                            px={4}
                            _hover={{
                                background: useColorModeValue('gray.100', 'gray.700'),
                            }}
                            color={String(price).length === 0 ? "gray.500" : "green.500"}
                            fontSize={"2xl"}
                            textAlign="center"
                            fontWeight="bold"
                        />
                    </HStack>
                </Tooltip>
                <HStack width={"100%"}>
                    <Input py={2} px={4} as={EditableInput} />
                    <EditableControls />
                </HStack>
            </HStack>
        </Editable>
    )

}
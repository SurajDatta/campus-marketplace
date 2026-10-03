/**
 * DescriptionEdit.tsx
 * Component that will be used to edit the description in the edit listing page.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
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
    Textarea,
    VStack,
    EditableTextarea,
    Box,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { CgNotes } from 'react-icons/cg';

type DescriptionEditProps = {
    description: string
    handleSave(newDescription: string): void
    saveListing(): void;
}

export default function DescriptionEdit({ description, handleSave, saveListing }: DescriptionEditProps) {
    const [descriptionEdit, setDescriptionEdit] = useState<string>(description);
    const [isEditing, setIsEditing] = useState<boolean>(false);

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
            defaultValue={description}
            placeholder={"Your description here..."}
            isPreviewFocusable={true}
            selectAllOnFocus={false}
            value={descriptionEdit}
            onChange={(value) => setDescriptionEdit(value)}
            onEdit={() => setIsEditing(true)} // Set editing state on start
            onSubmit={() => {
                setIsEditing(false)
                handleSave(descriptionEdit)
            }} // Reset editing state on submit
            onCancel={() => {
                setIsEditing(false)
                setDescriptionEdit(description);
            }} // Reset editing state on cancel
        >
            <HStack width={"100%"}>
                <Tooltip label={"Click here to edit"} shouldWrapChildren={true}>
                    <EditablePreview
                        py={2}
                        px={4}
                        _hover={{
                            background: useColorModeValue('gray.100', 'gray.700'),
                        }}
                        color={description.length === 0 ? "gray.500" : "black"}
                        opacity={"0.5"}
                        width={"100%"}
                    />
                </Tooltip>
                <HStack width={!isEditing ? "auto" : "100%"}>
                    <Textarea
                        as={EditableTextarea}
                    />
                    <EditableControls />
                </HStack>
            </HStack>
        </Editable>
    )

}
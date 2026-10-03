/**
 * TitleEdit.tsx
 * Component that will be used to edit the title in the edit listing page.
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
} from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { MdOutlineSubtitles } from 'react-icons/md';

type TitleEditProps = {
    title: string
    handleSave(newTitle: string): void
    saveListing(): void
}

export default function TitleEdit({ title, handleSave, saveListing }: TitleEditProps) {
    const [titleEdit, setTitleEdit] = useState<string>(title);
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
            defaultValue={title}
            placeholder={"Enter title"}
            isPreviewFocusable={true}
            selectAllOnFocus={false}
            value={titleEdit}
            onChange={(value) => setTitleEdit(value)}
            onEdit={() => setIsEditing(true)} // Set editing state on start
            onSubmit={() => {
                setIsEditing(false)
                handleSave(titleEdit)
            }} // Reset editing state on submit
            onCancel={() => {
                setIsEditing(false)
                setTitleEdit(title);
            }} // Reset editing state on cancel
        >
            <InputGroup>
                <HStack width={"100%"}>
                    {isEditing ? (
                        <InputLeftAddon children={<Icon as={MdOutlineSubtitles} />} />
                    ) : null}
                    <Tooltip label={"Click here to edit"} shouldWrapChildren={true}>
                        <EditablePreview
                            py={2}
                            px={4}
                            _hover={{
                                background: useColorModeValue('gray.100', 'gray.700'),
                            }}
                            color={title.length === 0 ? "gray.500" : "black"}
                            fontSize={"4xl"}
                            fontWeight={"bold"}
                            width={"100%"}

                        />
                    </Tooltip>
                    <HStack width={isEditing ? "100%" : "auto"}>
                        <Input py={2} px={4} as={EditableInput} />
                        <EditableControls />
                    </HStack>
                </HStack>
            </InputGroup>
        </Editable>
    )

}
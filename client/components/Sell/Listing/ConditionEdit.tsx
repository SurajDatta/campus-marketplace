/**
 * ConditionEdit.tsx
 * Component that will be used to edit the condition in the edit listing page.
 * @author @AshokSaravanan222
 * @updated 2024-07-22
 */
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
  EditablePreview,
  useColorModeValue,
  IconButton,
  useEditableControls,
  Editable,
  Tooltip,
  HStack,
  useEditableContext,
  Select,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';

type ConditionEditProps = {
  condition: string;
  handleSave(condition: string): void;
  saveListing(): void;
};

export default function ConditionEdit({ condition, handleSave, saveListing}: ConditionEditProps) {
  const [conditionEdit, setConditionEdit] = useState<string>(condition);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Synchronize conditionEdit when condition prop changes
  useEffect(() => {
    setConditionEdit(condition);
  }, [condition]);

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

  function EditableSelect(props: React.ComponentProps<typeof Select>) {
    const { isEditing, onSubmit } = useEditableContext();
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
      if (isEditing && selectRef.current) {
        selectRef.current.focus();
      }
    }, [isEditing]);

    return (
      <Select
        ref={selectRef}
        {...props}
        onBlur={() => {
          onSubmit();
        }}
      >
        {props.children}
      </Select>
    );
  }

  return (
    <Editable
      defaultValue={condition}
      placeholder="Enter condition"
      isPreviewFocusable
      selectAllOnFocus={false}
      value={conditionEdit}
      onEdit={() => setIsEditing(true)}
      onSubmit={() => {
        setIsEditing(false);
        handleSave(conditionEdit);
      }}
      onCancel={() => {
        setIsEditing(false);
        setConditionEdit(condition);
      }}
    >
      <HStack width="100%">
        <Tooltip label="Click here to edit" shouldWrapChildren>
          <EditablePreview
            py={2}
            px={4}
            _hover={{
              background: useColorModeValue('gray.100', 'gray.700'),
            }}
            color={condition.length === 0 ? 'gray.500' : 'black'}
            opacity="0.5"
          />
        </Tooltip>
        <HStack>
          {isEditing && (
            <EditableSelect
              value={conditionEdit}
              onChange={(e) => setConditionEdit(e.target.value)}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used (like new)">Used (like new)</option>
              <option value="used (good)">Used (good)</option>
              <option value="used (fair)">Used (fair)</option>
            </EditableSelect>
          )}
          <EditableControls />
        </HStack>
      </HStack>
    </Editable>
  );
}

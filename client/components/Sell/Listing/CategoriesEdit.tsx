/**
 * CategoriesEdit.tsx
 * Component that will be used to edit the categories in the edit listing page.
 * @author  Ashok Saravanan
 * @updated 2024-07-22
 */
import { Categories } from '@/types';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
  EditablePreview,
  useColorModeValue,
  IconButton,
  useEditableControls,
  ButtonGroup,
  Editable,
  Tooltip,
  HStack,
  useEditableContext,
  Box,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import Select, { MultiValue } from 'react-select';

type CategoriesEditProps = {
  allCategories: Categories[];
  categories: number[];
  handleSave(newCategories: number[]): void;
  saveListing(): void;
};

export default function CategoriesEdit({
  categories,
  handleSave,
  allCategories,
  saveListing
}: CategoriesEditProps) {
  const [categoriesEdit, setCategoriesEdit] = useState<number[]>(categories);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<{
      value: string;
      label: string;
    }> | null
  >(
    categories.map((category) => ({
      value: category.toString(),
      label: allCategories.find((c) => c.id === category)?.name || '',
    }))
  );

  // Synchronize categoriesEdit with selectedOptions
  useEffect(() => {
    const selectedCategories =
      selectedOptions?.map((option) => parseInt(option.value)) || [];
    setCategoriesEdit(selectedCategories);
  }, [selectedOptions]);

  // Synchronize categoriesEdit when categories prop changes
  useEffect(() => {
    setCategoriesEdit(categories);
  }, [categories]);

  // Synchronize selectedOptions when categories or allCategories change
  useEffect(() => {
    setSelectedOptions(
      categories.map((category) => ({
        value: category.toString(),
        label: allCategories.find((c) => c.id === category)?.name || '',
      }))
    );
  }, [categories, allCategories]);

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

  function EditableSelect(props: any) {
    const { isEditing, onSubmit } = useEditableContext();
    const selectRef = useRef<any>(null);

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
      />
    );
  }

  return (
    <Editable
      defaultValue={categories
        .map((category) => allCategories.find((c) => c.id === category)?.name)
        .join(' | ')}
      placeholder='Enter categories'
      isPreviewFocusable
      selectAllOnFocus={true}
      value={categoriesEdit
        .map((category) => allCategories.find((c) => c.id === category)?.name)
        .join(' | ')}
      onEdit={() => setIsEditing(true)}
      onCancel={() => {
        setIsEditing(false);
        setCategoriesEdit(categories); // Reset to original categories on cancel
      }}
      onSubmit={() => {
        setIsEditing(false);
        handleSave(categoriesEdit);
      }}
    >
      <HStack width={'100%'}>
        <Tooltip label={'Click here to edit'} shouldWrapChildren={true}>
          <EditablePreview
            py={2}
            px={4}
            _hover={{
              background: useColorModeValue('gray.100', 'gray.700'),
            }}
            color={categories.length === 0 ? 'gray.500' : '#ceb888'}
            width={'100%'}
          />
        </Tooltip>
        <HStack>
          {isEditing && (
            <EditableSelect
              value={selectedOptions}
              onChange={(e: any) => {
                const selectedValues = e as MultiValue<{
                  value: string;
                  label: string;
                }>;
                setSelectedOptions(selectedValues);
              }}
              options={allCategories.map((category) => ({
                value: category.id.toString(),
                label: category.name,
              }))}
              isMulti
              isSearchable
              isClearable
            />
          )}
          <EditableControls />
        </HStack>
      </HStack>
    </Editable>
  );
}

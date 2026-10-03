/**
 * SellerLocations.tsx
 * Component that will show all of the seller locations available to pick from. Will allow the user to select up to 3 locations to sell from. TODO: make this component use a searchable locations component, and make it more user friendly, and easier to change requirements.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useState } from 'react';
import {
  Box, Checkbox, VStack,
  useToast
} from '@chakra-ui/react';
import { MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { createLocation } from '@/utils/services/sell';
import { Location, MeetupLocations, Profile } from '@/types';
import { updateSellerLocations } from '@/utils/services/account';

type SellerLocationProps = {
  userProfile: Profile | null;
  allLocations: Location[];
  setAllLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  setSellerLocations: React.Dispatch<React.SetStateAction<number[]>>;
  sellerLocations: number[];
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const SellerLocations = ({ allLocations, userProfile, sellerLocations, setSellerLocations, setAllLocations }: SellerLocationProps) => {
  const customLocations = allLocations.filter(location => location.created_by === userProfile?.id).map(location => location.name);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(sellerLocations.map((locationId, index) => {
    const location = allLocations.find(location => location.id === locationId && !location.blue_light);
    return {
      value: location?.id.toString() ?? '',
      label: location?.name ?? `Unknown Location${index}`,
    };
  }));

  const options = allLocations.map((location, index) => ({
    value: location.id.toString(),
    label: location.name ?? `Unknown Location${index}`,
  }));

  const createOption = (value: string, label: string) => ({
    label: label,
    value: value,
  });

  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    try {
      if (!userProfile) {
        throw new Error('User not found');
      }
      const { success, error, id: locationId } = await createLocation(userProfile.id, inputValue);
      if (!success) {
        throw new Error(error);
      } else {
        const locationsResult = await updateSellerLocations(userProfile.id, [...sellerLocations, locationId]); // should only do if this is in the preferences page
        if (!locationsResult.success) {
          throw new Error('Failed to save locations');
        } else {
          setSellerLocations([...sellerLocations, locationId]);
          const newOption = createOption(locationId.toString(), inputValue);
          setSelectedOptions((prev) => [...prev, newOption]);
          setAllLocations((prev) => [...prev, 
            { id: locationId, name: inputValue, created_by: userProfile.id, latitude: 0, longitude: 0, img_url: process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/photos/default.webp' , notes: '', place_id: '', address: ''} as Location
          ]);
          // create a new multi value object, with the new location
          toast({
            title: 'Location created',
            description: 'The location was created successfully.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error creating location',
        description: 'There was an error creating the location. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
    setIsLoading(false);
  }

  // const handleLocationChange = (locationId: number) => {
  //   setSelectedLocations(prev => {
  //     if (prev.includes(locationId)) {
  //       return prev.filter(item => item !== locationId);
  //     } else if (prev.length < 3) {
  //       return [...prev, locationId];
  //     }
  //     return prev;
  //   });
  // };

  return (
    <CreatableSelect
      isLoading={isLoading}
      defaultValue={selectedOptions}
      value={selectedOptions}
      onChange={(e) => {
        const selectedValues = e as Option[]
        setSellerLocations(selectedValues.map(selectedValue => parseInt(selectedValue.value)));
        setSelectedOptions(selectedValues);
      }}
      options={options}
      onCreateOption={handleCreate}
      isMulti
      isSearchable
      isClearable
      styles={{
        // want to make all the options that are created by the user a different color
        option: (provided, state) => ({
          ...provided,
          backgroundColor: (customLocations.includes(state.label)) ? 'lightgreen' : 'white',
        }),
      }}
    />
  )

  // return (
  //   <Box>
  //     <VStack align="flex-start" spacing={5}>
  //       {allLocations.map(location => (
  //         <Checkbox
  //           key={location.id}
  //           isChecked={selectedLocations.includes(location.id)}
  //           onChange={() => handleLocationChange(location.id)}
  //           isDisabled={(selectedLocations.length >= 3 && !selectedLocations.includes(location.id))}
  //         >
  //           {location.name}
  //         </Checkbox>
  //       ))}
  //     </VStack>
  //   </Box>
  // );
};

export default SellerLocations;

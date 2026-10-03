/**
 * UpdatePhoneForm.tsx
 * Signup form that will allow users to update their phone number.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect, useState } from "react"
import { Formik, Field, Form, FormikHelpers, FieldInputProps } from "formik"
import { FormControl, FormLabel, Input, FormErrorMessage, Button, InputGroup, InputRightElement, InputLeftElement, FormHelperText, VStack, Text, useToast, Checkbox, Link } from "@chakra-ui/react"
import { CheckIcon, CloseIcon, PhoneIcon } from "@chakra-ui/icons";
import * as NextLink from 'next/link';

export type ChangePhoneFormData = {
    phone: string;
    phoneConfirm: boolean;
};

type ChangePhoneProps = {
    handlePhoneUpdate: (values: ChangePhoneFormData, actions: FormikHelpers<ChangePhoneFormData>) => void;
}

export default function ChangePhoneForm({ handlePhoneUpdate }: ChangePhoneProps) {
    const [phoneComplete, setPhoneComplete] = useState<boolean | null>(null)
    const toast = useToast();

    const formatPhoneNumber = (phoneNumber: string) => {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        let formatted = cleaned;

        if (cleaned.length > 3 && cleaned.length <= 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else if (cleaned.length > 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
        }

        return formatted;
    }


    function validatePhone(value: any) {
        let error;
        if (!value) {
            error = 'Phone is required';
        } else if (!value.match(/^\(\d{3}\) \d{3} \d{4}$/) && !value.match(/^\d{3} \d{3} \d{4}$/) && !value.match(/^\d{10}$/)) {
            error = 'Please enter a valid phone number';
        }
        return error;
    }


    return (
        <Formik
            initialValues={{ phone: '', phoneConfirm: false } as ChangePhoneFormData}
            onSubmit={handlePhoneUpdate}
        >
            {(props) => {
                useEffect(() => {
                    if (Object.keys(props.errors).length > 0 && props.isSubmitting) {
                        Object.values(props.errors).forEach((error: any) => {
                            toast({
                                title: "Validation Error",
                                description: error,
                                status: "error",
                                duration: 5000,
                                isClosable: true,
                            });
                        });
                    }
                }, [props.errors, props.submitCount, toast]);
                return (
                    <Form>
                        <VStack p={2}>
                            <Field name='phone' validate={validatePhone}>
                                {({ field, form }: { field: FieldInputProps<string>, form: any }) => (
                                    <FormControl isInvalid={form.errors.phone && form.touched.phone} isRequired>
                                        <FormLabel>Phone</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents='none'>
                                                <PhoneIcon color='gray.300' />
                                            </InputLeftElement>
                                            <Input
                                                {...field}
                                                type='tel'
                                                placeholder='(123) 456 7890'
                                                value={field.value}
                                                onChange={e => {
                                                    form.setFieldValue(field.name, formatPhoneNumber(e.target.value));
                                                    if (validatePhone(formatPhoneNumber(e.target.value)) === undefined) {
                                                        setPhoneComplete(true);
                                                    } else if (e.target.value === '') {
                                                        setPhoneComplete(null);
                                                    } else {
                                                        setPhoneComplete(false);
                                                    }
                                                }}
                                            />
                                            {phoneComplete === true ? (
                                                <InputRightElement>
                                                    <CheckIcon color='green.500' />
                                                </InputRightElement>
                                            ) : phoneComplete === false ? (
                                                <InputRightElement>
                                                    <CloseIcon color='red.500' />
                                                </InputRightElement>
                                            ) : null}
                                        </InputGroup>
                                        {phoneComplete === null ? <FormHelperText>Enter a valid 10-digit US phone number.</FormHelperText> :
                                            <FormErrorMessage>{form.errors.phone}</FormErrorMessage>}

                                    </FormControl>
                                )}
                            </Field>
                            {/* SMS functionality disabled - phoneConfirm always defaults to false */}
                            {/* <Field name='phoneConfirm'>
                                {({ field, form }: any) => (
                                    <FormControl>
                                        <FormLabel>Phone Number Messaging</FormLabel>
                                        <Checkbox {...field} isChecked={props.values.phoneConfirm}>
                                            <Text fontSize={"xs"}>
                                                If you choose to opt in, we'll text this phone number to verify your account and send notifications. Message and data rates may apply. By opting in, you agree to our <Link href='/terms' color='teal.500' as={NextLink.default}>Terms and Conditions</Link> and <Link href='/privacy' color='teal.500' as={NextLink.default}>Privacy Policy.</Link></Text>
                                        </Checkbox>
                                    </FormControl>
                                )}
                            </Field> */}
                        </VStack>
                        <Button
                            mt={4}
                            colorScheme='blue'
                            isLoading={props.isSubmitting}
                            type='submit'
                            width={"100%"}
                        >
                            Change Phone
                        </Button>
                    </Form>)
            }}
        </Formik>
    )
}
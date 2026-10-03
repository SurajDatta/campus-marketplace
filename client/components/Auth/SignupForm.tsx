/**
 * SignupForm.tsx
 * User signup form. Validates name, campus email, phone, and password. First and last name are required. Phone number is formatted to (123) 456 7890. Password must be at least 8 characters long. Phone number is auto confirmed, but email needs to be confirmed.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useState } from "react"
import { Formik, Field, Form, FormikHelpers, FieldInputProps } from "formik"
import { FormControl, FormLabel, Input, FormErrorMessage, Button, InputGroup, InputRightElement, InputLeftElement, FormHelperText, VStack, Icon, IconButton, Tooltip, Progress, ButtonGroup, Text, Checkbox, Link } from "@chakra-ui/react"
import { CheckIcon, CloseIcon, EmailIcon, PhoneIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { IoPersonSharp } from "react-icons/io5";
import * as NextLink from 'next/link';

export type SignupFormData = {
    name: string;
    email: string;
    phone: string;
    phoneConfirm: boolean;
    password: string;
    confirmPassword: string;
}

type SignupProps = {
    handleSignup: (values: SignupFormData, actions: FormikHelpers<SignupFormData>) => void;
    handleValidateInfo: (values: SignupFormData) => Promise<boolean>;
}

export default function SignupForm({ handleSignup, handleValidateInfo }: SignupProps) {
    const [initialPage, setInitialPage] = useState<boolean>(true);
    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickPassword = () => setShowPassword(!showPassword);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const handleClickConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const [nameComplete, setNameComplete] = useState<boolean | null>(null)
    const [emailComplete, setEmailComplete] = useState<boolean | null>(null)
    const [phoneComplete, setPhoneComplete] = useState<boolean | null>(null)
    const [passwordComplete, setPasswordComplete] = useState<boolean | null>(null)
    const [confirmPasswordComplete, setConfirmPasswordComplete] = useState<boolean | null>(null)
    const [validating, setValidating] = useState<boolean>(false);

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


    function validateName(value: string) {
        let error;
        if (!value) {
            error = 'Name is required';
        } else if (!value.includes(' ') || value.split(' ').length != 2 || value.split(' ')[0].length < 2 || value.split(' ')[1].length < 2) {
            error = 'Please enter your full name';
        }
        return error;
    }

    function validateEmail(value: string) {
        let error;
        if (!value) {
            error = 'Email is required';
        } else if (!value.toLowerCase().endsWith('.edu')) {
            error = 'Only .edu campus emails are allowed';
        } else if (value.split('@')[0].length < 2) {
            error = 'Please enter a valid campus email';
        }
        return error;
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

    function validatePassword(value: string) {
        let error;
        if (!value) {
            error = 'Password is required';
        } else if (value.length < 8) {
            error = 'Password must be at least 8 characters';
        }
        return error;
    }

    function validateConfirmPassword(value: string, password: string) {
        let error;
        if (!value) {
            error = 'Password is required';
        } else if (value !== password) {
            error = 'Passwords do not match';
        }
        return error;
    }


    return (
        <Formik
            initialValues={{ name: '', email: '', phone: '', password: '', confirmPassword: '', phoneConfirm: false } as SignupFormData}
            onSubmit={handleSignup}
        >
            {(props) => (
                <Form>
                    <Progress value={(nameComplete ? 20 : 0) + (emailComplete ? 20 : 0) + (phoneComplete ? 20 : 0) + (passwordComplete ? 20 : 0) + (confirmPasswordComplete ? 20 : 0)} borderRadius={"lg"} />
                    <VStack p={2}>
                        {initialPage && <Field name='name' validate={validateName}>
                            {({ field, form }: any) => (
                                <FormControl isInvalid={form.errors.name && form.touched.name} isRequired>
                                    <FormLabel>Name</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents='none'>
                                            <Icon as={IoPersonSharp} boxSize={"1em"} color='gray.300' />
                                        </InputLeftElement>
                                        <Input {...field}
                                            placeholder='Alex Student'
                                            onChange={e => {
                                                form.setFieldValue(field.name, e.target.value);
                                                if (validateName(e.target.value) === undefined) {
                                                    setNameComplete(true);
                                                } else if (e.target.value === '') {
                                                    setNameComplete(null);
                                                } else {
                                                    setNameComplete(false);
                                                }
                                            }} />
                                        {nameComplete === true ? (
                                            <InputRightElement>
                                                <CheckIcon color='green.500' />
                                            </InputRightElement>
                                        ) : nameComplete === false ? (
                                            <InputRightElement>
                                                <CloseIcon color='red.500' />
                                            </InputRightElement>
                                        ) : null}
                                    </InputGroup>
                                    {nameComplete === null ? <FormHelperText>Enter your first and last name.</FormHelperText> :
                                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>}
                                </FormControl>
                            )}
                        </Field>}
                        {initialPage && <Field name='email' validate={validateEmail}>
                            {({ field, form }: any) => (
                                <FormControl isInvalid={form.errors.email && form.touched.email} isRequired>
                                    <FormLabel>Campus Email</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents='none'>
                                            <EmailIcon color='gray.300' />
                                        </InputLeftElement>
                                        <Input {...field}
                                            placeholder='student@example.edu'
                                            onChange={e => {
                                                form.setFieldValue(field.name, e.target.value);
                                                if (validateEmail(e.target.value) === undefined) {
                                                    setEmailComplete(true);
                                                } else if (e.target.value === '') {
                                                    setEmailComplete(null);
                                                } else {
                                                    setEmailComplete(false);
                                                }
                                            }} />
                                        {emailComplete === true ? (
                                            <InputRightElement>
                                                <CheckIcon color='green.500' />
                                            </InputRightElement>
                                        ) : emailComplete === false ? (
                                            <InputRightElement>
                                                <CloseIcon color='red.500' />
                                            </InputRightElement>
                                        ) : null}
                                    </InputGroup>
                                    {emailComplete === null ? <FormHelperText>This will be used to verify you are a campus student.</FormHelperText> :
                                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>}
                                </FormControl>
                            )}
                        </Field>}
                        {initialPage && <Field name='phone' validate={validatePhone}>
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
                        </Field>}
                        {/* SMS functionality disabled - phoneConfirm always defaults to false */}
                        {/* {initialPage && <Field name='phoneConfirm'>
                            {({ field, form }: any) => (
                                <FormControl>
                                    <FormLabel>Phone Number Messaging</FormLabel>
                                    <Checkbox {...field} isChecked={props.values.phoneConfirm}>
                                        <Text fontSize={"xs"}>
                                            If you choose to opt in, we'll text this phone number to send notifications. Message and data rates may apply. By opting in, you agree to our <Link href='/terms' color='teal.500' as={NextLink.default}>Terms and Conditions</Link> and <Link href='/privacy' color='teal.500' as={NextLink.default}>Privacy Policy.</Link></Text>
                                    </Checkbox>
                                </FormControl>
                            )}
                        </Field>} */}
                        
                        {!initialPage && <Field name='password' validate={validatePassword}>
                            {({ field, form }: any) => (
                                <FormControl isInvalid={form.errors.password && form.touched.password} isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement>
                                            <IconButton
                                                aria-label="Show password"
                                                icon={showPassword ? <Tooltip label="Click to hide password"><ViewIcon /></Tooltip> : <Tooltip label="Click to view password"><ViewOffIcon /></Tooltip>}
                                                onClick={handleClickPassword}
                                                bg={'transparent'}
                                                _hover={{ bg: 'transparent' }}
                                            />
                                        </InputLeftElement>
                                        <Input
                                            {...field}
                                            pr='4.5rem'
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder='campuspass'
                                            onChange={e => {
                                                form.setFieldValue(field.name, e.target.value);
                                                if (validatePassword(e.target.value) === undefined) {
                                                    setPasswordComplete(true);
                                                } else if (e.target.value === '') {
                                                    setPasswordComplete(null);
                                                } else {
                                                    setPasswordComplete(false);
                                                }
                                            }
                                            }
                                        />
                                        {passwordComplete === true ? (
                                            <InputRightElement>
                                                <CheckIcon color='green.500' />
                                            </InputRightElement>
                                        ) : passwordComplete === false ? (
                                            <InputRightElement>
                                                <CloseIcon color='red.500' />
                                            </InputRightElement>
                                        ) : null}
                                    </InputGroup>
                                    {passwordComplete === null ? <FormHelperText>Enter a password at least 8 characters long.</FormHelperText> : <FormErrorMessage>{form.errors.password}</FormErrorMessage>}
                                </FormControl>
                            )}
                        </Field>}
                        {!initialPage && <Field name='confirmPassword' validate={(value: string) => validateConfirmPassword(value, props.values.password)}>
                            {({ field, form }: any) => (
                                <FormControl isInvalid={form.errors.confirmPassword && form.touched.confirmPassword} isRequired>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement>
                                            <IconButton
                                                aria-label="Show password"
                                                icon={showConfirmPassword ? <Tooltip label="Click to hide password"><ViewIcon /></Tooltip> : <Tooltip label="Click to view password"><ViewOffIcon /></Tooltip>}
                                                onClick={handleClickConfirmPassword}
                                                bg={'transparent'}
                                                _hover={{ bg: 'transparent' }}
                                            />
                                        </InputLeftElement>
                                        <Input
                                            {...field}
                                            pr='4.5rem'
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder='campuspass'
                                            onChange={e => {
                                                form.setFieldValue(field.name, e.target.value);
                                                if (validateConfirmPassword(e.target.value, props.values.password) === undefined) {
                                                    setConfirmPasswordComplete(true);
                                                } else if (e.target.value === '') {
                                                    setConfirmPasswordComplete(null);
                                                } else {
                                                    setConfirmPasswordComplete(false);
                                                }
                                            }
                                            }
                                        />
                                        {confirmPasswordComplete === true ? (
                                            <InputRightElement>
                                                <CheckIcon color='green.500' />
                                            </InputRightElement>
                                        ) : confirmPasswordComplete === false ? (
                                            <InputRightElement>
                                                <CloseIcon color='red.500' />
                                            </InputRightElement>
                                        ) : null}
                                    </InputGroup>
                                    {confirmPasswordComplete === null ? <FormHelperText>Enter the same password as the previous field.</FormHelperText> : <FormErrorMessage>{form.errors.confirmPassword}</FormErrorMessage>}
                                </FormControl>
                            )}
                        </Field>}
                    </VStack>
                    <VStack>
                        {initialPage && <Button
                            mt={4}
                            colorScheme='blue'
                            onClick={async () => {
                                setValidating(true);
                                props.validateField('name');
                                props.setFieldTouched('name', true);
                                props.validateField('email');
                                props.setFieldTouched('email', true);
                                props.validateField('phone');
                                props.setFieldTouched('phone', true);
                                if (emailComplete && phoneComplete && nameComplete) {
                                    const validated = await handleValidateInfo(props.values);
                                    if (validated) {
                                        setInitialPage(!initialPage)
                                    } else {
                                        setEmailComplete(false);
                                    }
                                }
                                setValidating(false);
                            }
                            }
                            type='button'
                            width={"100%"}
                            isLoading={validating}
                        >
                            Next
                        </Button>}
                        <ButtonGroup width={"100%"}>
                            {!initialPage && <Button
                                mt={4}
                                colorScheme='blue'
                                onClick={() => setInitialPage(!initialPage)}
                                type='button'
                                width={"100%"}
                            >
                                Back
                            </Button>}
                            {!initialPage && <Button
                                mt={4}
                                colorScheme='blue'
                                isLoading={props.isSubmitting}
                                type='submit'
                                width={"100%"}
                            >
                                Sign Up
                            </Button>}
                        </ButtonGroup>
                    </VStack>
                </Form>
            )}
        </Formik>
    )
}

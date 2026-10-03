/**
 * LoginForm.tsx
 * Allows the user to signin with their email or phone number and password.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { FormikHelpers, Formik, Form, Field } from "formik";
import React from "react"
import { FormControl, FormLabel, Input, FormErrorMessage, Button, InputGroup, InputLeftElement, IconButton, FormHelperText, Tooltip, VStack } from "@chakra-ui/react";
import { EmailIcon, PhoneIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export type LoginFormData = {
    username: string;
    password: string;
}

type LoginProps = {
    handleLogin: (values: LoginFormData, actions: FormikHelpers<LoginFormData>, type: 'phone' | 'email') => void;
}


export default function LoginForm({ handleLogin }: LoginProps) {
    const [usernameComplete, setUsernameComplete] = React.useState<boolean | null>(null);
    const [passwordComplete, setPasswordComplete] = React.useState<boolean | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const handleClick = () => setShowPassword(!showPassword);

    function detectPhone(value: string) {
        const cleanedSpaces = value.replace(/\s/g, ''); // spaces remove
        const cleanedParentheses = cleanedSpaces.replace(/\(|\)/g, ''); // parentheses removed
        return cleanedParentheses.match(/^\d+$/);

    }

    function validateEmail(value: string) {
        let error;
        if (!value) {
            error = 'Email is required';
        } else if (!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
            error = 'Please enter a valid email';
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

    function validateUsername(value: string) {
        let error;
        if (!value) {
            error = 'Username is required';
        } else {
            if (detectPhone(value)) {
                return validatePhone(value);
            } else {
                return validateEmail(value);
            }
        }
        return error;
    }

    const formatUsername = (username: string) => {
        // Format phone number as (123) 456 7890
        if (detectPhone(username)) {
            return formatPhoneNumber(username);
        }
        return username;
    }

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


    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            onSubmit={(values, actions) => handleLogin(values, actions, detectPhone(values.username) ? 'phone' : 'email')}
        >
            {(props) => (
                <Form>
                    <Field name='username' validate={validateUsername} >
                        {({ field, form }: any) => (
                            <FormControl isInvalid={form.errors.username && form.touched.username} isRequired>
                                <FormLabel>Email/Phone</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents='none'>
                                        {detectPhone(field.value) ? <PhoneIcon color={"gray.300"} /> : <EmailIcon color={"gray.300"} />}
                                    </InputLeftElement>
                                    <Input
                                        {...field}
                                        placeholder='student@example.edu'
                                        value={field.value}
                                        onChange={e => {
                                            form.setFieldValue(field.name, formatUsername(e.target.value));
                                            if (validateUsername(formatUsername(e.target.value)) === undefined) {
                                                setUsernameComplete(true);
                                            } else if (e.target.value === '') {
                                                setUsernameComplete(null);
                                            } else {
                                                setUsernameComplete(false);
                                            }
                                        }} />
                                </InputGroup>
                                {usernameComplete === null ? <FormHelperText>Enter your email or phone number.</FormHelperText> : <FormErrorMessage>{form.errors.username}</FormErrorMessage>}
                            </FormControl>
                        )}
                    </Field>

                    <Field name='password' validate={validatePassword}>
                        {({ field, form }: any) => (
                            <FormControl isInvalid={form.errors.password && form.touched.password} isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <InputLeftElement>
                                        <IconButton
                                            aria-label="Show password"
                                            icon={showPassword ? <Tooltip label="Click to hide password"><ViewIcon /></Tooltip> : <Tooltip label="Click to view password"><ViewOffIcon /></Tooltip>}
                                            onClick={handleClick}
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
                                </InputGroup>
                                {passwordComplete === null ? <FormHelperText>Enter a password at least 8 characters long.</FormHelperText> : <FormErrorMessage>{form.errors.password}</FormErrorMessage>}
                            </FormControl>
                        )}
                    </Field>
                    <VStack>
                        <Button
                            mt={4}
                            colorScheme='blue'
                            isLoading={props.isSubmitting}
                            type='submit'
                            width={"100%"}
                        >
                            Login
                        </Button>
                    </VStack>
                </Form>
            )}
        </Formik>
    )
}

/**
 * ForgotPassword.tsx
 * Will send the user a one time passcode to their email if they have forgotten their password.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import { FormikHelpers, Formik, Form, Field } from "formik";
import React from "react"
import { FormControl, FormLabel, Input, FormErrorMessage, Button, InputGroup, InputLeftElement, FormHelperText, VStack } from "@chakra-ui/react";
import { EmailIcon } from "@chakra-ui/icons";

export type ForgotPasswordFormData = {
  username: string;
}

type ForgotPasswordProps = {
  handleLogin: (values: ForgotPasswordFormData, actions: FormikHelpers<ForgotPasswordFormData>, type: 'phone' | 'email') => void;
}

export default function ForgotPasswordForm({ handleLogin }: ForgotPasswordProps) {
  const [usernameComplete, setUsernameComplete] = React.useState<boolean | null>(null);
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
      initialValues={{ username: '' }}
      onSubmit={(values, actions) => handleLogin(values, actions, 'email')}
    // onSubmit={(values, actions) => handleLogin(values, actions, detectPhone(values.username) ? 'phone' : 'email')}
    >
      {(props) => (
        <Form>
          <Field name='username' validate={validateEmail} >
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.username && form.touched.username} isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <EmailIcon color={"gray.300"} />
                  </InputLeftElement>
                  <Input
                    {...field}
                    placeholder='student@example.edu'
                    value={field.value}
                    onChange={e => {
                      form.setFieldValue(field.name, formatUsername(e.target.value));
                      if (validateEmail(e.target.value) === undefined) {
                        setUsernameComplete(true);
                      } else if (e.target.value === '') {
                        setUsernameComplete(null);
                      } else {
                        setUsernameComplete(false);
                      }
                    }} />
                </InputGroup>
                {usernameComplete === null ? <FormHelperText>Enter your email to receive a verification code.</FormHelperText> : <FormErrorMessage>{form.errors.username}</FormErrorMessage>}
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
              Send Code
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  )
}

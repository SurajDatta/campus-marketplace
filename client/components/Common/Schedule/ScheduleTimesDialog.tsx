/**
 * ScheduleTimesDialog.tsx
 * Will use AI to create a schedule.
 * @AshokSaravanan222
 * 10-10-2024
 */

import { CheckIcon, CloseIcon, DeleteIcon, RepeatClockIcon } from "@chakra-ui/icons";
import { Button, HStack, Icon, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import { useRef, useState } from "react"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react'
import { Location, Profile, Schedule } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import * as Yup from 'yup';
import { Form, Field, Formik, FormikHelpers } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, FormHelperText, InputGroup, InputLeftElement, InputRightElement, Spinner } from "@chakra-ui/react";
import { createSchedule, ScheduleJSONOutput } from "@/utils/services/gemini";
import { FaMagic } from "react-icons/fa";

type ScheduleFormData = {
    times: string
}

type ScheduleTimesDialogProps = {
    isMobile: boolean
    setSchedule: React.Dispatch<React.SetStateAction<Schedule>>;
}

export default function ScheduleTimesDialog({ isMobile, setSchedule }: ScheduleTimesDialogProps) {
    const [aiGenerating, setAIGenerating] = useState<boolean>(false);
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef(null)
    const toast = useToast()


    const isTimeValid = (times: string) => {
        return times.length > 0;
    }

    const timeValidationSchema = Yup.object().shape({
        times: Yup.string().required('')
    })

    const handleAISchedule = async (values: ScheduleFormData, actions: FormikHelpers<ScheduleFormData>) => {
        try {
            setAIGenerating(true);
            let timesArray = {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: [],
            } as ScheduleJSONOutput;
            const promise = createSchedule(values.times);
            toast.promise(promise, {
                success: { title: 'Generated Times', description: 'Verify the slots and make corrections as necessary.' },
                error: { title: 'Error', description: 'Something went wrong. Please try again or contact us if the issue persists.' },
                loading: { title: 'Processing', description: 'Please wait while AI generates times.' },
            })
            const output = await promise;
            if (output) {
                timesArray = output
            }
            setSchedule((prev) => {
                return {
                    ...prev,
                    monday: [...new Set([...prev.monday, ...timesArray.monday])],
                    tuesday: [...new Set([...prev.tuesday, ...timesArray.tuesday])],
                    wednesday: [...new Set([...prev.wednesday, ...timesArray.wednesday])],
                    thursday: [...new Set([...prev.thursday, ...timesArray.thursday])],
                    friday: [...new Set([...prev.friday, ...timesArray.friday])],
                    saturday: [...new Set([...prev.saturday, ...timesArray.saturday])],
                    sunday: [...new Set([...prev.sunday, ...timesArray.sunday])],
                }
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again or contact us if the issue persists.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        } finally {
            actions.setSubmitting(false)
            setAIGenerating(false)
            onClose()
        }
    }

    return (
        <>
            <HStack>
                {isMobile ? <IconButton aria-label='Generate Schedule' icon={<Icon as={FaMagic} />} onClick={onOpen} colorScheme="blue" /> : <Button colorScheme="blue" onClick={onOpen} leftIcon={<Icon as={FaMagic} />} size={"sm"}>Schedule with AI</Button>}
            </HStack>
            <Formik initialValues={{ times: '' } as ScheduleFormData} onSubmit={handleAISchedule} validationSchema={timeValidationSchema}>
                {({ errors, touched, values, isSubmitting, submitForm }) => {
                    return (
                        <Form>
                            <AlertDialog
                                isOpen={isOpen}
                                leastDestructiveRef={cancelRef}
                                onClose={onClose}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                            Schedule with AI
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                            <Field name="times">
                                                {({ field, form }: any) => (
                                                    <FormControl isInvalid={!!(errors.times && touched.times)} isRequired>
                                                        <FormLabel>Times</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents='none'>
                                                                <Icon as={RepeatClockIcon} />
                                                            </InputLeftElement>
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                placeholder='sunday 6-8 pm, daily, MWF evenings'
                                                            />
                                                            {aiGenerating ?
                                                                <InputRightElement>
                                                                    <Spinner size="sm" />
                                                                </InputRightElement> : (isTimeValid(values.times) && !errors.times) || (touched.times && !errors.times) ? (
                                                                    <InputRightElement>
                                                                        <CheckIcon color='green.500' />
                                                                    </InputRightElement>
                                                                ) : touched.times && errors.times ? (
                                                                    <InputRightElement>
                                                                        <CloseIcon color='red.500' />
                                                                    </InputRightElement>
                                                                ) : null}
                                                        </InputGroup>
                                                        {!touched.times || !errors.times ? <FormHelperText>Enter times when you are available to sell this item.</FormHelperText> : <FormErrorMessage>{errors.times}</FormErrorMessage>}
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <Button ref={cancelRef} type="button" onClick={onClose}>
                                                Close
                                            </Button>
                                            <Button colorScheme='blue' ml={3} isLoading={isSubmitting} onClick={submitForm}>
                                                Generate
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </Form>
                    )
                }}
            </Formik>

        </>
    )

}
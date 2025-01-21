import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type MeetingPublic,
  type MeetingUpdate,
  MeetingsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditMeetingProps {
  meeting: MeetingPublic
  isOpen: boolean
  onClose: () => void
}

const EditMeeting = ({ meeting, isOpen, onClose }: EditMeetingProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<MeetingUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: meeting,
  })

  const mutation = useMutation({
    mutationFn: (data: MeetingUpdate) =>
      MeetingsService.updateMeeting({ id: meeting.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Meeting updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] })
    },
  })

  const onSubmit: SubmitHandler<MeetingUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                id="title"
                {...register("title", {
                  required: "Title is required",
                })}
                type="text"
              />
              {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel htmlFor="agenda">Agenda</FormLabel>
              <Input
                id="agenda"
                {...register("agenda", {
                  required: "Agenda is required",
                })}
                type="text"
              />
              {errors.agenda && (
                <FormErrorMessage>{errors.agenda.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="description">Summary</FormLabel>
              <Input
                id="summary"
                {...register("summary")}
                placeholder="Summary"
                type="text"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditMeeting

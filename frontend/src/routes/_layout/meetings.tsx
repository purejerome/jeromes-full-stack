import {
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { MeetingsService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddMeeting from "../../components/Meetings/AddMeeting"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/meetings")({
  component: Meetings,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getMeetingsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      MeetingsService.readMeetings({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["meetings", { page }],
  }
}

function MeetingsTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const {
    data: meetings,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getMeetingsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && meetings?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getMeetingsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Agenda</Th>
              <Th>Summary</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {meetings?.data.map((meeting) => (
                <Tr key={meeting.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{meeting.id}</Td>
                  <Td isTruncated maxWidth="150px">
                    {meeting.title}
                  </Td>
                  <Td>
                    {meeting.agenda}
                  </Td>
                  <Td
                    color={!meeting.summary ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {meeting.summary || "N/A"}
                  </Td>
                  <Td>
                    <ActionsMenu type={"Meeting"} value={meeting} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <PaginationFooter
        page={page}
        onChangePage={setPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </>
  )
}

function Meetings() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Meetings Management
      </Heading>

      <Navbar type={"Meeting"} addModalAs={AddMeeting} />
      <MeetingsTable />
    </Container>
  )
}

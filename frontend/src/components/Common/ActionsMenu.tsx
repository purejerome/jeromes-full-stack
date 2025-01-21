import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash } from "react-icons/fi"

import type { ItemPublic, UserPublic, MeetingPublic } from "../../client"
import EditUser from "../Admin/EditUser"
import EditItem from "../Items/EditItem"
import EditMeeting from "../Meetings/EditMeeting"
import Delete from "./DeleteAlert"

type EditComponentType = 'User' | 'Meeting' | 'Item';

interface ActionsMenuProps {
  type: EditComponentType 
  value: ItemPublic | UserPublic | MeetingPublic
  disabled?: boolean
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editUserModal = useDisclosure()
  const deleteModal = useDisclosure()
  const editComponent = {
  User: <EditUser
          user={value as UserPublic}
          isOpen={editUserModal.isOpen}
          onClose={editUserModal.onClose}
        />,
  Meeting: <EditMeeting
              meeting={value as MeetingPublic}
              isOpen={editUserModal.isOpen}
              onClose={editUserModal.onClose}
            />,
  Item: <EditItem
          item={value as ItemPublic}
          isOpen={editUserModal.isOpen}
          onClose={editUserModal.onClose}
        />
};

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem
            onClick={editUserModal.onOpen}
            icon={<FiEdit fontSize="16px" />}
          >
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        {editComponent[type]}
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu

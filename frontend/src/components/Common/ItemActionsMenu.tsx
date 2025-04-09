import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { ItemPublic, OrderPublic } from "@/client"
import DeleteItem from "../Items/DeleteItem"
import EditItem from "../Items/EditItem"

interface ItemActionsMenuProps {
  item: ItemPublic | OrderPublic
}

function isItemPublic(item: ItemPublic | OrderPublic): item is ItemPublic {
  return "description" in item; // adjust based on actual unique props
}

export const ItemActionsMenu = ({ item }: ItemActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
      {isItemPublic(item) && <EditItem item={item} />}
      {isItemPublic(item) && <DeleteItem id={item.id} />}
      </MenuContent>
    </MenuRoot>
  )
}

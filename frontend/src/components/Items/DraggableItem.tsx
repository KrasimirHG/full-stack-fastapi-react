import React from "react";
import { useDrag } from "react-dnd";
import { Box } from "@chakra-ui/react";

type DraggableItemProps = {
  id: string;
  title: string;
};

export function DraggableItem({ id, title }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "ITEM",
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag}
      opacity={isDragging ? 0.5 : 1}
      cursor="grab"
      p={2}
      bg="gray.100"
      borderRadius="md"
      m={1}
    >
      {title}
    </Box>
  );
}

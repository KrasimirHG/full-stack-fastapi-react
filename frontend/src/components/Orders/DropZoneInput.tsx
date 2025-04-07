import React from "react";
import { useDrop } from "react-dnd";

type DropZoneInputProps = {
  name: `orders.${number}.item_id`;
  setValue: (name: `orders.${number}.item_id`, value: string) => void;
  children: React.ReactNode;
};

export function DropZoneInput({
  name,
  setValue,
  children,
}: DropZoneInputProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "ITEM",
    drop: (item: { id: string }) => {
      setValue(name, item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        border: isOver ? "2px dashed green" : "2px dashed transparent",
        padding: "4px",
      }}
    >
      {children}
    </div>
  );
}

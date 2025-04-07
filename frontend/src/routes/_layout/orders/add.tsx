import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { ItemsService } from "@/client";
import PendingItems from "@/components/Pending/PendingItems";
import { Box, EmptyState, Table, VStack } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import AddOrderWithoutModal from "@/components/Orders/AddOrderWithoutModal";
import { DraggableItem } from "@/components/Items/DraggableItem";

export const Route = createFileRoute("/_layout/orders/add")({
  component: () => <AddOrder />,
  validateSearch: () => ({}),
});

function getAllItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems1(), // read all items
    queryKey: ["items"],
  };
}

function ItemsTable() {
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getAllItemsQueryOptions(),
    placeholderData: (prevData) => prevData,
  });

  const items = data?.data ?? [];

  if (isLoading) {
    return <PendingItems />;
  }

  if (items.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any items yet</EmptyState.Title>
            <EmptyState.Description>
              Go to the items page to Add a new item and get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <Box
      bg="gray.50"
      p={4}
      borderRadius="md"
      maxH="30vh"
      overflowY="auto"
      boxShadow="sm"
      mb={4}
    >
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items?.map((item) => (
            <Table.Row key={item.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {item.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
              <DraggableItem id={item.id} title={item.title} />
              </Table.Cell>
              <Table.Cell
                color={!item.description ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {item.description || "N/A"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
function AddOrder() {
  return (
    <DndProvider backend={HTML5Backend}>
      <h1 style={{ marginBottom: "1rem" }}>Available Items</h1>
      <ItemsTable />
      <AddOrderWithoutModal />
    </DndProvider>
  );
}

import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { OrdersService } from "@/client";
// import { ItemActionsMenu } from "@/components/Common/ItemActionsMenu"
import AddOrder from "@/components/Orders/AddOrder";
import PendingItems from "@/components/Pending/PendingItems";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";

import { isDateEqual, printDate } from "@/utils";

const ordersSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getOrdersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      OrdersService.readOrders({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["orders", { page }],
  };
}

export const Route = createFileRoute("/_layout/orders")({
  component: Orders,
  validateSearch: (search) => ordersSearchSchema.parse(search),
});

function OrdersTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getOrdersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const orders = data?.data.slice(0, PER_PAGE) ?? [];
  const count = data?.data.length ?? 0;

  if (isLoading) {
    return <PendingItems />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any orders yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new order to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Item ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Quantity</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Created On</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Updated On</Table.ColumnHeader>
            {/* <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader> */}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders?.map((order) => (
            <Table.Row key={order.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {order.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {order.item_id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {order.item_title}
              </Table.Cell>
              <Table.Cell
                color={!order.item_description ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {order.item_description || "N/A"}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {order.quantity}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {printDate(order.created_on)}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {isDateEqual(order.updated_on, order.created_on)
                  ? "Not updated"
                  : printDate(order.updated_on)}
              </Table.Cell>
              {/* <Table.Cell>
                <ItemActionsMenu item={item} />
              </Table.Cell> */}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function Orders() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Orders Management
      </Heading>
      <AddOrder />
      <OrdersTable />
    </Container>
  );
}

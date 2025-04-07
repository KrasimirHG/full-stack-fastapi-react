import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";

import { Button, HStack, IconButton, Input, VStack } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { FiTrash } from "react-icons/fi";

import { type OrderCreate, OrdersService } from "@/client";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

import { Field } from "../ui/field";
import { DropZoneInput } from "./DropZoneInput";

type OrderFormValues = {
  orders: OrderCreate[];
};

const AddOrderWithoutModal = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<OrderFormValues>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      orders: [{ quantity: 1, item_id: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orders",
  });

  const mutation = useMutation({
    mutationFn: (data: OrderCreate) =>
      OrdersService.createOrder({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Order created successfully.");
      reset();
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    for (const order of data.orders) {
      await mutation.mutateAsync(order);
    }
    reset({ orders: [{ quantity: 1, item_id: "" }] });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        {fields.map((field, index) => (
          <HStack key={field.id} gap={4} align="start">
            <Field
              invalid={!!errors.orders?.[index]?.quantity}
              errorText={errors.orders?.[index]?.quantity?.message}
              label="Quantity"
              flex={1}
            >
              <Input
                {...register(`orders.${index}.quantity`, {
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1" },
                })}
                placeholder="Quantity"
                type="number"
                min={1}
              />
            </Field>

            <Field
              invalid={!!errors.orders?.[index]?.item_id}
              errorText={errors.orders?.[index]?.item_id?.message}
              label="Item ID"
              flex={1}
              required
            >
              <DropZoneInput
                name={`orders.${index}.item_id`}
                setValue={setValue}
              >
                <Input
                  {...register(`orders.${index}.item_id`, {
                    required: "Item ID is required.",
                  })}
                  placeholder="Item ID"
                />
              </DropZoneInput>
            </Field>
            <Tooltip label="Delete the row" placement="left">
              <IconButton
                aria-label="Remove"
                variant="ghost"
                colorScheme="red"
                _hover={{ bg: "red.50" }}
                onClick={() => remove(index)}
                mt={6}
              >
                <FiTrash />
              </IconButton>
            </Tooltip>
          </HStack>
        ))}

        <HStack justify="space-between">
          <Button onClick={() => append({ quantity: 1, item_id: "" })}>
            Add Order
          </Button>

          <Button
            type="submit"
            variant="solid"
            colorScheme="blue"
            disabled={!isValid}
            loading={isSubmitting}
          >
            Save Orders
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default AddOrderWithoutModal;

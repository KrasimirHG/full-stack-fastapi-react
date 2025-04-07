import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
    Button,
    HStack,
    Input,
    VStack,
  } from "@chakra-ui/react";
// import { useState } from "react";
// import { FaPlus } from "react-icons/fa";

import { type OrderCreate, OrdersService } from "@/client";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

import { Field } from "../ui/field";

type OrderFormValues = {
    orders: OrderCreate[];
  };

const AddOrderWithoutModal = () => {
//   const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<OrderCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      quantity: 1,
      item_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: OrderCreate) =>
      OrdersService.createOrder({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Order created successfully.");
      reset();
    //   setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const onSubmit: SubmitHandler<OrderCreate> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4}>
        <Field
          invalid={!!errors.quantity}
          errorText={errors.quantity?.message}
          label="Quantity"
        >
          <Input
            id="quantity"
            {...register("quantity")}
            placeholder="Quantity"
            type="number"
            min={1}
          />
        </Field>

        <Field
          invalid={!!errors.item_id}
          errorText={errors.item_id?.message}
          label="Item ID"
          required
        >
          <Input
            id="item_id"
            {...register("item_id", {
              required: "Item ID is required.",
            })}
            placeholder="Item ID"
            type="text"
          />
        </Field>
      </VStack>
      <Button
        variant="solid"
        type="submit"
        disabled={!isValid}
        loading={isSubmitting}
      >
        Save
      </Button>
    </form>
  );
};

export default AddOrderWithoutModal;
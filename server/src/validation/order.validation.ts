import { z } from "zod";
import { OrderStatus } from "../entities/Order.entity";

export const createOrderSchema = z.object({
  paymentMethod: z.string().trim().min(1, "Please select the payment method"),
  location: z.string().trim().optional().or(z.literal("")),
  totalAmount: z.coerce.number().finite().nonnegative("Total amount must be 0 or more"),
  orderItems: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive("Product ID must be valid"),
        quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Please provide at least one order item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus, {
    error: "Please provide a valid order status",
  }),
});

import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, updateStatus } from "../controllers/order.controller";
import { validate } from "../middleware/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.validation";

const orderRouter = Router();

orderRouter.post('/', validate(createOrderSchema), createOrder)
orderRouter.get("/:id", getOrderById)
orderRouter.get('/', getMyOrders)
orderRouter.patch('/:orderId/update', validate(updateOrderStatusSchema), updateStatus)

export default orderRouter;

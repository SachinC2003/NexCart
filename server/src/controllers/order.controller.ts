import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/try_catch";
import { AppDataSource } from "../configs/data-sourse";
import { Order, OrderStatus } from "../entities/Order.entity";
import { OrderItem } from "../entities/OrderItem.entity";
import { Product } from "../entities/Product.entity";
import { AppError } from "../utils/error";
import { off } from "node:cluster";

interface orderItem {
    productId : number,
    quantity: number
}

const orderRepo = AppDataSource.getRepository(Order);
/**
 * Create the new order
 */
export const createOrder = asyncHandler(async(req: AuthRequest, res: Response)=>{
    const userId = Number(req.userId);
    const { paymentMethod, location, totalAmount, orderItems } = req.body as {
        paymentMethod?: string;
        location?: string;
        totalAmount?: number;
        orderItems?: orderItem[];
    };

    if(!paymentMethod || totalAmount === undefined || totalAmount === null){
         throw new AppError("Please select the payment method", 400)
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        throw new AppError("Please provide at least one order item", 400);
    }

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try{
        const order = queryRunner.manager.create(Order,{
            totalAmount,
            location,
            paymentMethod,
            user: {id: userId},
            status: OrderStatus.PLACED
        })

        const savedOrder = await queryRunner.manager.save(order)

        for(let i = 0; i<orderItems.length; i++)
        {
            if (!orderItems[i]?.productId || !orderItems[i]?.quantity || orderItems[i].quantity <= 0) {
                throw new AppError("Each order item must include a valid productId and quantity", 400);
            }

            const product = await queryRunner.manager.findOne(Product, {
                where: { id: orderItems[i].productId }
            });

            product.purchaseCount += orderItems[i].quantity;
            await queryRunner.manager.save(product);

            if (!product) {
                throw new AppError(`Product ${orderItems[i].productId} not found`, 404);
            }
            if (product.stock < orderItems[i].quantity) {
                throw new AppError(`Insufficient stock for ${product.name}`, 400);
            }

            const item = queryRunner.manager.create(OrderItem, {
                order: savedOrder,
                product: product,
                quantity: orderItems[i].quantity,
                subTotal: Number(product.price) * orderItems[i].quantity
            })

            await queryRunner.manager.save(item)

            product.stock -= orderItems[i].quantity;
            await queryRunner.manager.save(product);
        }
        await queryRunner.commitTransaction()
        return res.status(201).json({ message: "Order placed successfully", order: savedOrder });

    } catch (error: any) {
        // 6. Rollback: If anything failed, NO data is changed in the DB
        await queryRunner.rollbackTransaction();
        console.error("Transaction failed:", error.message);
        throw error instanceof AppError ? error : new AppError(error.message || "Order failed", 400);
    } finally {
        // 7. Release connection
        await queryRunner.release();
    }
});

/**
 * Get the user orders
 */
export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);
    const status = req.query.status || 'ALL';
    const page = Number(req.query.page)|| 1;
    const limit = Number(req.query.limit) || 3;
    const offset = (page -1) * limit;

    const [orders, total] = await orderRepo.findAndCount({
        where: { 
            user: { id: userId },
            status: OrderStatus[status as keyof typeof OrderStatus],
        },
        relations: [
            'user',              
            'orderItems',
            'orderItems.product'
        ],
        order: {createdAt: 'DESC'},
        skip: offset,
        take: limit,
        withDeleted: true
    })

    // In TypeORM, find returns an empty array [] if nothing is found, not null
    if (orders.length === 0) {
        return res.status(200).json({ 
            message: "There is no orders placed yet.", 
            orders: [],
            total: 0
        });
    }

    res.status(200).json({
        message: "Orders fetched successfully",
        orders: orders,
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    });
});

/**
 * orders for admin
 */
export const adminOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const status = req.query.status || 'ALL';
    const page = Number(req.query.page)|| 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page -1) * limit;

    const [orders, total] = await orderRepo.findAndCount({
        where: { 
            status: OrderStatus[status as keyof typeof OrderStatus]
        },
        relations: [
            'user',               // Who bought it?
            'orderItems',
            'orderItems.product'  // What did they buy?
        ],
        order: {createdAt: 'DESC'},
        skip: offset,
        take: limit,
        withDeleted: true
    })

    // In TypeORM, find returns an empty array [] if nothing is found, not null
    if (orders.length === 0) {
        return res.status(200).json({ 
            message: "There is no orders placed yet.", 
            orders: [],
            total: 0
        });
    }

    res.status(200).json({
        message: "Orders fetched successfully",
        orders: orders,
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    });
});

/**
 * Get the order by Id
 */
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Note: Usually IDs are passed in params /:id, not query
    const id = Number(req.params.id); 

    if (Number.isNaN(id)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await orderRepo.findOne({
        where: { id: id },
        relations: [
            'orderItems', 
            'orderItems.product'
        ]
    });

    if (!order) {
        throw new AppError("No order found with this ID", 404);
    }

    res.status(200).json({
        message: "Order details fetched successfully",
        order: order
    });
});

/**
 * Update the status of order (Admin only)
 */
export const updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const id = Number(orderId);

    // FIX: Destructure 'status' from req.body
    const { status } = req.body; 

    console.log("ID extracted:", id);
    console.log("Status extracted:", status);

    if (isNaN(id)) {
        throw new AppError("Invalid Order ID format", 400);
    }

    const order = await orderRepo.findOne({
        where: { id: id }
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // Now 'status' is a string like 'DELIVERED', not an object
    order.status = status; 
    await orderRepo.save(order);

    res.status(200).json({
        message: "Order status updated",
        order
    });
});

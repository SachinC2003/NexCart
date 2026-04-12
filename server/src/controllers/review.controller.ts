import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/try_catch";
import { AppDataSource } from "../configs/data-sourse";
import { Order, OrderStatus } from "../entities/Order.entity";
import { Review } from "../entities/Review.entity";
import { Product } from "../entities/Product.entity";
import { AppError } from "../utils/error";

const orderRepo = AppDataSource.getRepository(Order);
const reviewRepo = AppDataSource.getRepository(Review);

/**
 * Add the review to perticular product
 */
export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);
    const { productId, rating, comment } = req.body;

    const hasBought = await orderRepo.findOne({
        where: {
            user: { id: userId },
            status: OrderStatus.DELIVERED,
            orderItems: { product: { id: productId } }
        }
    });

    if (!hasBought) {
        throw new AppError("You can only review items you have received.", 403);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const product = await queryRunner.manager.findOne(Product, {
            where: { id: productId }
        });

        if (!product) throw new AppError("Product not found", 404);

        const existingReview = await queryRunner.manager.findOneBy(Review, {
            user: { id: userId },
            product: { id: productId }
        });
        if (existingReview) throw new AppError("You already reviewed this product.", 409);

        const review = queryRunner.manager.create(Review, {
            rating,
            comment,
            user: { id: userId } as any,
            product: { id: productId } as any
        });
        await queryRunner.manager.save(review);

        const currentAvg = Number(product.avgRating) || 0;
        const totalReviews = await queryRunner.manager.count(Review, { 
            where: { product: { id: productId } } 
        });

        const prevCount = totalReviews - 1;
        const calculatedAvg = ((currentAvg * prevCount) + rating) / totalReviews;

        await queryRunner.manager.update(Product, productId, {
            avgRating: Number(calculatedAvg.toFixed(1))
        });

        await queryRunner.commitTransaction();
        return res.status(201).json({ message: "Review posted!", avgRating: calculatedAvg.toFixed(1) });

    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        throw error instanceof AppError ? error : new AppError(error.message || "Could not add review", 400);
    } finally {
        await queryRunner.release();
    }
});

/**
 * Remove the review to product
 */
export const removeReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);
    const productId = Number(req.params.productId); // Get from params: /reviews/:productId

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const review = await queryRunner.manager.findOneBy(Review, {
            user: { id: userId },
            product: { id: productId }
        });

        if (!review) {
            throw new AppError("Review not found or not yours", 404);
        }

        await queryRunner.manager.remove(Review, review);

        const stats = await queryRunner.manager
            .createQueryBuilder(Review, "review")
            .select("AVG(review.rating)", "avg")
            .where("review.productId = :id", { id: productId })
            .getRawOne();

        const newAvg = stats.avg ? parseFloat(stats.avg).toFixed(1) : 0;

        await queryRunner.manager.update(Product, productId, {
            avgRating: Number(newAvg)
        });

        await queryRunner.commitTransaction();

        return res.status(200).json({ 
            message: "Review removed and product rating updated", 
            newAvgRating: newAvg 
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Delete review transaction failed:", error);
        throw error instanceof AppError ? error : new AppError("Could not remove review", 500);
    } finally {
        await queryRunner.release();
    }
});

/**
 * get the review for product
 */
export const getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.productId);
    const reviewRepo = AppDataSource.getRepository(Review);

    // 1. Fetch reviews for the specific product
    const reviews = await reviewRepo.find({
        where: { product: { id: productId } },
        relations: ['user'], // Join the user table to get the name
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
                id: true,
                name: true,
            }
        },
        order: { createdAt: 'DESC' } // Newest reviews first
    });

    // 2. Return the data
    res.status(200).json(reviews);
});

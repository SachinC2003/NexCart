import { Request, Response } from "express";
import { AppDataSource } from "../configs/data-sourse";
import { Product } from "../entities/Product.entity";
import { asyncHandler } from "../utils/try_catch";
import { formatProductResponse } from "./product.controller";
import { ILike, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

const productRepo = AppDataSource.getRepository(Product);

/**
 * Get public products for guests
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { type, category, subCategory, searchTerm, minPrice, maxPrice } = req.query;
    let whereConditions: any = {
            name: ILike(`%${searchTerm || ''}%`)
    }
    
    if (type) whereConditions.type = { name: ILike(`%${type}%`) };
    if (category) whereConditions.category = { name: ILike(`%${category}%`) };
    if (subCategory) whereConditions.subCategory = { name: ILike(`%${subCategory}%`) };
    // --- FIX STARTS HERE ---
    const min = parseFloat(minPrice as string);
    const max = parseFloat(maxPrice as string);

    // Only apply the filter if both are valid numbers
    if (!isNaN(min) && !isNaN(max)) {
        whereConditions.price = Between(min, max);
    } else if (!isNaN(min)) {
        // If only min is provided
        whereConditions.price = MoreThanOrEqual(min);
    } else if (!isNaN(max)) {
        // If only max is provided
        whereConditions.price = LessThanOrEqual(max);
    }
    const [products, total] = await productRepo.findAndCount({
        where: {
            ...whereConditions,
            isActive: true
        },
        withDeleted: false,
        relations: {
            user: true,
            type: true,
            category: {
                type: true
            },
            subCategory: {
                category: {
                    type: true
                }
            },
            reviews: true
        },
        order: { createdAt: "DESC" },
        take: limit,
        skip: offset
    });

    if (products.length === 0) {
        return res.status(200).json({
            message: "There are no products available",
            products: [],
            total: 0,
            page,
            lastPage: 0
        });
    }

    return res.status(200).json({
        message: "Products fetched successfully",
        products: products.map(formatProductResponse),
        total,
        page,
        lastPage: Math.ceil(total / limit)
    });
});

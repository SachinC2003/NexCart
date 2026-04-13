import { Response } from "express";
import { ILike } from "typeorm";
import { AppDataSource } from "../configs/data-sourse";
import { Category } from "../entities/Category.entity";
import { SubCategory } from "../entities/SubCategory.entity";
import { ProductType } from "../entities/Type.entity";
import { asyncHandler } from "../utils/try_catch";
import { AppError } from "../utils/error";

const categoryRepo = AppDataSource.getRepository(Category);
const subCategoryRepo = AppDataSource.getRepository(SubCategory);
const typeRepo = AppDataSource.getRepository(ProductType);

export const createCategory = asyncHandler(async (req, res: Response) => {
    const { name, typeId } = req.body;

    if (!name || !typeId) {
        throw new AppError("Category name and typeId are required", 400);
    }

    const type = await typeRepo.findOne({ where: { id: Number(typeId) } });
    if (!type) {
        throw new AppError("Type not found", 404);
    }

    const existingCategory = await categoryRepo.findOne({
        where: {
            name: ILike(name.trim()),
            type: { id: type.id }
        },
        relations: ["type"]
    });

    if (existingCategory) {
        throw new AppError("Category already exists", 409);
    }

    const category = categoryRepo.create({
        name: name.trim(),
        type
    });
    await categoryRepo.save(category);

    res.status(201).json({ message: "Category created successfully", category });
});

export const createSubCategory = asyncHandler(async (req, res: Response) => {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
        throw new AppError("Sub category name and categoryId are required", 400);
    }

    const category = await categoryRepo.findOne({ where: { id: Number(categoryId) } });
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const existingSubCategory = await subCategoryRepo.findOne({
        where: {
            name: ILike(name.trim()),
            category: { id: category.id }
        },
        relations: ["category"]
    });

    if (existingSubCategory) {
        throw new AppError("Sub category already exists", 409);
    }

    const subCategory = subCategoryRepo.create({
        name: name.trim(),
        category
    });
    await subCategoryRepo.save(subCategory);

    res.status(201).json({ message: "Sub category created successfully", subCategory });
});

export const createType = asyncHandler(async (req, res: Response) => {
    const { name } = req.body;

    if (!name) {
        throw new AppError("Type name is required", 400);
    }

    const existingType = await typeRepo.findOne({
        where: { name: ILike(name.trim()) }
    });

    if (existingType) {
        throw new AppError("Type already exists", 409);
    }

    const type = typeRepo.create({
        name: name.trim()
    });
    await typeRepo.save(type);

    res.status(201).json({ message: "Type created successfully", type });
});

export const getTaxonomy = asyncHandler(async (_req, res: Response) => {
    const types = await typeRepo.find({
        relations: {
            categories: {
                subCategories: true
            }
        },
        order: {
            name: "ASC",
            categories: {
                name: "ASC",
                subCategories: {
                    name: "ASC"
                }
            }
        }
    });

    res.status(200).json({
        message: "Taxonomy fetched successfully",
        taxonomy: types
    });
});


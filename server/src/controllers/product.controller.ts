import { Response } from "express";
import path from "path";
import { AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/try_catch";
import { Product } from "../entities/Product.entity";
import { AppDataSource } from "../configs/data-sourse";
import { deleteImage, getImagePath, ImageUploadService } from "../services/imageUpload.service";
import { findFilteredProducts, findProductById, findProductsByAdminId } from "../repositories/product.Repository";
import { OrderItem } from "../entities/OrderItem.entity";
import { Between, ILike } from "typeorm";
import { Category } from "../entities/Category.entity";
import { SubCategory } from "../entities/SubCategory.entity";
import { ProductType } from "../entities/Type.entity";
import { getImagePublicPath } from "../middleware/upload.middleware";
import { off } from "cluster";
import { AppError } from "../utils/error";

const productRepo = AppDataSource.getRepository(Product);
const orderItemRepo = AppDataSource.getRepository(OrderItem);
const categoryRepo = AppDataSource.getRepository(Category);
const subCategoryRepo = AppDataSource.getRepository(SubCategory);
const typeRepo = AppDataSource.getRepository(ProductType);

const hasValue = (value: unknown) => value !== undefined && value !== null && `${value}`.trim() !== "";

export const formatProductResponse = (product: Product) => ({
    ...product,
    category: product.category?.name ?? null,
    subCategory: product.subCategory?.name ?? null,
    type: product.type?.name ?? null,
    categoryId: product.category?.id ?? null,
    subCategoryId: product.subCategory?.id ?? null,
    typeId: product.type?.id ?? null
});

const resolveTaxonomy = async (typeName: string, categoryName: string, subCategoryName: string) => {
    const trimmedType = typeName.trim();
    const trimmedCategory = categoryName.trim();
    const trimmedSubCategory = subCategoryName.trim();

    let type = await typeRepo.findOne({
        where: { name: ILike(trimmedType) }
    });

    if (!type) {
        type = typeRepo.create({ name: trimmedType });
        await typeRepo.save(type);
    }

    let category = await categoryRepo.findOne({
        where: {
            name: ILike(trimmedCategory),
            type: { id: type.id }
        },
        relations: ["type"]
    });

    if (!category) {
        category = categoryRepo.create({
            name: trimmedCategory,
            type
        });
        await categoryRepo.save(category);
    }

    let subCategory = await subCategoryRepo.findOne({
        where: {
            name: ILike(trimmedSubCategory),
            category: { id: category.id }
        },
        relations: ["category"]
    });

    if (!subCategory) {
        subCategory = subCategoryRepo.create({
            name: trimmedSubCategory,
            category
        });
        await subCategoryRepo.save(subCategory);
    }

    return { type, category, subCategory };
};

/**
 * This controller adds a new product to the platform.
 *
 * ROOT CAUSE FIX: Previously, productRepo.create() was passed full entity objects
 * (taxonomy.category, taxonomy.subCategory, taxonomy.type). TypeORM maps those to
 * their FK columns (categoryId, subCategoryId, typeId) correctly, BUT if the
 * Product entity also declares plain @Column() fields named "category", "subCategory",
 * or "type", TypeORM tries to INSERT NULL into those columns → SQLITE_CONSTRAINT error.
 *
 * FIX: Use { id } reference objects so TypeORM only touches the FK columns and
 * never attempts to write to a separate string column.
 */
export const addProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, brandName, category, subCategory, type, price, stock, originalPrice, offer } = req.body;

    if (![name, description, brandName, category, subCategory, type, price, stock, originalPrice, offer].every(hasValue)) {
        throw new AppError("All fields are required", 400);
    }

    if (!req.file) {
        throw new AppError("Product image is required", 400);
    }

    // Resolve (or create) taxonomy entries
    const taxonomy = await resolveTaxonomy(type, category, subCategory);

    // Use { id } references — this tells TypeORM to only set the FK column
    // (categoryId, subCategoryId, typeId) without touching any extra string column.
    const newProduct = productRepo.create({
        name,
        description,
        image: getImagePublicPath(req.file.filename),
        brandName,
        category: { id: taxonomy.category.id },
        subCategory: { id: taxonomy.subCategory.id },
        type: { id: taxonomy.type.id },
        price,
        originalPrice,
        offer,
        stock,
        user: req.userId ? { id: Number(req.userId) } : undefined
    });

    await productRepo.save(newProduct);

    // Re-fetch with relations so the response includes the full names
    const savedProduct = await findProductById(newProduct.id);

    return res.status(201).json({
        message: "Product Added successfully",
        product: savedProduct ? formatProductResponse(savedProduct) : newProduct
    });
});

/**
 * Edit the existing product details
 */
export const editProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.id);
    const { name, description, image, brandName, category, subCategory, type, price, originalPrice, offer, stock } = req.body;

    if (![name, description, brandName, category, subCategory, type, price, originalPrice, offer, stock].every(hasValue)) {
        throw new AppError("All fields are required", 400);
    }

    const product = await findProductById(productId);
    if (!product) {
        throw new AppError("This product is not present", 404);
    }

    // Smart Image Handling — only re-upload if a new base64 string is provided
    const previousImagePath = product.image;
    let finalImagePath = product.image;
    if (req.file) {
        finalImagePath = getImagePublicPath(req.file.filename);
    } else if (typeof image === "string" && image.startsWith('data:image')) {
        finalImagePath = ImageUploadService(image, req.userId);
    } else if (typeof image === "string" && image.trim()) {
        finalImagePath = image;
    }

    const taxonomy = await resolveTaxonomy(type, category, subCategory);

    product.name = name;
    product.description = description;
    product.image = finalImagePath;
    product.brandName = brandName;

    // Same fix: use { id } references to avoid touching any extra string columns
    product.category = { id: taxonomy.category.id } as Category;
    product.subCategory = { id: taxonomy.subCategory.id } as SubCategory;
    product.type = { id: taxonomy.type.id } as ProductType;

    product.price = price;
    product.originalPrice = originalPrice;
    product.offer = offer;
    product.stock = stock;

    try {
        const savedProduct = await productRepo.save(product);

        if (finalImagePath !== previousImagePath && previousImagePath) {
            deleteImage(previousImagePath);
        }

        const updatedProduct = await findProductById(savedProduct.id);

        return res.status(200).json({
            message: "Product Edited successfully",
            product: updatedProduct ? formatProductResponse(updatedProduct) : formatProductResponse(savedProduct)
        });
    } catch (error) {
        if (finalImagePath !== previousImagePath && finalImagePath.startsWith('/uploads/')) {
            deleteImage(finalImagePath);
        }

        throw error;
    }
});

/**
 * Product stock value updated
 */
export const updateStock = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.id);
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
        throw new AppError("Stock value required", 400);
    }

    const product = await findProductById(productId);
    if (!product) {
        throw new AppError("This product is not present", 404);
    }

    product.stock = stock;
    const savedProduct = await productRepo.save(product);

    return res.status(200).json({
        message: "Product stock value Edited successfully",
        product: formatProductResponse(savedProduct)
    });
});

/**
 * Delete the product or deactivate according to product status in orderItem
 */
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.id);

    const product = await findProductById(productId);
    if (!product) {
        throw new AppError("This product is not present", 404);
    }

    const orderCount = await orderItemRepo.countBy({
        product: { id: productId }
    });

    if (orderCount > 0) {
        product.deleteAt = new Date();
        await productRepo.save(product);
        deleteImage(product.image);

        return res.status(200).json({
            message: "Product archived (Soft Deleted) because it exists in orders."
        });
    } else {
        if (product.image) {
            deleteImage(product.image);
        }

        product.isActive = false;
        await productRepo.save(product);

        return res.status(200).json({
            message: "Product deactivate from database."
        });
    }
});

/**
 * Bulk delete
 */
export const bulkDeleteProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        throw new AppError("No IDs provided", 400);
    }

    await productRepo.delete(ids);

    return res.status(200).json({ message: `${ids.length} products deleted` });
});

/**
 * Get all products for a particular admin
 */
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const adminId = Number(req.userId);
    const page = Number(req.query.page)|| 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page -1) * limit;

    const { type, category, subCategory, searchTerm, minPrice, maxPrice } = req.query;
    let whereConditions: any = {
            name: ILike(`%${searchTerm || ''}%`)
    }
    
    if (type) whereConditions.type = { name: ILike(`%${type}%`) };
    if (category) whereConditions.category = { name: ILike(`%${category}%`) };
    if (subCategory) whereConditions.subCategory = { name: ILike(`%${subCategory}%`) };
    if (minPrice && maxPrice) whereConditions.price = Between(Number(minPrice), Number(maxPrice));

    const {products, total} = await findProductsByAdminId(adminId, page, limit , offset, whereConditions);

    if (!res || products.length === 0) {
        return res.status(200).json({ message: "There are no products for this admin", products: [] });
    }

    return res.status(200).json({
        message: "These are your products",
        products: Array.isArray(products) ? products.map(formatProductResponse) : [],
        total,
        page,
        lastPage: Math.ceil(total/ limit)
    });
});

/**
 * Get a single product by ID
 */
export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.id);
    const product = await findProductById(productId);

    if (!product) {
        throw new AppError("This product is not present", 404);
    }

    return res.status(200).json({
        message: "This is the product you requested",
        product: formatProductResponse(product)
    });
});


/**
 * Filter products by (type, category, subCategory, searchQuery)
 */
export const getFilteredProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, category, subCategory, searchQuery } = req.query;

    let whereConditions: any = {};

    if (type) {
        whereConditions.type = { name: ILike(`%${type}%`) };
    }
    if (category) {
        whereConditions.category = { name: ILike(`%${category}%`) };
    }
    if (subCategory) {
        whereConditions.subCategory = { name: ILike(`%${subCategory}%`) };
    }
    if (searchQuery) {
        whereConditions.name = ILike(`%${searchQuery}%`);
    }

    const filteredProducts = await findFilteredProducts(whereConditions);

    return res.status(200).json({
        message: "These are filtered products",
        product: filteredProducts.map(formatProductResponse)
    });
});



// export const getImage = asyncHandler(async (req: AuthRequest, res: Response) => {
//     const imageName = req.params.image as string;
//     const safeImageName = path.basename(imageName);
//     const imagePath = path.join(process.cwd(), 'uploads', 'images', safeImageName);

//     return res.sendFile(imagePath);
// });

export const getImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const imageName  = req.params.image as string;

    // Get the physical path from the service
    const filePath = getImagePath(imageName);

    // sendFile handles setting Content-Type (image/png, etc.) automatically
    res.sendFile(filePath, (err) => {
        if (err) {
            // If even the placeholder is missing, prevent an infinite loop
            res.status(404).json({
                success: false,
                message: "Image not found and placeholder missing."
            });
        }
    });
});
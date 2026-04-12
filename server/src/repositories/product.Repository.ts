import { AppDataSource } from "../configs/data-sourse"
import { Product } from "../entities/Product.entity"

const productRepo = AppDataSource.getRepository(Product);
const productRelations = {
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
    reviews: true,
} as const;

export const findProductById = async(id : number)=> {
    const product = productRepo.findOne({
        where: { id: id },
        relations: productRelations
    });

    return product;
}

export const findProductsByAdminId = async(id : number, page: number, limit: number, offset: number, whereConditions: any)=> {
    console.log("Where conditions in repository: ", whereConditions);
    const [products, total] = await productRepo.findAndCount({ 
        where: {
            ...whereConditions,
            isActive:true
        },
        withDeleted: false,   // give deleted products also
        relations: productRelations,
        order: { createdAt: "DESC" },
        take: limit,
        skip: offset
    });

    return { products, total };
}

export const findFilteredProducts = async(whereConditions: any)=> {
    const products = productRepo.find({ 
        where: whereConditions,
        relations: productRelations,
        order: { createdAt: 'DESC'}
    });

    return products;
}

import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/try_catch";
import { AppDataSource } from "../configs/data-sourse";
import { Cart } from "../entities/Cart.entity";
import { CartItem } from "../entities/CartItem.entity";
import { findCartById, findCartByUserId } from "../repositories/cart.Repository";
import { findUserById } from "../repositories/user.Repository";
import { Product } from "../entities/Product.entity";
import { AppError } from "../utils/error";

interface cartItem {
    productId : number,
    quantity : number
}

interface updatedCartItem {
    cartItemId : number,
    quantity : number
}

const cartRepo = AppDataSource.getRepository(Cart);
const cartItemRepo = AppDataSource.getRepository(CartItem);
const productRepo = AppDataSource.getRepository(Product);
/**
 * Add the product with there quantity to cart
 */
export const addToCart = asyncHandler(async (req: AuthRequest, res: Response)=>{
    const userId = req.userId;
    const cartItem : cartItem = req.body;

    if(!cartItem){
        return res.status(200).json({ message: "Please select the products to add into cart"})
    }

    let cart = await findCartByUserId(userId);

    if(!cart){
        const user = await findUserById(userId);
        cart = await cartRepo.create({
            user: user
        })

        await cartRepo.save(cart);
    }

    const product = await productRepo.findOne({
        where: { id: cartItem.productId }
    });

    if (!product) {
        throw new AppError(`Product ${cartItem.productId} not found`, 404);
    }

    const existingCartItem = await cartItemRepo.findOne({
        where: {
            cart: { id: cart.id },
            product: { id: product.id }
        }
    });
    if(existingCartItem){
        throw new AppError("Product already in cart, you can update the quantity from cart", 400);
    }
    const item = cartItemRepo.create({
        cart: cart,
        product: product,
        quantity: cartItem.quantity
    })

    await cartItemRepo.save(item);

    res.status(200).json({message: "Product added to cart succssefully"});
})

/**
 * update the quantity of cart products
 */
export const updateQuantity = asyncHandler(async(req: AuthRequest, res:Response)=>{
    const updatedCartItems : updatedCartItem[] = req.body;

    if (!updatedCartItems || updatedCartItems.length === 0) {
        throw new AppError("No items provided", 400);
    }

    // Use Promise.all to run all updates in parallel
    await Promise.all(
        updatedCartItems.map(async (update) => {
            const item = await cartItemRepo.findOneBy({ id: update.cartItemId });
            if (item) {
                item.quantity = update.quantity;
                return cartItemRepo.save(item);
            }
        })
    );

    res.status(200).json({message: "Cart Product quantity updated succssefully"});
})

/**
 * Cart Item deleted
 */
export const removeFromCart = asyncHandler(async(req: AuthRequest, res:Response)=>{
    const cartItemId = Number(req.params.cartItemId);

    if(!cartItemId)   throw new AppError("Cart item id required", 400);

    await cartItemRepo.delete({id : cartItemId})

    res.status(200).json({message: "Cart item deleted"})
});

/**
 * clear the cart
 */
export const clearCart = asyncHandler(async(req: AuthRequest, res:Response)=>{
    const userId = Number(req.userId);

    if(!userId)   throw new AppError("User id required", 400);
    const userCart = await cartRepo.findOne({where: {user: {id: userId}}})

    if(!userCart){
        return res.status(200).json({message: "Cart already empty"});
    }

    await cartItemRepo.delete({cart: {id: userCart.id}})

    res.status(200).json({message: "Cart cleared successfully"})
});


/**
 * get the cart for a user
 */
export const getCart = asyncHandler(async(req: AuthRequest, res: Response)=>{
    const userId = Number(req.userId);

    if(!userId)  throw new AppError("User id required", 400);

    const cart = await findCartByUserId(userId);

    if(!cart)  throw new AppError("Currently you not started a shoping, Start now by adding some products into cart", 404);

    res.status(200).json({message: "Cart fetched successfully", cart: cart});
})

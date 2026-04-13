import { AppDataSource } from "../configs/data-sourse";
import { Cart } from "../entities/Cart.entity";
import { CartItem } from "../entities/CartItem.entity";

const cartRepo = AppDataSource.getRepository(Cart);
const cartItemRepo = AppDataSource.getRepository(CartItem);

export const findCartByUserId = async(userId : number) =>{
    const cart = await cartRepo.findOne({
        where: {
            user: {id: userId}
        },
        relations:{
            cartItems: {
                product: true
            }
        }
    })

    return cart;
}

export const findCartById = async(id : number) =>{
    const cart = await cartItemRepo.findOne({
        where: {id: id}
    })

    return cart;
}
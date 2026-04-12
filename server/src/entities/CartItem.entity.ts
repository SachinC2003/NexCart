import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Cart } from "./Cart.entity";
import { Product } from "./Product.entity";

@Entity()
@Unique(["cart", "product"])
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> Cart, (cart)=> cart.cartItems)
    cart: Cart

    @ManyToOne(()=> Product, (product)=> product.cartItems)
    product: Product

    @Column()
    quantity: number
}

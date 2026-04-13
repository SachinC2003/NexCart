import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { CartItem } from "./CartItem.entity";
import { User } from "./User.entity";

@Entity()
@Unique(["user"])
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(()=> CartItem, (cartItem)=> cartItem.cart)
    cartItems: CartItem[]

    @OneToOne(()=> User, (user)=> user.cart)
    @JoinColumn()
    user: User
}

import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Order } from "./Order.entity";
import { Product } from "./Product.entity";

@Entity()
@Unique(["order", "product"])
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(()=> Order, (order)=> order.orderItems)
    order: Order

    @ManyToOne(()=> Product, (product)=> product.orderItems)
    product: Product

    @Column()
    quantity: number

    @Column({type: 'decimal'})
    subTotal: number
}

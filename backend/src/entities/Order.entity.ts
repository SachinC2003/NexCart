import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User.entity";
import { OrderItem } from "./OrderItem.entity";

export enum OrderStatus {
  PLACED = 'PLACED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED'
}

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    id: number

    @Column('float')
    totalAmount!: number

    @Column({default: OrderStatus.PLACED })
    status: OrderStatus   // PLACED | CANCELLED | DELIVERED

    @Column()
    paymentMethod: string

    @Column()
    location: string;

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    orderItems: OrderItem[]
    
    @ManyToOne(()=> User, (user)=> user.orders)
    user: User
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { RefreshToken } from "../entities/RefreshToken.entity";
import { Order } from "./Order.entity";
import { Cart } from "./Cart.entity";
import { Product } from "./Product.entity";
import { Review } from "./Review.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: "user" })
  role: string;

  @Column({ nullable: true})
  phoneNumber: string;

  @Column({ default : true})
  isActive: boolean;

  @Column( { nullable: true})
  location: string;

  @OneToMany(()=> Order, (order)=> order.user)
  orders: Order[];

  @OneToOne(()=> Cart, (cart)=> cart.user)
  cart: Cart;

  @OneToMany(()=> RefreshToken, (refreshToken)=> refreshToken.user) // Fixes your specific error
  refreshTokens?: RefreshToken[];

  @OneToMany(()=>Product, (product)=> product.user)
  products: Product[];

  @OneToMany(()=> Review, (reviews)=> reviews.user)
  reviews: Review[]
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
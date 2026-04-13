import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./OrderItem.entity";
import { CartItem } from "./CartItem.entity";
import { User } from "./User.entity";
import { Review } from "./Review.entity";
import { Category } from "./Category.entity";
import { SubCategory } from "./SubCategory.entity";
import { ProductType } from "./Type.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    image!: string

    @Column()
    brandName: string

    @Column({ nullable: true, default: 0 })
    purchaseCount: number

    @ManyToOne(() => Category, (category) => category.products, { nullable: false })
    @JoinColumn({ name: "categoryId" })
    category: Category

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, { nullable: false })
    @JoinColumn({ name: "subCategoryId" })
    subCategory: SubCategory

    @ManyToOne(() => ProductType, (type) => type.products, { nullable: false })
    @JoinColumn({ name: "typeId" })
    type: ProductType

    @Column()
    price: number

    @Column({ nullable: true })
    originalPrice: number

    @Column()
    stock: number

    @Column({ type: "decimal", default: 0 })
    avgRating: number

    @Column({ nullable: true})
    offer: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deleteAt: Date

    @Column({ default: true})
    isActive: boolean
    
    @OneToMany(()=> OrderItem, (orderItem)=> orderItem.product)
    orderItems: OrderItem[]

    @OneToMany(()=> CartItem, (cartItem)=> cartItem.product)
    cartItems: CartItem[]

    @ManyToOne(()=> User, (user)=>user.products)
    user: User;

    @OneToMany(()=> Review, (reviews)=> reviews.product)
    reviews: Review[]
}

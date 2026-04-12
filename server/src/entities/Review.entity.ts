import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User.entity";
import { Product } from "./Product.entity";

@Entity()
@Unique(["user", "product"])
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    rating: number; // 1 to 5 stars

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.reviews)
    user: User;

    @ManyToOne(() => Product, (product) => product.reviews)
    product: Product;
}

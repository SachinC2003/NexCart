import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Category } from "./Category.entity";
import { Product } from "./Product.entity";

@Entity({ name: "sub_category" })
@Unique(["name", "category"])
export class SubCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Category, (category) => category.subCategories, { nullable: false })
    category: Category;

    @OneToMany(() => Product, (product) => product.subCategory)
    products: Product[];
}

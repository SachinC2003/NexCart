import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Category } from "./Category.entity";
import { Product } from "./Product.entity";

@Entity({ name: "type" })
@Unique(["name"])
export class ProductType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Category, (category) => category.type)
    categories: Category[];

    @OneToMany(() => Product, (product) => product.type)
    products: Product[];
}

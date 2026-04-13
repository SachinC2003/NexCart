import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "./Product.entity";
import { SubCategory } from "./SubCategory.entity";
import { ProductType } from "./Type.entity";

@Entity({ name: "category" })
@Unique(["name", "type"])
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => ProductType, (type) => type.categories, { nullable: false })
    type: ProductType;

    @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
    subCategories: SubCategory[];

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}

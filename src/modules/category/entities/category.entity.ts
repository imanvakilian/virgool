import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { BlogCategoryEntity } from "src/modules/blog/entities/blogCategory.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityName.category)
export class CategoryEntity extends BaseEntity {
    @Column()
    title: string;
    @Column({ nullable: true })
    priority: string;
    @OneToMany(() => BlogCategoryEntity, blog_category => blog_category.category)
    blog_category: BlogCategoryEntity[];
}

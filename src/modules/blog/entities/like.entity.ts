import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.blogLikes)
export class BlogLikesEntity extends BaseEntity {
    @Column()
    userId: number;
    @Column()
    blogId: number;
    @ManyToOne(() => UserEntity, user => user.blog_likes, { onDelete: "CASCADE" })
    user: UserEntity;
    @ManyToOne(() => BlogEntity, blog => blog.likes, { onDelete: "CASCADE" })
    blog: BlogEntity;
}
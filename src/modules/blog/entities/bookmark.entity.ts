import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { BlogEntity } from "./blog.entity";
import { BaseEntity } from "src/common/abstracts/baseEntity";

@Entity(EntityName.blogBookmarks)
export class BlogBookmarkEntity extends BaseEntity {
    @Column()
    userId: number;
    @Column()
    blogId: number;
    @ManyToOne(() => UserEntity, user => user.blog_bookmarks, { onDelete: "CASCADE" })
    user: UserEntity;
    @ManyToOne(() => BlogEntity, blog => blog.bookmarks, { onDelete: "CASCADE" })
    blog: BlogEntity;
}
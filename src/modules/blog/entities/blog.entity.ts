import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { BlogStatus } from "../enum/status.enum";
import { BlogLikesEntity } from "./like.entity";
import { BlogBookmarkEntity } from "./bookmark.entity";
import { blogCommentsEntity } from "./comment.entity";
import { BlogCategoryEntity } from "./blogCategory.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.blog)
export class BlogEntity extends BaseEntity {
    @Column()
    title: string;
    @Column()
    description: string;
    @Column()
    content: string;
    @Column()
    time_for_study: string;
    @Column({ unique: true })
    slug: string;
    @Column({ nullable: true })
    image: string;
    @Column()
    authorId: number;
    @ManyToOne(() => UserEntity, user => user.blogs, { onDelete: "CASCADE" })
    author: UserEntity;
    // @Column()
    // likesId: number;
    // @Column()
    // bookmarksId: number;
    @Column({ default: BlogStatus.draft })
    status: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @OneToMany(() => BlogLikesEntity, like => like.blog)
    likes: BlogLikesEntity[];
    @OneToMany(() => BlogBookmarkEntity, bookmark => bookmark.blog)
    bookmarks: BlogBookmarkEntity[];
    @OneToMany(() => blogCommentsEntity, comment => comment.blog)
    comments: blogCommentsEntity[];
    @OneToMany(() => BlogCategoryEntity, categories => categories.blog)
    categories: BlogCategoryEntity[];
}
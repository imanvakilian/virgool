import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.blogComments)
export class blogCommentsEntity extends BaseEntity {
    @Column()
    text: string;
    @Column({ default: true })
    accepted: boolean;
    @CreateDateColumn()
    created_at: Date;
    @Column()
    userId: number;
    @Column()
    blogId: number;
    @Column({nullable: true})
    parentId: number;
    @ManyToOne(() => UserEntity, user => user.blog_comments, { onDelete: "CASCADE" })
    user: UserEntity;
    @ManyToOne(() => BlogEntity, blog => blog.comments, { onDelete: "CASCADE" })
    blog: BlogEntity;
    @ManyToOne(() => blogCommentsEntity, comment => comment.children, { onDelete: "CASCADE" })
    parent: blogCommentsEntity;
    @OneToMany(() => blogCommentsEntity, comment => comment.parent)
    @JoinColumn({ name: "parentId" })
    children: blogCommentsEntity[];
} 
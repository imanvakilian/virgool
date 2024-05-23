import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { ProfileEntity } from "../../profile/entities/profile.entity";
import { OtpEntity } from "./otp.entity";
import { BlogLikesEntity } from "src/modules/blog/entities/like.entity";
import { BlogBookmarkEntity } from "src/modules/blog/entities/bookmark.entity";
import { blogCommentsEntity } from "src/modules/blog/entities/comment.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";
import { ImageEntity } from "src/modules/image/entities/image.entity";
import { roles } from "src/common/enums/role.enum";
import { FollowEntity } from "./follow.entity";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
    @Column({ unique: true, nullable: true })
    username: string;
    @Column({ unique: true, nullable: true })
    mobile: string;
    @Column({ unique: true, nullable: true })
    email: string;
    @Column({ nullable: true })
    password: string;
    @Column({ type: "numeric", default: 0 })
    balance: number;
    @Column({ nullable: true })
    new_email: string;
    @Column({ nullable: true })
    new_mobile: string;
    @Column({ default: false })
    verify_email: boolean;
    @Column({ default: false })
    isBlocked: boolean;
    @Column({ default: false })
    verify_mobile: boolean;
    @Column({ default: roles.user, enum: roles })
    role: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column({ nullable: true })
    profileId: number;
    @Column({ nullable: true })
    otpId: number;
    @OneToOne(() => ProfileEntity, profile => profile.user)
    @JoinColumn({ name: "profileId" })
    profile: ProfileEntity;
    @OneToOne(() => OtpEntity, otp => otp.user)
    @JoinColumn({ name: "otpId" })
    otp: OtpEntity;
    // @Column({ nullable: true })
    // blog_likesId: number;
    @OneToMany(() => BlogLikesEntity, like => like.user)
    blog_likes: BlogLikesEntity[];
    // @Column({ nullable: true })
    // blog_bookmarksId: number;
    @OneToMany(() => BlogBookmarkEntity, bookmark => bookmark.user)
    blog_bookmarks: BlogBookmarkEntity[];
    @OneToMany(() => blogCommentsEntity, comment => comment.user)
    blog_comments: blogCommentsEntity[];
    @OneToMany(() => BlogEntity, blog => blog.author)
    blogs: BlogEntity[];
    @OneToMany(() => ImageEntity, image => image.user)
    images: ImageEntity[];
    @OneToMany(() => FollowEntity, follow => follow.following)
    followers: FollowEntity[];
    @OneToMany(() => FollowEntity, follow => follow.follower)
    followings: FollowEntity[];
}
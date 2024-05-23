import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityName.follow)
export class FollowEntity extends BaseEntity {
    @Column()
    followerId: number;
    @Column()
    followingId: number;
    @ManyToOne(() => UserEntity, user => user.followings, { onDelete: "CASCADE" })
    follower: UserEntity;
    @ManyToOne(() => UserEntity, user => user.followers, { onDelete: "CASCADE" })
    following: UserEntity;
}
import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";

@Entity(EntityName.Profile)
export class ProfileEntity extends BaseEntity {
    @Column({ nullable: true })
    nick_name: string;
    @Column({ nullable: true })
    bio: string;
    @Column({ nullable: true })
    profile_image: string;
    @Column({ nullable: true })
    gender: string;
    @Column({ nullable: true })
    background_image: string;
    @Column({ nullable: true })
    birthday: Date;
    @Column({ nullable: true })
    linkedin_account: string;
    @Column({ nullable: true })
    x_account: string;
    @Column()
    userId: number;
    @OneToOne(() => UserEntity, user => user.profile, { onDelete: "CASCADE" })
    user: UserEntity;
}
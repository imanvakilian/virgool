import { BaseEntity } from "src/common/abstracts/baseEntity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { AfterLoad, Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";

@Entity(EntityName.image)
export class ImageEntity extends BaseEntity {
    @Column()
    name: string;
    @Column()
    url: string;
    @Column()
    alt: string;
    @CreateDateColumn()
    created_at: Date;
    @Column()
    userId: number;
    @ManyToOne(() => UserEntity, user => user.images, { onDelete: "CASCADE" })
    user: UserEntity;
    @AfterLoad()
    map() {
        this.url = `http://localhost:3000/${this.url}`
    }
}

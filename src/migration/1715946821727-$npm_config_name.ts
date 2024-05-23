import { EntityName } from "src/common/enums/entity.enum";
import { roles } from "src/common/enums/role.enum";
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class $npmConfigName1715946821727 implements MigrationInterface {
    // name = ' $npmConfigName1715946821727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: EntityName.User,
                columns: [
                    { name: "id", isPrimary: true, type: "serial", isNullable: false },
                    { name: "username", type: "varchar(50)", isUnique: true, isNullable: true },
                    { name: "mobile", type: "varchar(11)", isUnique: true, isNullable: true },
                    { name: "email", type: "varchar(100)", isUnique: true, isNullable: true },
                    { name: "password", type: "varchar(30)", isNullable: true },
                    { name: "new_email", type: "varchar(100)", isNullable: true },
                    { name: "new_mobile", type: "varchar(11)", isNullable: true },
                    { name: "role", type: "enum", enum: [roles.user, roles.admin], isNullable: true },
                    { name: "verify_mobile", type: "boolean", default: false },
                    { name: "verify_email", type: "boolean", default: false },
                    { name: "isBlocked", type: "boolean", default: false },
                    { name: "profileId", type: "int", isNullable: true },
                    { name: "created_at", type: "timestamp", default: "now()" },
                ]
            }), true
        )
        // const balance = await queryRunner.hasColumn(EntityName.User, "balance");
        // if (!balance) await queryRunner.addColumn(EntityName.User,
        //     // @ts-ignore
        //     { name: "balance", type: "numeric", default: 0 }
        // );
        const username = await queryRunner.hasColumn(EntityName.User, "username");
        if (username) {
            await queryRunner.changeColumn(EntityName.User, "username", new TableColumn({
                name: "username",
                type: "varchar(50)",
                isUnique: true,
                isNullable: false,
            }))
        }
        // await queryRunner.query(`ALTER TABLE user RENAME COLUMN phone TO mobile`);

        await queryRunner.createTable(new Table({
            name: EntityName.Profile,
            columns: [
                { name: "id", type: "int", isUnique: true, isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "nick_name", type: "varchar(50)", isNullable: false },
                { name: "userId", type: "int", isNullable: false },
            ]
        }), true)

        await queryRunner.createTable(new Table({
            name: EntityName.blog,
            columns: [
                { name: "id", type: "int", isUnique: true, isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "title", type: "varchar(50)", isNullable: false },
                { name: "description", type: "varchar(20)", isNullable: false },
                { name: "content", type: "text", isNullable: false },
                { name: "userId", type: "int", isNullable: false },
            ]
        }), true)
        await queryRunner.createForeignKey(EntityName.Profile, new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: EntityName.User,
            onDelete: "CASCADE",
        }))
        await queryRunner.createForeignKey(EntityName.User, new TableForeignKey({
            columnNames: ["profileId"],
            referencedColumnNames: ["id"],
            referencedTableName: EntityName.Profile,
        }))
        await queryRunner.createForeignKey(EntityName.blog, new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: EntityName.User,
            onDelete: "CASCADE",
        }))

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.dropColumn(EntityName.User, "balance");
        const user = await queryRunner.getTable(EntityName.User);
        const profile = await queryRunner.getTable(EntityName.Profile);
        const blog = await queryRunner.getTable(EntityName.blog);
        if (profile) {
            const userProfileFK = profile.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (userProfileFK) await queryRunner.dropForeignKey(EntityName.Profile, userProfileFK);
        }
        if (user) {
            const profileUserFK = user.foreignKeys.find(fk => fk.columnNames.indexOf("profileId") !== -1);
            if (profileUserFK) await queryRunner.dropForeignKey(EntityName.User, profileUserFK);
        }
        if (blog) {
            const userBlogFK = blog.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (userBlogFK) await queryRunner.dropForeignKey(EntityName.blog, userBlogFK);
        }
        await queryRunner.dropTable(EntityName.User, true);
        await queryRunner.dropTable(EntityName.Profile, true);
        await queryRunner.dropTable(EntityName.blog, true);
    }

}

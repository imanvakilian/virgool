import { config } from "dotenv";
import { DataSource } from "typeorm";
config()
const {  DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME, DB_DATABASE } = process.env;

let dataSource = new DataSource({
    type: "postgres",
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: +DB_PORT,
    host: DB_HOST,
    synchronize: false,
    entities: [
        "dist/**/**/**/*.entity{.ts,.js}",
        "dist/**/**/*.entity{.ts,.js}",
    ],
    migrations: [
        "dist/migration/*{.ts,.js}",
    ],
    migrationsTableName: "vrigool_migration_db"
})

export default dataSource;
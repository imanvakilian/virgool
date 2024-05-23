import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function initTypeORM(): TypeOrmModuleOptions {
    const { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USERNAME,DB_PORT } = process.env;
    return {
        type: "postgres",
        host: DB_HOST,
        port: DB_PORT,
        username: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        entities: [
            "dist/**/**/**/*.entity{.ts,.js}",
            "dist/**/**/*.entity{.ts,.js}",
        ],
        synchronize: false,
    }
}
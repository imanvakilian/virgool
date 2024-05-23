namespace NodeJS {
    interface ProcessEnv {
        // application
        PORT: number,
        // database
        DB_USERNAME: string,
        DB_PASSWORD: string,
        DB_HOST: string,
        DB_PORT: number,
        DB_DATABASE: string,
        // secrets
        COOKIE_SECRET: string,
        OTP_JWT_SECRET: string,
        ACCESSTOKEN_JWT_SECRET: string,
        EMAIL_JWT_SECRET: string,
        MOBILE_JWT_SECRET: string,
        GOOGLE_CLIENT_ID: string,
        GOOGLE_CLIENT_SECRET: string,
    }
}
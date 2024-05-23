import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function initSwagger(app: INestApplication) {
    const document = new DocumentBuilder()
        .setTitle("Virgool")
        .setDescription("the backend of virgool")
        .addBearerAuth(addBearerAuth(), "Authorization")
        .setVersion("v0.0.1")
        .build();

    const makeDocument = SwaggerModule.createDocument(app, document);
    SwaggerModule.setup("/swagger", app, makeDocument);
}
    
function addBearerAuth(): SecuritySchemeObject {
    return {
        type: "http",
        bearerFormat: "JWT",
        in: "header",
        scheme: "bearer",
    }
}
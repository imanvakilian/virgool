import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { initSwagger } from './config/swagger.config';
import * as cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets("public");
  app.useGlobalPipes(new ValidationPipe())
  app.use(cookieParser(process.env.COOKIE_SECRET));
  initSwagger(app);
  const { PORT } = process.env;
  await app.listen(PORT, () => {
    console.log(`server run > http://localhost:${PORT}`)
    console.log(`swagger > http://localhost:${PORT}/swagger`)
  })
}
bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { initTypeORM } from 'src/config/typeorm.config';
import { CategoryModule } from '../category/category.module';
import { ProfileModule } from '../profile/profile.module';
import { BlogModule } from '../blog/blog.module';
import { ImageModule } from '../image/image.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env")
    }),
    TypeOrmModule.forRoot(initTypeORM()),
    AuthModule,
    CategoryModule,
    ProfileModule,
    BlogModule,
    ImageModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

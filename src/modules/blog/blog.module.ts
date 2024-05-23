import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CategoryService } from '../category/category.service';
import { CategoryModule } from '../category/category.module';
import { BlogCategoryEntity } from './entities/blogCategory.entity';
import { BlogLikesEntity } from './entities/like.entity';
import { BlogBookmarkEntity } from './entities/bookmark.entity';
import { BlogCommentController } from './controllers/comment.controller';
import { BlogCommentService } from './services/comment.service';
import { blogCommentsEntity } from './entities/comment.entity';
import { AddReqUserWOA } from 'src/common/middlewares/addReqUserWOA.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogEntity,
      BlogCategoryEntity,
      BlogLikesEntity,
      BlogBookmarkEntity,
      blogCommentsEntity,
    ]),
    AuthModule,
    CategoryModule
  ],
  controllers: [BlogController, BlogCommentController],
  providers: [BlogService, CategoryService, BlogCommentService],
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddReqUserWOA).forRoutes("/blog/by-slug/:slug");
  }
}

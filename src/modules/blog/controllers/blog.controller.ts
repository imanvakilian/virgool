import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsuments } from 'src/common/enums/swaggerConsumns.enum';
import { CreateBlogDto, SearchBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { AuthGuard } from '../../auth/guard/accessToken.guard';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/index.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { searchBlog } from 'src/common/decorators/searchBlog.decorator';
import { rolePermission } from 'src/common/decorators/role.decorator';
import { roles } from 'src/common/enums/role.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@Controller('blog')
@ApiTags("Blog")
@ApiBearerAuth("Authorization")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) { }
  @Post('/')
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get('/my')
  myBlogs() {
    return this.blogService.myBlogs();
  }

  @Get('/')
  @Pagination()
  @searchBlog()
  @SkipAuth()
  find(@Query() paginationDto: PaginationDto, @Query() searchBlogDto: SearchBlogDto) {
    return this.blogService.find(paginationDto, searchBlogDto);
  }

  @Delete('/:id')
  // @rolePermission(roles.admin)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }

  @Put('/:id')
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  update(@Param('id', ParseIntPipe) id: number,@Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Get('/like/:id')
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  likeToggle(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id);
  }

  @Get('/bookmark/:id')
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  bookmarkToggle(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.bookmarkToggle(id);
  }

  @Get('/by-slug/:slug')
  @Pagination()
  @SkipAuth()
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  findBySlug(@Param('slug') slug: string,@Query() paginationDto: PaginationDto) {
    return this.blogService.findBySlug(slug, paginationDto);
  }

}

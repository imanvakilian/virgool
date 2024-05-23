import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guard/accessToken.guard";
import { BlogCommentService } from "../services/comment.service";
import { SwaggerConsuments } from "src/common/enums/swaggerConsumns.enum";
import { CreateCommentDto } from "../dto/comment.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/index.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";

@Controller()
@ApiTags("Blog")
@AuthDecorator()
export class BlogCommentController {
    constructor(private readonly blogCommentService: BlogCommentService) { }

    @Post("/comment")
    @ApiConsumes(SwaggerConsuments.UrlEncoded)
    createComment(@Body() createCommentDto: CreateCommentDto) {
        return this.blogCommentService.createComment(createCommentDto);
    }

    @Get("/comment")
    @Pagination()
    @ApiConsumes(SwaggerConsuments.UrlEncoded)
    find(@Query() paginationDto: PaginationDto) {
        return this.blogCommentService.find(paginationDto);
    }

    @Patch("/comment/accept")
    @ApiConsumes(SwaggerConsuments.UrlEncoded)
    @ApiQuery({ name: "id" })
    accept(@Query("id", ParseIntPipe) id: number) {
        return this.blogCommentService.accept(id);
    }

    @Patch("/comment/reject")
    @ApiQuery({ name: "id" })
    @ApiConsumes(SwaggerConsuments.UrlEncoded)
    reject(@Query("id", ParseIntPipe) id: number) {
        return this.blogCommentService.reject(id);
    }
}
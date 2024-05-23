import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateCommentDto } from "../dto/comment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { blogCommentsEntity } from "../entities/comment.entity";
import { Repository } from "typeorm";
import { BlogService } from "./blog.service";
import { badRequestMessage, NotFoundMessage, publicMessage } from "src/common/messages/public.message";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { PaginationDto } from "src/common/dtos/index.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
    constructor(
        @InjectRepository(blogCommentsEntity) private blogCommentRepositroy: Repository<blogCommentsEntity>,
        @Inject(forwardRef(() => BlogService)) private blogService: BlogService,
        @Inject(REQUEST) private req: Request,
    ) { }
    async createComment(createCommentDto: CreateCommentDto) {
        const { text, parentId, blogId } = createCommentDto;
        await this.blogService.findoneBlog(+blogId);
        const { id: userId } = this.req.user;
        let parent = null;
        if (parentId) {
            parent = await this.findOne(parentId);
            if (parent.parentId) throw new BadRequestException()
        }
        await this.blogCommentRepositroy.insert({ blogId, text, userId, parentId });
        return {
            message: publicMessage.created,
        }
    }

    async findOne(id: number) {
        const comment = await this.blogCommentRepositroy.findOneBy({ id });
        if (!comment) throw new NotFoundException(NotFoundMessage.comment);
        return comment;
    }

    async find(paginationDto: PaginationDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        const [comments, count] = await this.blogCommentRepositroy.findAndCount({
            where: {},
            relations: {
                blog: true,
                user: {
                    profile: true,
                },
                parent: true,
            },
            select: {
                blog: {
                    id: true,
                    slug: true,
                },
                user: {
                    username: true,
                    profile: {
                        nick_name: true,
                    }
                }
            },
            take: limit,
            skip,
        })
        return {
            pagination: paginationGenerator(page, limit, count),
            comments
        }
    }

    async findForBlog(blogId: number, paginationDto: PaginationDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        const [comments, count] = await this.blogCommentRepositroy.findAndCount({
            where: {
                blogId,
                parentId: null,
            },
            relations: {
                user: {
                    profile: true,
                },
                children: true,
            },
            select: {
                user: {
                    username: true,
                    profile: {
                        nick_name: true,
                    }
                },
                children: {
                    children: false,
                }
            },
            take: limit,
            skip,
        })
        return {
            pagination: paginationGenerator(page, limit, count),
            comments
        }
    }

    async accept(id: number) {
        const comment = await this.findOne(id);
        if (comment.accepted) throw new BadRequestException(badRequestMessage.alreadyAcceptedComment);
        comment.accepted = true;
        await this.blogCommentRepositroy.save(comment);
        return {
            message: publicMessage.updated,
        }
    }

    async reject(id: number) {
        const comment = await this.findOne(id);
        if (!comment.accepted) throw new BadRequestException(badRequestMessage.alreadyRejectedComment);
        comment.accepted = false;
        await this.blogCommentRepositroy.save(comment);
        return {
            message: publicMessage.updated,
        }
    }
}
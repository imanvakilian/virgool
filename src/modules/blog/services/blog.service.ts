import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateBlogDto, SearchBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { createSlug, randomId } from 'src/common/utils/functions.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { NotFoundMessage, publicMessage } from 'src/common/messages/public.message';
import { PaginationDto } from 'src/common/dtos/index.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.util';
import { isArray } from 'class-validator';
import { CategoryService } from '../../category/category.service';
import { BlogCategoryEntity } from '../entities/blogCategory.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BlogLikesEntity } from '../entities/like.entity';
import { BlogBookmarkEntity } from '../entities/bookmark.entity';
import { BlogCommentService } from './comment.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        @InjectRepository(BlogCategoryEntity) private blogCategoryRepository: Repository<BlogCategoryEntity>,
        @Inject(REQUEST) private req: Request,
        private categoryService: CategoryService,
        private blogCommentService: BlogCommentService,
        @InjectRepository(BlogLikesEntity) private blogLikesRepository: Repository<BlogLikesEntity>,
        @InjectRepository(BlogBookmarkEntity) private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
        private dataSource: DataSource,
    ) { }

    async create(createBlogDto: CreateBlogDto) {
        let { title, slug, description, content, image, time_for_study, categories } = createBlogDto;
        const slugData = slug ?? title;
        slug = createSlug(slugData);
        if (categories && !isArray(categories)) {
            if (categories.length == 1) categories = [categories];
            else categories = categories.split(',');
        }
        const isExist = await this.checkExistBlogBySlug(slug);
        if (isExist) slug = `${slug}_${randomId()}`;
        const user = this.req.user;
        const blog = this.blogRepository.create({
            title,
            slug,
            description,
            content,
            image,
            time_for_study,
            authorId: user.id,
        })
        await this.blogRepository.save(blog);
        if (categories) {
            for (const item of categories) {
                let category = await this.categoryService.findOneByTitle(item);
                if (!category) {
                    category = await this.categoryService.createCategoryForBlog(item);
                }
                await this.createBlogCategory(category.id, blog.id);
            }
        }
        return {
            message: publicMessage.created,
        }
    }

    myBlogs() {
        const { id } = this.req.user;
        return this.blogRepository.find({
            where: { authorId: id },
            order: { id: "DESC" },
        })
    }

    async find(paginationDto: PaginationDto, searchBlogDto: SearchBlogDto) {
        const { limit, page, skip } = paginationSolver(paginationDto);
        let { category, search } = searchBlogDto;

        // let where: FindOptionsWhere<BlogEntity> = {};
        // if (category) {
        //     where["categories"] = {
        //         category: {
        //             title: category,
        //         }
        //     };
        // }
        // const [blogs, count] = await this.blogRepository.findAndCount({
        //     relations: {
        //         categories: {
        //             category: true,
        //         }
        //     },
        //     where,
        //     take: limit,
        //     skip,
        //     select: {
        //         categories: {
        //             id: true,
        //             category: {
        //                 title: true,
        //             }
        //         }
        //     }
        // });

        let where = '';
        if (category) {
            if (where.length > 1) where += ' AND ';
            // where += 'category.title ILIKE :category';
            where += 'category.title = :category';
        }
        if (search) {
            if (where.length > 1) where += ' AND ';
            search = `%${search}%`
            where += 'CONCAT(blog.title, blog.description, blog.content) ILIKE :search'
        }
        const [blogs, count] = await this.blogRepository.createQueryBuilder(EntityName.blog)
            .leftJoin("blog.categories", "categories")
            .leftJoin("categories.category", "category")
            .leftJoin("blog.author", "author")
            .leftJoin("author.profile", "profile")
            .addSelect(["categories.id", "category.title"])
            .addSelect(["author.id", "author.username", "profile.nick_name"])
            .orderBy("blog.id", "DESC")
            .where(where, { category, search })
            .take(limit)
            .skip(skip)
            .loadRelationCountAndMap("blog.likes", "blog.likes")
            .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
            .loadRelationCountAndMap("blog.comments", "blog.comments", "comments", qb => qb.where("comments.accepted = :accepted", { accepted: true }))
            .getManyAndCount();
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            const suggestBlogs = await queryRunner.query(`
                WITH suggested_blogs AS (
                    SELECT 
                        blog.id,
                        blog.slug,
                        blog.title,
                        blog.description,
                        blog.time_for_study,
                        blog.image,
                        json_build_object(
                            'username', u.username,
                            'author_name', p.nick_name,
                            'image', p.image_profile
                        ) AS author,
                        array_agg(DISTINCT cat.title) AS categories,
                        (
                            SELECT COUNT(*) FROM blog_likes
                            WHERE blog_likes."blogId" = blog.id
                        ) AS likes,
                        (
                            SELECT COUNT(*) FROM blog_bookmarks
                            WHERE blog_bookmarks."blogId" = blog.id
                        ) AS bookmarks,
                        (
                            SELECT COUNT(*) FROM blog_comments
                            WHERE blog_comments."blogId" = blog.id
                        ) AS comments
                    FROM blog
                    LEFT JOIN public.user u ON blog."authorId" = u.id
                    LEFT JOIN profile p ON p."userId" = u.id
                    LEFT JOIN blog_category bc ON blog.id = bc."blogId"
                    LEFT JOIN category cat ON bc."categoryId" = cat.id
                    GROUP BY blog.id, u.username, p.nick_name, p.image_profile
                    ORDER BY RANDOM()
                    LIMIT 3
    
                )
                SELECT * FROM suggested_blogs
            `);
        return {
            pagination: paginationGenerator(page, limit, count),
            blogs,
            suggestBlogs,
        }
    }

    async delete(id: number) {
        await this.findoneBlog(id);
        await this.blogRepository.delete(id);
        return {
            message: publicMessage.deleted,
        }
    }

    async update(id: number, updateBlogDto: UpdateBlogDto) {
        const blog = await this.findoneBlog(id);
        let { title, description, content, slug, image, time_for_study, categories } = updateBlogDto;
        let slugData = null;
        if (title) {
            blog.title = title;
            slugData = title;
        }
        if (slug) slugData = slug;
        if (slugData) {
            const isExist = await this.checkExistBlogBySlug(slugData);
            if (isExist) slugData += `${randomId()}`;
            blog.slug = createSlug(slugData);
        }
        if (description) blog.description = description;
        if (content) blog.content = content;
        if (image) blog.image = image;
        if (time_for_study) blog.time_for_study = time_for_study;
        if (categories && !isArray(categories)) {
            // await this.blogCategoryRepository.delete({ blogId: blog.id });
            if (categories.length == 1) categories = [categories];
            else categories = categories.split(',');
            for (const item of categories) {
                let category = await this.categoryService.findOneByTitle(item);
                let existBlogCategory;
                if (category) {
                    existBlogCategory = await this.findOneBlogCategory(blog.id, category.id);
                    if (!existBlogCategory) await this.createBlogCategory(blog.id, category.id);
                } else {
                    category = await this.categoryService.createCategoryForBlog(item);
                    await this.createBlogCategory(blog.id, category.id);
                }
            }
        }
        await this.blogRepository.save(blog);
        return {
            message: publicMessage.updated,
        }

    }

    async likeToggle(blogId: number) {
        await this.findoneBlog(blogId);
        const { id: userId } = this.req.user;
        const isLiked = await this.blogLikesRepository.findOneBy({ userId, blogId });
        let message = publicMessage.liked;
        if (isLiked) {
            await this.blogLikesRepository.delete(isLiked);
            message = publicMessage.disliked;
        } else await this.blogLikesRepository.insert({ userId, blogId });
        return {
            message,
        }
    }
    async bookmarkToggle(blogId: number) {
        await this.findoneBlog(blogId);
        const { id: userId } = this.req.user;
        const isBookmarked = await this.blogBookmarkRepository.findOneBy({ userId, blogId });
        let message = publicMessage.bookmarked;
        if (isBookmarked) {
            await this.blogBookmarkRepository.delete(isBookmarked);
            message = publicMessage.disbookmarked;
        } else await this.blogBookmarkRepository.insert({ userId, blogId });
        return {
            message,
        }
    }

    async findBySlug(slug: string, paginationDto: PaginationDto) {
        const userId = this.req?.user?.id;
        const blog = await this.blogRepository.createQueryBuilder(EntityName.blog)
            .leftJoin("blog.categories", "categories")
            .leftJoin("categories.category", "category")
            .leftJoin("blog.author", "author")
            .leftJoin("author.profile", "profile")
            .addSelect(["categories.id", "category.title"])
            .addSelect(["author.id", "author.username", "profile.nick_name"])
            .where({ slug })
            .loadRelationCountAndMap("blog.likes", "blog.likes")
            .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
            .getOne()
        if (!blog) throw new NotFoundException(NotFoundMessage.blog);
        let isLiked = false;
        let isbookmarked = false;
        if (userId) {
            isLiked = !!(await this.blogLikesRepository.findOneBy({ userId, blogId: blog.id }));
            isbookmarked = !!(await this.blogBookmarkRepository.findOneBy({ userId, blogId: blog.id }));
        }
        const { pagination, comments } = await this.blogCommentService.findForBlog(blog.id, paginationDto);
        return {
            blog,
            isLiked,
            isbookmarked,
            commentData: {
                pagination,
                comments
            }
        }
    }
    //=====================================================================================================
    async checkExistBlogBySlug(slug: string) {
        const blog = await this.blogRepository.findOneBy({ slug });
        return !!blog;
    }

    async findoneBlogCategoryByCategory(categoryId: number) {
        const blog = await this.blogCategoryRepository.findOneBy({ categoryId });
        return blog;
    }

    async createBlogCategory(blogId: number, categoryId: number) {
        const blogCategory = this.blogCategoryRepository.create({ categoryId, blogId })
        await this.blogCategoryRepository.save(blogCategory);
        return blogCategory;
    }

    async findoneBlog(id: number) {
        const blog = await this.blogRepository.findOneBy({ id });
        if (!blog) throw new NotFoundException(NotFoundMessage.blog);
        return blog;
    }

    async findOneBlogCategory(blogId: number, categoryId: number) {
        const blogCategory = await this.blogCategoryRepository.findOneBy({ blogId, categoryId });
        return !!blogCategory;
    }
}

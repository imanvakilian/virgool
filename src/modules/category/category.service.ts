import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryMessage } from 'src/common/messages/category.message';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/index.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.util';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const { title, priority } = createCategoryDto;
    await this.checkExistCategoryByTitle(title);
    const category = this.categoryRepository.create({ title, priority });
    await this.categoryRepository.save(category);
    return {
      message: CategoryMessage.created
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto)
    const categories = await this.categoryRepository.findAndCount({
      where: {},
      take: limit,
      skip,
    });
    return [
      paginationGenerator(+paginationDto.page, +limit, +categories[1]),
      categories[0]
    ]
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException(CategoryMessage.notFound);
    return category;
  }

  async findOneByTitle(title: string) {
    const category = await this.categoryRepository.findOneBy({ title });
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { title, priority } = updateCategoryDto;
    const category = await this.findOne(id);
    if (title) category.title = title;
    if (priority) category.priority = priority;
    await this.categoryRepository.save(category);
    return {
      message: CategoryMessage.updated
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.categoryRepository.delete({ id });
    return {
      message: CategoryMessage.deleted
    };
  }

  async checkExistCategoryByTitle(title: string) {
    if (title.trim() == "") throw new BadRequestException(CategoryMessage.emptyTitle);
    const category = await this.categoryRepository.findOneBy({ title });
    if (category) throw new ConflictException(CategoryMessage.conflict);
    return title
  }

  async createCategoryForBlog(title: string) {
    await this.checkExistCategoryByTitle(title);
    const category = this.categoryRepository.create({ title });
    await this.categoryRepository.save(category);
    return category;
  }
}

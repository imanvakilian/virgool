import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateImageDto } from './dto/image';
import { multerFile } from 'src/common/utils/multer.util';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { NotFoundMessage, publicMessage } from 'src/common/messages/public.message';

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private req: Request,
  ) { }
  async create(createImageDto: CreateImageDto, image: multerFile) {
    const { id: userId } = this.req.user;
    const { name, alt } = createImageDto;
    await this.imageRepository.insert({
      name,
      alt: alt || name,
      url: image.path.substring(7),
      userId,
    })
    return {
      message: publicMessage.created,
    }
  }

  findAll() {
    const { id: userId } = this.req.user;
    return this.imageRepository.find({
      where: { userId }
    })
  }

  async findOne(id: number) {
    const { id: userId } = this.req.user;
    const image = await this.imageRepository.findOneBy({ id, userId });
    if(!image) throw new NotFoundException(NotFoundMessage.notFound)
      return image; 
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    await this.imageRepository.remove(image);
    return {
      message: publicMessage.deleted,
    }
  }
}

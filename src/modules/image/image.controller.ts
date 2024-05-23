import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/image';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { uploadFile } from 'src/common/interceptors/uploadFile.interseptor';
import { multerFile } from 'src/common/utils/multer.util';
import { SwaggerConsuments } from 'src/common/enums/swaggerConsumns.enum';

@Controller('image')
@ApiTags("Image")
@AuthDecorator()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseInterceptors(uploadFile("image"))
  @ApiConsumes(SwaggerConsuments.multipartFormData)
  create(@Body() createImageDto: CreateImageDto, @UploadedFile() image: multerFile) {
    return this.imageService.create(createImageDto, image);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.remove(id);
  }
}

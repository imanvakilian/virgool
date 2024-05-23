import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { SwaggerConsuments } from 'src/common/enums/swaggerConsumns.enum';
import { rolePermission } from 'src/common/decorators/role.decorator';
import { roles } from 'src/common/enums/role.enum';

@Controller('user')
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post("/:followingId")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  followToggle(@Param("followingId", ParseIntPipe) followingId: number) {
    return this.userService.followToggle(followingId);
  }

  @Get("/followers")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  showFollowers() {
    return this.userService.showFollowers();
  }

  @Get("/followings")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  showFollowings() {
    return this.userService.showFollowings();
  }

  @Get("/blockUser/:id")
  @rolePermission(roles.admin)
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  blockUserToggle(@Param("id", ParseIntPipe) id: number) {
    return this.userService.blockUserToggle(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

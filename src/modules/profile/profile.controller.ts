import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, ParseFilePipe, Res } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ChangeEmailDto, ChangeMobileDto, ChangeUsernameDto, UserProfileDto } from './dto/profile.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsuments } from 'src/common/enums/swaggerConsumns.enum';
import { AuthGuard } from '../auth/guard/accessToken.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { multerDestination, multerFilename, multerStorage } from '../../common/utils/multer.util';
import { TuploadProfileFile } from './types/profile.types';
import { uploadedOptionalFiles } from 'src/common/decorators/uplodedFiles.decorator';
import { Response } from 'express';
import { CheckOtpDto } from '../auth/dto/auth.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@Controller('profile')
@ApiTags("Profile")
@AuthDecorator()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post()
  @ApiConsumes(SwaggerConsuments.multipartFormData)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: "profile_image", maxCount: 1 },
      { name: "background_image", maxCount: 1 },
    ], {
    storage: multerStorage("user-profile"),
  }
  ))
  changeProfile(
    @uploadedOptionalFiles() file: TuploadProfileFile,
    @Body() userProfileDto: UserProfileDto
  ) {
    return this.profileService.changeProfile(file, userProfileDto);
  }

  @Get()
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  showUserProfile() {
    return this.profileService.showUserProfile();
  }

  @Patch("/change-email")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  changeEmail(@Body() changeEmailDto: ChangeEmailDto, @Res() res: Response) {
    return this.profileService.changeEmail(changeEmailDto.email, res);
  }

  @Post("/verify-change-email")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  verifyChangeEmail(@Body() checkOtpDto: CheckOtpDto) {
    return this.profileService.verifyChangeEmail(checkOtpDto.code);
  }

  @Patch("/change-mobile")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  changeMobile(@Body() changeMobileDto: ChangeMobileDto, @Res() res: Response) {
    return this.profileService.changeMobile(changeMobileDto.mobile, res);
  }

  @Post("/verify-change-mobile")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  verifyChangeMobile(@Body() checkOtpDto: CheckOtpDto) {
    return this.profileService.verifyChangeMobile(checkOtpDto.code);
  }

  @Patch("/change-username")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  changeUsername(@Body() changeUsernameDto: ChangeUsernameDto) {
    return this.profileService.changeUsername(changeUsernameDto.username);
  }

}

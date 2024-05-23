import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto, CheckOtpDto } from '../dto/auth.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsuments } from 'src/common/enums/swaggerConsumns.enum';
import { Request, Response } from 'express';
import { cookieName } from 'src/common/enums/cookie.enum';
import { AuthGuard } from '../guard/accessToken.guard';

@Controller('auth')
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/user-existence")
  @ApiConsumes(SwaggerConsuments.UrlEncoded)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {

    return this.authService.userExistence(authDto, res);
  }

  @Post('/check-otp')
  @ApiConsumes(SwaggerConsuments.UrlEncoded, SwaggerConsuments.json)
  checkOtp(@Body() checkOtp: CheckOtpDto) {
    return this.authService.checkOtp(checkOtp)
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth("Authorization")
  checkAccessToken(@Req() req: Request) {
    return req.user;
  }
}

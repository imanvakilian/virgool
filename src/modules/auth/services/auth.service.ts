import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { AuthDto, CheckOtpDto } from '../dto/auth.dto';
import { AuthType } from '../enum/authType.enum';
import { AuthMethod } from '../enum/authMethod.enum';
import { isEmail, isMobilePhone, isString } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../../profile/entities/profile.entity';
import { authMessage } from 'src/common/messages/auth.message';
import { randomInt } from 'crypto';
import { OtpEntity } from '../../user/entities/otp.entity';
import { TokenService } from './tokens.service';
import { Request, Response } from 'express';
import { IgoogleService, responseResult } from '../types/auth.types';
import { cookieName } from 'src/common/enums/cookie.enum';
import { REQUEST } from '@nestjs/core';
import { cookiesOption } from 'src/common/utils/coolie.util';
import { randomId } from 'src/common/utils/functions.util';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    private tokenService: TokenService,
    @Inject(REQUEST) private req: Request,
  ) { }

  async userExistence(authDto: AuthDto, res: Response) {
    const { type, username, method } = authDto;
    let result;
    switch (type) {
      case AuthType.register:
        result = await this.register(method, username);
        return this.sendResponse(res, result, cookieName.otp);
      case AuthType.login:
        result = await this.login(method, username);
        return this.sendResponse(res, result, cookieName.otp);
      default:
        throw new UnauthorizedException(authMessage.invalidType);
    }
  }

  async register(method: string, username: string) {
    if (method == AuthMethod.username) throw new UnauthorizedException(authMessage.invalidUsername);
    const validUsername = this.validateUsername(method, username);
    let user = await this.findUserByUsername(method, validUsername);
    if (user) throw new UnauthorizedException(authMessage.conflict);
    user = this.userRepository.create({ [method]: username })
    await this.userRepository.save(user);
    user.username = `m_${user.id}`;
    await this.userRepository.save(user);
    const otp = await this.saveOtp(user.id, method);
    if (otp.method == AuthMethod.email) user.verify_email = true;
    if (otp.method == AuthMethod.mobile) user.verify_mobile = true;
    await this.userRepository.save(user);
    const token = this.tokenService.createOtpToken({ userId: user.id })
    return {
      token,
      code: otp.code,
    }
  }

  async login(method: string, username: string) {
    const validUsername = this.validateUsername(method, username);
    const user = await this.findUserByUsername(method, validUsername);
    if (!user) throw new UnauthorizedException(authMessage.notFound);
    if (method == AuthMethod.email) user.verify_email = false;
    if (method !== AuthMethod.email) user.verify_mobile = false;
    await this.userRepository.save(user);
    const otp = await this.saveOtp(user.id, method);
    if (otp.method == AuthMethod.email) user.verify_email = true;
    if (otp.method == AuthMethod.mobile) user.verify_mobile = true;
    await this.userRepository.save(user);
    const token = this.tokenService.createOtpToken({ userId: user.id })
    return {
      token,
      code: otp.code,
    }
  }

  async sendResponse(res: Response, result: responseResult, cookieName: string) {
    const { token, code } = result;
    res.cookie(cookieName, token, cookiesOption())
    return res.json({
      message: authMessage.otpSent,
      code
    })
  }

  async checkOtp(checkOtp: CheckOtpDto) {
    const { code } = checkOtp;
    const token = this.req?.cookies?.[cookieName.otp];
    if (!token) throw new UnauthorizedException(authMessage.expiredCode);
    const { userId } = this.tokenService.checkOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(authMessage.tryAgain);
    if (otp.expiresIn < new Date()) throw new UnauthorizedException(authMessage.expiredCode);
    if (otp.code !== code) throw new UnauthorizedException(authMessage.expiredCode);
    const accessToken = this.tokenService.createAccessToken({ userId });
    return {
      message: authMessage.loggeIn,
      accessToken,
    };
  }

  validateUsername(method: string, username: string) {
    switch (method) {
      case AuthMethod.email:
        if (isEmail(username)) return username;
        throw new UnauthorizedException(authMessage.invalidUsername);
      case AuthMethod.mobile:
        if (isMobilePhone(username)) return username;
        throw new UnauthorizedException(authMessage.invalidUsername);
      case AuthMethod.username:
        return username;
      default:
        throw new UnauthorizedException(authMessage.invalidUsername);
    }
  }

  async findUserByUsername(method: string, username: string) {
    let query = {};

    if (method == AuthMethod.email) {
      query = { email: username };
    } else if (method == AuthMethod.mobile) {
      query = { mobile: username };
    } else {
      query = { username };
    }
    const user = await this.userRepository.findOneBy(query);
    return user;
  }

  async saveOtp(userId: number, method: string) {
    const code = randomInt(10000, 99999).toString();
    const now = new Date();
    const expiresIn = new Date(Date.now() + (1000 * 60 * 2));
    let otp = await this.otpRepository.findOneBy({ userId });
    if (otp) {
      if (otp.expiresIn > now) throw new BadRequestException(authMessage.badTiming);
      otp.code = code;
      otp.expiresIn = expiresIn;
      otp.method = method;
      await this.otpRepository.save(otp);
    } else {
      otp = this.otpRepository.create({ code, expiresIn, userId, method });
      await this.otpRepository.save(otp);
      await this.userRepository.update({ id: userId }, { otpId: otp.id });
    }
    return otp;
  }

  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.checkAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(authMessage.loginAgain);
    return user;
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(authMessage.notFound);
    return user;
  }

  async googleService(userInformation: IgoogleService) {
    const { email, firstname, lastname } = userInformation;
    let user = await this.userRepository.findOneBy({ email });
    if (!user) {
      user = this.userRepository.create({
        email,
        username: `${email.split("@")[0]}${randomId}`,
        // or
        // username: `${firstname}${lastname}${randomId}`,
        verify_email: true,
      });
      await this.userRepository.save(user);
    }
    const accessToken = this.tokenService.createAccessToken({ userId: user.id });
    // just for create otp and probable privention errors
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + (1000 * 60 * 2));
    await this.otpRepository.insert({ code, expiresIn, method: AuthMethod.email, userId: user.id });
    // ===========
    return {
      accessToken,
    }
  }

}

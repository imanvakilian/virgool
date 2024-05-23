import { BadRequestException, ConflictException, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { ChangeEmailDto, ChangeMobileDto, UserProfileDto } from './dto/profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';
import { isDate } from 'class-validator';
import { UserMessage } from 'src/common/messages/user.message';
import { TuploadProfileFile } from './types/profile.types';
import { AuthService } from '../auth/services/auth.service';
import { TokenService } from '../auth/services/tokens.service';
import { AuthMethod } from '../auth/enum/authMethod.enum';
import { authMessage } from 'src/common/messages/auth.message';
import { cookieName } from 'src/common/enums/cookie.enum';
import { OtpEntity } from '../user/entities/otp.entity';

@Injectable({ scope: Scope.REQUEST })
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private req: Request,
    private authService: AuthService,
    private tokenService: TokenService,
  ) { }

  async changeProfile(file: TuploadProfileFile, userProfileDto: UserProfileDto) {
    const user = this.req?.user;
    userProfileDto.birthday = new Date(userProfileDto.birthday);
    if (file?.profile_image) userProfileDto.profile_image = file?.profile_image?.[0]?.path?.slice(7);
    if (file?.background_image) userProfileDto.background_image = file?.background_image?.[0]?.path?.slice(7);

    const { bio, gender, birthday, nick_name, linkedin_account, x_account, background_image, profile_image } = userProfileDto;
    let profile = await this.profileRepository.findOneBy({ id: user?.profileId });
    if (profile) {
      if (bio) profile.bio = bio;
      if (gender) profile.gender = gender;
      if (birthday && isDate(new Date(birthday))) profile.birthday = birthday;
      if (nick_name) profile.nick_name = nick_name;
      if (linkedin_account) profile.linkedin_account = linkedin_account;
      if (x_account) profile.x_account = x_account;
      if (background_image) profile.background_image = background_image;
      if (profile_image) profile.profile_image = profile_image;
    } else {
      profile = this.profileRepository.create({ bio, gender, birthday, nick_name, linkedin_account, x_account, userId: user.id, background_image, profile_image });
    }
    await this.profileRepository.save(profile);
    if (!user.profileId) user.profileId = profile.id;
    await this.userRepository.save(user);
    return {
      message: UserMessage.changeProfile,
    }
  }

  showUserProfile() {
    return this.userRepository.findOne({
      where: { id: this.req.user.id },
      relations: { profile: true },
    })
  }

  async changeEmail(email: string, res: Response) {
    const { id } = this.req.user;
    const user = await this.userRepository.findOneBy({ email });
    if (user && user.id !== id) throw new ConflictException(UserMessage.conflictEmail);
    if (user && user.id == id) return res.json({ message: UserMessage.mobileChanged });
    this.req.user.new_email = email;
    this.req.user.verify_email = false;
    await this.userRepository.save(this.req.user);
    const otp = await this.authService.saveOtp(id, AuthMethod.email);
    const token = this.tokenService.createEmailToken({ email });
    return this.authService.sendResponse(res, { token, code: otp.code }, cookieName.emailOtp);
  }

  async verifyChangeEmail(code: string) {
    const token = this.req?.cookies?.[cookieName.emailOtp];
    if (!token) throw new UnauthorizedException(authMessage.expiredCode);
    const { email } = this.tokenService.checkEmailToken(token);
    const { id, new_email } = this.req.user;
    if (email !== new_email) throw new UnauthorizedException(authMessage.tryAgain);
    const otp = await this.checkOtp(id, code);
    if (otp.method !== AuthMethod.email) throw new UnauthorizedException(authMessage.tryAgain);
    await this.userRepository.update({ id }, { email, new_email: null, verify_email: true });
    return {
      message: UserMessage.emailChanged,
    }
  }

  async changeMobile(mobile: string, res: Response) {
    const { id } = this.req.user;
    const user = await this.userRepository.findOneBy({ mobile });
    if (user && user.id !== id) throw new ConflictException(UserMessage.conflictMobile);
    if (user && user.id == id) return res.json({ message: UserMessage.mobileChanged });
    this.req.user.new_mobile = mobile;
    this.req.user.verify_mobile = false;
    await this.userRepository.save(this.req.user);
    const otp = await this.authService.saveOtp(id, AuthMethod.mobile);
    const token = this.tokenService.createMobileToken({ mobile });
    return this.authService.sendResponse(res, { token, code: otp.code }, cookieName.mobileOtp);
  }

  async verifyChangeMobile(code: string) {
    const token = this.req?.cookies?.[cookieName.mobileOtp];
    if (!token) throw new UnauthorizedException(authMessage.expiredCode);
    const { mobile } = this.tokenService.checkMobileToken(token);
    const { id, new_mobile } = this.req.user;
    if (mobile !== new_mobile) throw new UnauthorizedException(authMessage.tryAgain);
    const otp = await this.checkOtp(id, code);
    if (otp.method !== AuthMethod.mobile) throw new UnauthorizedException(authMessage.tryAgain);
    await this.userRepository.update({ id }, { mobile, new_mobile: null, verify_mobile: true });
    return {
      message: UserMessage.mobileChanged,
    }
  }

  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(authMessage.tryAgain);
    if (otp.expiresIn < new Date()) throw new UnauthorizedException(authMessage.expiredCode);
    if (otp.code !== code) throw new UnauthorizedException(authMessage.expiredCode);
    return otp
  }

  async changeUsername(username: string) {
    username = username.trim().toLocaleLowerCase();
    username = username.replaceAll(" ", "");
    const { id } = this.req.user;
    const user = await this.userRepository.findOneBy({ username });
    if (user && user.id !== id) throw new ConflictException(UserMessage.conflictUsername);
    await this.userRepository.update({ id }, { username });
    return {
      message: UserMessage.usernameChanged,
    }
  }

}

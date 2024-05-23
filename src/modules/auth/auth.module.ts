import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ProfileEntity } from '../profile/entities/profile.entity';
import { OtpEntity } from '../user/entities/otp.entity';
import { TokenService } from './services/tokens.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from './services/google.service';
import { GoogleAuthController } from './controllers/google.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProfileEntity, OtpEntity]),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, TokenService, JwtService, GoogleStrategy],
  exports: [TypeOrmModule, AuthService, TokenService, JwtService]
})
export class AuthModule { }

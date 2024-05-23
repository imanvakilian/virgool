import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtAccessTokenPayload, jwtEmailTokenPayload, jwtMobileTokenPayload, jwtOtpPayload } from "../types/auth.types";
import { authMessage } from "src/common/messages/auth.message";
import { UserMessage } from "src/common/messages/user.message";

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService) { }

    createOtpToken(payload: jwtOtpPayload) {
        return this.jwtService.sign(payload, { secret: process.env.OTP_JWT_SECRET, expiresIn: "2m" })
    }

    checkOtpToken(token: string): jwtOtpPayload {
        try {
            return this.jwtService.verify(token, { secret: process.env.OTP_JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException(authMessage.tryAgain);
        }
    }

    createAccessToken(payload: jwtAccessTokenPayload) {
        try {
            return this.jwtService.sign(payload, { secret: process.env.ACCESSTOKEN_JWT_SECRET, expiresIn: "30d" });
        } catch (error) {
            throw new UnauthorizedException(authMessage.loginAgain);
        }
    }

    checkAccessToken(token: string) {
        try {
            return this.jwtService.verify(token, { secret: process.env.ACCESSTOKEN_JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException(authMessage.loginAgain);
        }
    }

    createEmailToken(payload: jwtEmailTokenPayload) {
        try {
            return this.jwtService.sign(payload, { secret: process.env.EMAIL_JWT_SECRET, expiresIn: "2m" });
        } catch (error) {
            throw new UnauthorizedException(UserMessage.failedProcess);
        }
    }

    checkEmailToken(token: string) {
        try {
            return this.jwtService.verify(token, { secret: process.env.EMAIL_JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException(UserMessage.failedProcess);
        }
    }

    createMobileToken(payload: jwtMobileTokenPayload) {
        try {
            return this.jwtService.sign(payload, { secret: process.env.MOBILE_JWT_SECRET, expiresIn: "2m" });
        } catch (error) {
            throw new UnauthorizedException(UserMessage.failedProcess);
        }
    }

    checkMobileToken(token: string) {
        try {
            return this.jwtService.verify(token, { secret: process.env.MOBILE_JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException(UserMessage.failedProcess);
        }
    }

}
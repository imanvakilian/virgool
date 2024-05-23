import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { Observable } from "rxjs";
import { authMessage } from "src/common/messages/auth.message";
import { AuthService } from "../services/auth.service";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH } from "src/common/decorators/skip-auth.decorator";
import { badRequestMessage } from "src/common/messages/public.message";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private reflector: Reflector) { }
    async canActivate(context: ExecutionContext) {
        const isSkippedAuth = this.reflector.get<boolean>(SKIP_AUTH, context.getHandler());
        if(isSkippedAuth) return true;
        const req: Request = context.switchToHttp().getRequest<Request>();
        const { authorization } = req.headers;
        if (!authorization || authorization.trim() == "") throw new UnauthorizedException(authMessage.loginAgain);
        const [bearer, token] = authorization.split(" ");
        if (bearer.toLocaleLowerCase() !== "bearer" || !isJWT(token)) throw new UnauthorizedException(authMessage.loginAgain);
        const user = await this.authService.validateAccessToken(token);
        if(user.isBlocked) throw new BadRequestException(badRequestMessage.youBlocked);
        req.user = user;
        return true;
    }
}
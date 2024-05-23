import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { isJWT } from "class-validator";
import { AuthService } from "src/modules/auth/services/auth.service";

@Injectable()
export class AddReqUserWOA implements NestMiddleware {
    constructor(private authService: AuthService) { }
    async use(req: Request, res: Response, next: NextFunction) {
        const { authorization } = req?.headers;
        if (!authorization || authorization?.trim() == "") return next();
        const [bearer, token] = authorization?.split(" ");
        if (bearer?.toLocaleLowerCase() !== "bearer" || !isJWT(token)) return next();
        try {
            req.user = await this.authService.validateAccessToken(token);
        } catch (error) {
            console.log(error);
        }
        next();
    }
}
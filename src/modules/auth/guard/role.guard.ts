import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { roleKey } from "src/common/decorators/role.decorator";
import { roles } from "src/common/enums/role.enum";

@Injectable()
export class RolePermission implements CanActivate {
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext) {
        const isSkippedRole = this.reflector.getAllAndOverride<roles[]>(
            roleKey, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!isSkippedRole || isSkippedRole.length == 0) return true;
        const req: Request = context.switchToHttp().getRequest<Request>();
        const user = req.user;
        const userRole = user?.role ?? roles.user;
        if(userRole == roles.admin) return true;
        if (isSkippedRole.includes(userRole as roles)) return true;
        throw new ForbiddenException()
    }
}
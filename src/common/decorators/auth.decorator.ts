import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guard/accessToken.guard";
import { RolePermission } from "src/modules/auth/guard/role.guard";

export function AuthDecorator() {
    return applyDecorators(
        ApiBearerAuth("Authorization"),
        UseGuards(AuthGuard, RolePermission)
    )
}
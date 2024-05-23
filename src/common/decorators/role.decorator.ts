import { SetMetadata } from "@nestjs/common";
import { roles } from "../enums/role.enum";

export const roleKey = "ROLES";

export const rolePermission = (...roles: roles[]) => SetMetadata(roleKey, roles)
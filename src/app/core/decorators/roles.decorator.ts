// ================================================================>> Core Library
import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "src/app/enums/role.enum";

export const RolesDecorator = (...roles: RoleEnum[]) => SetMetadata('roles', roles)
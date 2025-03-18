
import { ForbiddenException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RoleEnum } from 'src/app/enums/role.enum';

@Injectable()
export class VendorMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const userRoles = res.locals.userRoles as { id: RoleEnum; is_default: boolean }[] | undefined;

        if (!userRoles || userRoles.length === 0) {
            throw new UnauthorizedException('Unauthorized: No roles found.');
        }
        const userRole = userRoles.find(role => role.id === RoleEnum.VENDOR);

        if (userRole) {
            res.locals.roleId = RoleEnum.VENDOR;
            userRole.is_default = true;
        } else {
            throw new ForbiddenException('Access denied. You do not have the required permissions to access this route.');
        }
        next();
    }
}

import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  constructor(private readonly allowedRoles: RoleEnum[]) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `You don't have permission to access this resource`,
      );
    }

    next();
  }
}

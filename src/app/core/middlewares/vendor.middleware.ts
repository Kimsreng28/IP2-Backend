import { Injectable } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { RoleMiddleware } from './role.middleware';

@Injectable()
export class VendorMiddleware extends RoleMiddleware {
  constructor() {
    super([RoleEnum.VENDOR]);
  }
}

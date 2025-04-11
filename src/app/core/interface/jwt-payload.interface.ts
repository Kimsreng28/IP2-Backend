import { RoleEnum } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  avatar: string;
  role: RoleEnum;
}

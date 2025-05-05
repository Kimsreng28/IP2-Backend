import { RoleEnum } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  email: string;
  avatar: string;
  role: RoleEnum;
}

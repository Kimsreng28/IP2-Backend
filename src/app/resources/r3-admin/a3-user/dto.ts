import { RoleEnum, StatusEnum } from "@prisma/client";

export class CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: RoleEnum;
  avatar?: string;
  email_verified?: boolean;
  status?: StatusEnum;
}

export class UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  status?: StatusEnum;
}
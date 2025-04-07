import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CompleteResetDto {
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  confirmedPassword: string;
}

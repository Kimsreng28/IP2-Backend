import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class CompleteResetDto {
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  confirmedPassword: string;
}

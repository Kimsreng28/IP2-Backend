import { IsNotEmpty, IsString } from 'class-validator';

export class UploadAvatarDto {
  @IsString()
  @IsNotEmpty()
  avatar: string;
}

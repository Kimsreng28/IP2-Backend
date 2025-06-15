
import { IsBoolean } from 'class-validator';

export class LikeQuestionDto {
  @IsBoolean()
  like: boolean;
}


import { IsString, MinLength } from 'class-validator';

export class CreateQuestionCommentDto {
  @IsString()
  @MinLength(1)
  comment: string;
}

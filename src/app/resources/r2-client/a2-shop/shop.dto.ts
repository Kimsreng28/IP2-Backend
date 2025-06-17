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

// wishlist.dto.ts
import { IsNumber } from 'class-validator';

export class ToggleWishlistDto {
  @IsNumber()
  productId: number;
}

export class WishlistResponseDto {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string | null;
  created_at: Date;
}

// cart.dto.ts
import { IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CartItemResponseDto {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  stock: number;
}

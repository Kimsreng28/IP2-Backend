import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @IsNumber()
  @IsNotEmpty()
  brand_id: number;

  @IsBoolean()
  @IsOptional()
  is_new_arrival?: boolean;

  @IsBoolean()
  @IsOptional()
  is_best_seller?: boolean;
}
export class UpdateProductDto extends CreateProductDto{}
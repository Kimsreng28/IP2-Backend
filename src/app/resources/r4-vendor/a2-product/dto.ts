import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    price: number

    @IsNumber()
    @IsPositive()
    stock: number

    @IsString()
    @IsNotEmpty()
    brand_id: string

    @IsString()
    @IsNotEmpty()
    category_id: string

    @IsBoolean()
    @IsOptional()
    is_new_arrival?: boolean;

    @IsBoolean()
    @IsOptional()
    is_best_seller?: boolean;
}

export class UpdateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    price: number

    @IsNumber()
    @IsPositive()
    stock: number

    @IsString()
    @IsNotEmpty()
    brand_id: string

    @IsString()
    @IsNotEmpty()
    category_id: string

    @IsBoolean()
    @IsOptional()
    is_new_arrival?: boolean;

    @IsBoolean()
    @IsOptional()
    is_best_seller?: boolean;
}
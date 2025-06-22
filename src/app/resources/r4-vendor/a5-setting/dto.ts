import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateVendorDto {
    @IsString()
    @IsNotEmpty()
    first_name: string

    @IsString()
    @IsNotEmpty()
    last_name: string

    @IsString()
    @IsNotEmpty()
    business_name: string

    @IsString()
    @IsNotEmpty()
    business_phone: string

    @IsEmail()
    business_email: string

    @IsEmail()
    email: string;

}

export class UpdateVendorPasswordDto {
    @IsString()
    old_password: string

    @IsString()
    new_password: string

    @IsString()
    confirm_password: string
}

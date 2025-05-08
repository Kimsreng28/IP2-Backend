// src/profile/dto/create_address.dto.ts
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @Length(1, 255)
  address_line1: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  address_line2?: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(1, 100)
  state: string;

  @IsString()
  @Length(1, 20)
  postal_code: string;

  @IsString()
  @Length(1, 100)
  country: string;

  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be between 10-15 digits',
  })
  phone_number: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

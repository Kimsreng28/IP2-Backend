import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  address_line1?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  address_line2?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  postal_code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  country?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be between 10-15 digits',
  })
  phone_number?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsIn(['billing', 'shipping'])
  type?: 'billing' | 'shipping';
}

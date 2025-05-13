import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto{
    @IsString()
    @IsNotEmpty()
    name: string
}
export class UpdateCategoryDto extends CreateCategoryDto{}

export class CreatePaymentDto {
  order_id: number;
  user_id: number;
  credit_card_id?: number;
  payment_method: string;
  payment_gateway: string;
  transaction_id?: string;
  status?: string;
  amount: number;
}

export class UpdatePaymentDto {
  status?: string;
  transaction_id?: string;
}
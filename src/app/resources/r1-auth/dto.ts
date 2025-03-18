
// ===========================================================================>> Core Library
import { IsNotEmpty, IsString } from 'class-validator';

// ===========================================================================>> Costom Library

export class LoginRequestDto {

    @IsString()
    @IsNotEmpty({ message: "Filed username is required" })
    username: string;

    @IsString()
    @IsNotEmpty({ message: "Filed password is required" })
    password: string;
}
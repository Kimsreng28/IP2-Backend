import { IsNotEmpty, IsString } from "class-validator";

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
    event_name: string

    @IsString()
    @IsNotEmpty()
    event_poster: string

    @IsString()
    @IsNotEmpty()
    start_date: string

    @IsString()
    @IsNotEmpty()
    end_date: string
}

export class UpdateEventDto {
    @IsString()
    @IsNotEmpty()
    event_name: string

    @IsString()
    @IsNotEmpty()
    event_poster: string

    @IsString()
    @IsNotEmpty()
    start_date: string

    @IsString()
    @IsNotEmpty()
    end_date: string
}
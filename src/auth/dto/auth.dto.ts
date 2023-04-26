import { IsNotEmpty, IsEmail, IsString } from "class-validator";

export class AuthDto{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string
}
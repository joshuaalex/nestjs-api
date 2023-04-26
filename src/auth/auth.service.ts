import { Injectable, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConfigService } from '@nestjs/config/dist';
import { AuthDto } from "./dto";
import * as argon from "argon2";

@Injectable()

export class AuthService{
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService){
    }

    async signup(dto : AuthDto){
        // Generate the Hash Password
        const hash= await argon.hash(dto.password);
        try{
        // Save the new user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                hash
            }
        })
        //delete user.hash;
        // return user 
        ///return user;
        return this.singToken(user.id, user.email);
        }catch(error){
            if (error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error;
        }

    };

    async signin(dto : AuthDto){
        // find user by email
        const user  = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        // if user does not exist thhrow and exception
        if (!user) throw new ForbiddenException('Credentials Incorrect');

        // compare the password
        const pwMatches = await argon.verify(user.hash, dto.password);

        //if password incorrect  throw an exception
        if(!pwMatches) throw new ForbiddenException('Credentials Incorrect');

        // send back the user
        return this.singToken(user.id, user.email);
    }

    async singToken(userId: number, email: string, ): Promise<{ access_token: string }>{
        const payload = {
            sub: userId,
            email,
        }
        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });

        return {
            access_token: token,
        };
    }

    
}
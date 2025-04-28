// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Costom Library
import { AuthController } from './controller';
import { AuthService } from './service';

@Module({
    controllers: [AuthController],
    providers: [AuthService]
})

export class AuthModule { }

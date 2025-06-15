import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from 'src/mail/mail.module';

import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { GoogleStrategy } from 'src/app/core/stratagies/google.strategy';
import { JwtStrategy } from 'src/app/core/stratagies/jwt.strategy';
import { FileService } from 'src/app/services/file.service';
import { UserModule } from 'src/app/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    HttpModule,
    UserModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    FileService,
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [JwtStrategy, PassportModule, MailModule],
})
export class AuthModule {}

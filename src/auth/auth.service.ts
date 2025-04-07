import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { CompleteResetDto } from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(
      signupDto.password,
      this.SALT_ROUNDS,
    );

    try {
      // Create user and auth record in a transaction
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            first_name: signupDto.firstName,
            last_name: signupDto.lastName,
            display_name:
              signupDto.displayName ??
              `${signupDto.firstName} ${signupDto.lastName}`,
            email: signupDto.email,
            password: hashedPassword,
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            display_name: true,
          },
        });

        const token = this.generateJwtToken({
          userId: user.id,
          email: user.email,
        });

        await tx.auth.create({
          data: {
            user_id: user.id,
            token,
            is_logged_in: true,
            last_login: new Date(),
          },
        });

        return { user, token };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Unique constraint violation');
        }
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async signin(signinDto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: signinDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      signinDto.password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateJwtToken({ userId: user.id, email: user.email });

    try {
      // Invalidate old sessions and create new one in a transaction
      await this.prisma.$transaction([
        this.prisma.auth.updateMany({
          where: {
            user_id: user.id,
            is_logged_in: true,
          },
          data: {
            is_logged_in: false,
          },
        }),
        this.prisma.auth.create({
          data: {
            user_id: user.id,
            token,
            is_logged_in: true,
            last_login: new Date(),
          },
        }),
      ]);

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name,
        },
        token,
      };
    } catch {
      throw new InternalServerErrorException('Login failed');
    }
  }

  async logout(userId: string) {
    try {
      const updated = await this.prisma.auth.updateMany({
        where: {
          user_id: userId,
          is_logged_in: true,
        },
        data: {
          is_logged_in: false,
        },
      });

      if (updated.count === 0) {
        throw new UnauthorizedException('No active session found');
      }

      return { success: true, message: 'Logged out successfully' };
    } catch {
      throw new UnauthorizedException('Logout failed');
    }
  }

  async checkActiveSession(userId: string, token: string): Promise<boolean> {
    const activeSession = await this.prisma.auth.findFirst({
      where: {
        user_id: userId,
        token: token,
        is_logged_in: true,
      },
    });
    return !!activeSession;
  }

  async requestReset(requestResetDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: requestResetDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    // Generate 6-digit code
    const resetCode = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_code: resetCode,
        reset_code_expires: expiresAt,
      },
    });

    await this.sendResetCodeEmail(user.email, resetCode);

    return { success: true };
  }

  async resendResetCode(requestResetDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: requestResetDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    const currentTime = new Date();

    // If the reset code exists but hasn't expired yet, prevent re-sending the code
    if (user.reset_code_expires && user.reset_code_expires > currentTime) {
      throw new BadRequestException(
        'Reset code is still valid. Please check your email.',
      );
    }

    // Generate a new 6-digit code
    const resetCode = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_code: resetCode,
        reset_code_expires: expiresAt,
      },
    });

    await this.sendResetCodeEmail(user.email, resetCode);

    return { success: true };
  }

  async verifyResetCode(verifyResetDto: VerifyResetDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_code: verifyResetDto.code,
        reset_code_expires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired code');
    }

    return { success: true };
  }

  async completeReset(completeResetDto: CompleteResetDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_code: completeResetDto.code,
        reset_code_expires: { gt: new Date() }, // Ensure the code hasn't expired
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired code');
    }

    // Check if the new password and confirmed password match
    if (completeResetDto.newPassword !== completeResetDto.confirmedPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(
      completeResetDto.newPassword,
      this.SALT_ROUNDS,
    );

    // Update the password and clear reset-related fields
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_code: null,
          reset_code_expires: null, // Clear reset code and expiration time
        },
      }),
      this.prisma.passwordChange.create({
        data: {
          user_id: user.id,
          old_password: user.password, // Storing old password for audit
          new_password: hashedPassword,
        },
      }),
    ]);

    return { success: true };
  }

  private async sendResetCodeEmail(email: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Password Reset Code',
        template: 'reset-code',
        context: {
          code,
          validity: '15 minutes',
        },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new InternalServerErrorException('Failed to send reset code');
    }
  }

  private generateJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '1d', // Token expiration
      secret: process.env.JWT_SECRET,
    });
  }

  async validateUser(payload: JwtPayload) {
    return this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        // Only select necessary fields
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }
}

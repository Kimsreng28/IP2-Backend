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

import { JwtPayload } from 'src/app/core/interface/jwt-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { CompleteResetDto } from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';

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
            avatar: true,
            role: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        });

        const token = this.generateJwtToken({
          userId: user.id,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        });

        await tx.auth.create({
          data: {
            user_id: user.id,
            token,
            is_logged_in: true,
            last_login: new Date(),
          },
        });

        return { user, token, message: 'Registration successful' };
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

    const token = this.generateJwtToken({
      userId: user.id,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    });

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
        message: 'Login successful',
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
        },
        token,
      };
    } catch {
      throw new InternalServerErrorException('Login failed');
    }
  }

  async logout(userId: number) {
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

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        display_name: true,
        avatar: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updateData: any = {
      first_name: updateProfileDto.firstName,
      last_name: updateProfileDto.lastName,
      display_name: updateProfileDto.displayName,
      email: updateProfileDto.email,
      avatar: updateProfileDto.avatar,
    };

    // Handle password change if provided
    if (updateProfileDto.newPassword && updateProfileDto.oldPassword) {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const passwordValid = await bcrypt.compare(
        updateProfileDto.oldPassword,
        user.password,
      );
      if (!passwordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      updateData.password = await bcrypt.hash(
        updateProfileDto.newPassword,
        this.SALT_ROUNDS,
      );
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: Number(userId) },
        data: updateData,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          display_name: true,
          avatar: true,
          role: true,
          status: true,
        },
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }
      throw new InternalServerErrorException('Profile update failed');
    }
  }

  async checkActiveSession(userId: number, token: string): Promise<boolean> {
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

    return { success: true, message: 'Reset code sent successfully' };
  }

  async resendResetCode(requestResetDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: requestResetDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
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

    return { success: true, message: 'Reset code resent successfully' };
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

    return { success: true, message: 'Code is valid' };
  }

  async completeReset(completeResetDto: CompleteResetDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_code: { not: null },
        reset_code_expires: { gt: new Date() },
      },
      orderBy: { reset_code_expires: 'desc' }, // get the latest one if multiple (edge case)
    });

    if (!user) {
      throw new BadRequestException('No valid password reset session found');
    }

    if (completeResetDto.newPassword !== completeResetDto.confirmedPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(
      completeResetDto.newPassword,
      this.SALT_ROUNDS,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_code: null,
          reset_code_expires: null,
        },
      }),
      this.prisma.passwordChange.create({
        data: {
          user_id: user.id,
          old_password: user.password,
          new_password: hashedPassword,
          confirm_password: hashedPassword,
        },
      }),
    ]);

    return { success: true, message: 'Password reset successfully' };
  }

  private async sendResetCodeEmail(email: string, code: string) {
    try {
      console.log(`Attempting to send email to: ${email}`); // Debug log

      const mailOptions = {
        to: email,
        from: this.configService.get('MAIL_FROM'),
        subject: 'Your Password Reset Code',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`,
      };

      // For testing purposes, log instead of sending in development
      if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: Email content:', mailOptions);
        return;
      }

      await this.mailerService.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Email sending error:', error);
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
  async handleGoogleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    googleAvatar?: string;
    provider: string;
  }) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          first_name: googleUser.firstName,
          last_name: googleUser.lastName,
          display_name: `${googleUser.firstName} ${googleUser.lastName}`,
          avatar: googleUser.googleAvatar,
          provider: googleUser.provider,
          email_verified: true,
          password: null,
        },
      });
    } else if (!user.avatar && googleUser.googleAvatar) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatar: googleUser.googleAvatar },
      });
    }

    // Generate JWT token
    const token = this.generateJwtToken({
      userId: user.id,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from 'src/app/core/guards/google-auth.guard';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { CompleteResetDto } from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('')
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile/update')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Post('update-avatar')
  @UseGuards(JwtAuthGuard)
  async updateAvatar(@Req() req, @Body() body: { avatar: string }) {
    return this.authService.updateAvatar(req.user.userId, body.avatar);
  }

  @Post('request-reset')
  async requestReset(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestReset(dto);
  }

  @Post('resend')
  async resend(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendResetCode(dto);
  }

  @Post('verify-reset')
  async verifyReset(@Body() dto: VerifyResetDto) {
    return this.authService.verifyResetCode(dto);
  }

  @Post('complete-reset')
  async completeReset(@Body() dto: CompleteResetDto) {
    return this.authService.completeReset(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard) // This triggers the Google login
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req, @Res() res) {
    try {
      if (!req.user) {
        throw new Error('No user data received from Google');
      }

      const { token, user } = await this.authService.handleGoogleLogin(
        req.user,
      );

      res.cookie('access_token', token, {
        maxAge: 2592000000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.cookie(
        'user_cookie',
        JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
        }),
        {
          maxAge: 2592000000, // 30 days
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/?avatar=${encodeURIComponent(user.avatar || '')}`,
      );
    } catch (error) {
      console.error('Google redirect error:', error);
      return res.status(500).json({
        statusCode: 500,
        message: error.message || 'Authentication failed',
      });
    }
  }
}

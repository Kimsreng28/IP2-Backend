import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { CompleteResetDto } from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
    return req.user; // Should contain userId and email from JwtStrategy
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
}

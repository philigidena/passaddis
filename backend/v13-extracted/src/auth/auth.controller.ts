import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterDto,
  EmailRegisterDto,
  EmailLoginDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============== OTP AUTHENTICATION ==============

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // ============== EMAIL/PASSWORD AUTHENTICATION ==============

  @Public()
  @Post('register')
  async register(@Body() dto: EmailRegisterDto) {
    return this.authService.registerWithEmail(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: EmailLoginDto) {
    return this.authService.loginWithEmail(dto);
  }

  // ============== PROFILE MANAGEMENT ==============

  @UseGuards(JwtAuthGuard)
  @Patch('complete-profile')
  async completeProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterDto,
  ) {
    return this.authService.completeProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('set-password')
  async setPassword(
    @CurrentUser('id') userId: string,
    @Body() body: { password: string },
  ) {
    return this.authService.setPassword(userId, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('has-password')
  async hasPassword(@CurrentUser('id') userId: string) {
    const hasPassword = await this.authService.hasPassword(userId);
    return { hasPassword };
  }
}

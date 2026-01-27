import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Patch,
  Param,
  Req,
  Query,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import type { Request } from 'express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterDto,
  EmailRegisterDto,
  EmailLoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  // Helper to extract client info
  private getClientInfo(req: Request, userAgent?: string) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const device = userAgent || req.headers['user-agent'] || 'unknown';
    return { ip: String(ip), device };
  }

  // ============== OTP AUTHENTICATION ==============

  @Public()
  @Post('send-otp')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 OTP requests per minute
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('verify-otp')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { ip, device } = this.getClientInfo(req, userAgent);
    return this.authService.verifyOtp(dto, device, ip);
  }

  // ============== EMAIL/PASSWORD AUTHENTICATION ==============

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 registrations per minute
  async register(
    @Body() dto: EmailRegisterDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { ip, device } = this.getClientInfo(req, userAgent);
    return this.authService.registerWithEmail(dto, device, ip);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 login attempts per minute
  async login(
    @Body() dto: EmailLoginDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { ip, device } = this.getClientInfo(req, userAgent);
    return this.authService.loginWithEmail(dto, device, ip);
  }

  // ============== PASSWORD RESET ==============

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ============== EMAIL VERIFICATION ==============

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  // ============== REFRESH TOKEN MANAGEMENT ==============

  @Public()
  @Post('refresh')
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { ip, device } = this.getClientInfo(req, userAgent);
    return this.authService.refreshAccessToken(dto.refreshToken, device, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() body: { refreshToken?: string }) {
    if (body.refreshToken) {
      await this.authService.revokeRefreshToken(body.refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@CurrentUser('id') userId: string) {
    await this.authService.revokeAllUserTokens(userId);
    return { message: 'Logged out from all devices' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser('id') userId: string) {
    return this.authService.getActiveSessions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    await this.authService.revokeSession(userId, sessionId);
    return { message: 'Session revoked' };
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

  // ============== BOOTSTRAP ADMIN (ONE-TIME USE ONLY) ==============

  @Public()
  @Post('bootstrap-admin')
  @Throttle({ default: { ttl: 60000, limit: 1 } }) // Only 1 attempt per minute
  async bootstrapAdmin(@Body() body: { email: string; secret: string }) {
    // SECURITY: Only allow in development or if explicitly enabled
    const allowBootstrap = process.env.ALLOW_ADMIN_BOOTSTRAP === 'true';
    if (process.env.NODE_ENV === 'production' && !allowBootstrap) {
      throw new BadRequestException('Admin bootstrap is disabled in production');
    }

    // Secret key to prevent unauthorized access
    const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_ADMIN_SECRET;
    if (!BOOTSTRAP_SECRET) {
      throw new BadRequestException('Bootstrap secret not configured');
    }

    if (body.secret !== BOOTSTRAP_SECRET) {
      throw new BadRequestException('Invalid bootstrap secret');
    }

    // SECURITY: Only allow if NO admin exists yet
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      throw new BadRequestException(
        'An admin already exists. Use admin panel to create additional admins.',
      );
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update user to admin
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Log the admin creation
    await this.authService.logAudit(
      'ADMIN_BOOTSTRAP',
      'User',
      user.id,
      user.id,
      { role: 'USER' },
      { role: 'ADMIN' },
    );

    return {
      message: 'First admin created successfully. Disable ALLOW_ADMIN_BOOTSTRAP in production.',
      user: updatedUser,
    };
  }
}

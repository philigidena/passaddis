import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Patch,
  BadRequestException,
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
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

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

  // ============== BOOTSTRAP ADMIN (ONE-TIME USE) ==============

  @Public()
  @Post('bootstrap-admin')
  async bootstrapAdmin(@Body() body: { email: string; secret: string }) {
    // Secret key to prevent unauthorized access
    const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_ADMIN_SECRET || 'PassAddis2026!Bootstrap';

    if (body.secret !== BOOTSTRAP_SECRET) {
      throw new BadRequestException('Invalid bootstrap secret');
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if there's already an admin
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

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

    return {
      message: 'User promoted to admin successfully',
      user: updatedUser,
      note: existingAdmin ? 'Note: There was already an existing admin' : 'This is the first admin',
    };
  }
}

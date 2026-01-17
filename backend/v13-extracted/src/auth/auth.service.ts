import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AfroSmsProvider } from './providers/afro-sms.provider';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterDto,
  AuthResponseDto,
  EmailRegisterDto,
  EmailLoginDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsProvider: AfroSmsProvider,
  ) {}

  // Generate a 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to phone (stub - integrate with Afro Message later)
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const { phone } = dto;

    // Generate OTP
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate previous OTPs for this phone
    await this.prisma.otpCode.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { phone } });

    // Store OTP
    await this.prisma.otpCode.create({
      data: {
        code,
        phone,
        expiresAt,
        userId: user?.id,
      },
    });

    // Send SMS via Afro Message
    const smsResult = await this.smsProvider.sendOtp(phone, code);

    if (!smsResult.success) {
      console.error(`SMS sending failed for ${phone}:`, smsResult.error);
      // Still return success to not expose SMS failures to potential attackers
      // The OTP is stored and can be verified if SMS eventually arrives
    }

    // Log OTP in development for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 OTP for ${phone}: ${code}`);
    }

    return { message: 'OTP sent successfully' };
  }

  // Verify OTP and login/register user
  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { phone, code } = dto;

    // Find valid OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          isVerified: true,
        },
      });
    } else {
      // Mark user as verified
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // Generate JWT
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Update user profile after verification
  async completeProfile(
    userId: string,
    dto: RegisterDto,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
      },
    });

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Get current user
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // ============== EMAIL/PASSWORD AUTHENTICATION ==============

  // Register with email and password
  async registerWithEmail(dto: EmailRegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, phone } = dto;

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || `email_${Date.now()}`, // Temporary phone for users registering with email
        isVerified: true, // Email users are verified by default (can add email verification later)
      },
    });

    // Generate JWT
    const payload = { sub: user.id, phone: user.phone, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Login with email and password
  async loginWithEmail(dto: EmailLoginDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT
    const payload = { sub: user.id, phone: user.phone, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Add password to existing user (for users who registered via OTP)
  async setPassword(userId: string, password: string): Promise<{ message: string }> {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password set successfully' };
  }

  // Check if user has password set
  async hasPassword(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    return !!user?.passwordHash;
  }
}

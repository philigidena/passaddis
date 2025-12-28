import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
import * as crypto from 'crypto';

// Constants for security
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access tokens

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsProvider: AfroSmsProvider,
    private configService: ConfigService,
  ) {}

  // Generate a 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure refresh token
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Create refresh token in database
  private async createRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<string> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        deviceInfo,
        ipAddress,
      },
    });

    return token;
  }

  // Generate tokens (access + refresh)
  private async generateTokens(
    user: { id: string; phone: string; email?: string | null; role: string },
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, phone: user.phone, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = await this.createRefreshToken(user.id, deviceInfo, ipAddress);

    return { accessToken, refreshToken };
  }

  // Check if user is locked out
  private async checkAccountLockout(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true, failedLoginAttempts: true },
    });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(
        `Account locked. Try again in ${minutesLeft} minutes.`,
      );
    }
  }

  // Record failed login attempt
  private async recordFailedLogin(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    const attempts = (user?.failedLoginAttempts || 0) + 1;
    const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
      : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil,
      },
    });

    if (lockedUntil) {
      throw new ForbiddenException(
        `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
      );
    }
  }

  // Clear failed login attempts on successful login
  private async clearFailedLogins(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  // Log audit event
  async logAudit(
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    oldValue?: any,
    newValue?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
      },
    });
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
  async verifyOtp(
    dto: VerifyOtpDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
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
    const isNewUser = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          isVerified: true,
        },
      });
    } else {
      // Check lockout before proceeding
      await this.checkAccountLockout(user.id);

      // Mark user as verified and clear any failed attempts
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      deviceInfo,
      ipAddress,
    );

    // Log the login/register event
    await this.logAudit(
      isNewUser ? 'REGISTER_OTP' : 'LOGIN_OTP',
      'User',
      user.id,
      user.id,
      null,
      null,
      ipAddress,
      deviceInfo,
    );

    return {
      accessToken,
      refreshToken,
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
  async registerWithEmail(
    dto: EmailRegisterDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
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
        phone: phone || `email_${Date.now()}`,
        isVerified: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      deviceInfo,
      ipAddress,
    );

    // Log registration
    await this.logAudit(
      'REGISTER_EMAIL',
      'User',
      user.id,
      user.id,
      null,
      null,
      ipAddress,
      deviceInfo,
    );

    return {
      accessToken,
      refreshToken,
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
  async loginWithEmail(
    dto: EmailLoginDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const { email, password } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    await this.checkAccountLockout(user.id);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Record failed attempt
      await this.recordFailedLogin(user.id);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Clear failed login attempts on successful login
    await this.clearFailedLogins(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      deviceInfo,
      ipAddress,
    );

    // Log login
    await this.logAudit(
      'LOGIN_EMAIL',
      'User',
      user.id,
      user.id,
      null,
      null,
      ipAddress,
      deviceInfo,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ============== REFRESH TOKEN MANAGEMENT ==============

  // Refresh access token using refresh token
  async refreshAccessToken(
    refreshTokenValue: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Find the refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    if (tokenRecord.revoked) {
      // Potential token reuse attack - revoke all user tokens
      await this.revokeAllUserTokens(tokenRecord.userId);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check if user account is locked
    await this.checkAccountLockout(tokenRecord.userId);

    // Revoke the old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true, revokedAt: new Date() },
    });

    // Generate new tokens
    const user = tokenRecord.user;
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      deviceInfo,
      ipAddress,
    );

    return { accessToken, refreshToken };
  }

  // Revoke a specific refresh token (logout)
  async revokeRefreshToken(refreshTokenValue: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshTokenValue },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  // Revoke all refresh tokens for a user (logout all devices)
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  // Get active sessions for a user
  async getActiveSessions(userId: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tokens;
  }

  // Revoke a specific session
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id: sessionId, userId },
      data: { revoked: true, revokedAt: new Date() },
    });
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

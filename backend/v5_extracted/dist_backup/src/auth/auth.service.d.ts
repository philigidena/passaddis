import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AfroSmsProvider } from './providers/afro-sms.provider';
import { SendOtpDto, VerifyOtpDto, RegisterDto, AuthResponseDto, EmailRegisterDto, EmailLoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private smsProvider;
    constructor(prisma: PrismaService, jwtService: JwtService, smsProvider: AfroSmsProvider);
    private generateOtp;
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto>;
    completeProfile(userId: string, dto: RegisterDto): Promise<AuthResponseDto>;
    getMe(userId: string): Promise<{
        id: string;
        phone: string;
        email: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    registerWithEmail(dto: EmailRegisterDto): Promise<AuthResponseDto>;
    loginWithEmail(dto: EmailLoginDto): Promise<AuthResponseDto>;
    setPassword(userId: string, password: string): Promise<{
        message: string;
    }>;
    hasPassword(userId: string): Promise<boolean>;
}

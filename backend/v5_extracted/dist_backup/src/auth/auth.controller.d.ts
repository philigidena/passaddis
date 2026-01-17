import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RegisterDto, EmailRegisterDto, EmailLoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    register(dto: EmailRegisterDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    login(dto: EmailLoginDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    completeProfile(userId: string, dto: RegisterDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    setPassword(userId: string, body: {
        password: string;
    }): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        phone: string;
        email: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    hasPassword(userId: string): Promise<{
        hasPassword: boolean;
    }>;
}

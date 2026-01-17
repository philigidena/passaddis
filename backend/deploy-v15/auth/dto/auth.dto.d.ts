export declare class SendOtpDto {
    phone: string;
}
export declare class VerifyOtpDto {
    phone: string;
    code: string;
}
export declare class RegisterDto {
    phone: string;
    name: string;
    email?: string;
}
export declare class LoginDto {
    phone: string;
    code: string;
}
export declare class EmailRegisterDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
}
export declare class EmailLoginDto {
    email: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        phone: string | null;
        name: string | null;
        email: string | null;
        role: string;
    };
}

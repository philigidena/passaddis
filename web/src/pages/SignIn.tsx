import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, Ticket } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'register' | 'otp' | 'verify-otp';

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, sendOtp, verifyOtp } = useAuth();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const clearError = () => setError(null);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    clearError();

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    clearError();

    const result = await register(email, password, name, phone || undefined);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    clearError();

    const fullPhone = phone.startsWith('0') ? phone : `0${phone}`;
    const result = await sendOtp(fullPhone);
    setIsLoading(false);

    if (result.success) {
      setAuthMode('verify-otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    clearError();

    const fullPhone = phone.startsWith('0') ? phone : `0${phone}`;
    const result = await verifyOtp(fullPhone, otpCode);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (authMode) {
      case 'login':
        handleEmailLogin();
        break;
      case 'register':
        handleEmailRegister();
        break;
      case 'otp':
        handleSendOtp();
        break;
      case 'verify-otp':
        handleVerifyOtp();
        break;
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'otp':
        return 'Phone Login';
      case 'verify-otp':
        return 'Enter Code';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'login':
        return 'Sign in with your email and password';
      case 'register':
        return 'Create an account to get started';
      case 'otp':
        return "We'll send you a verification code";
      case 'verify-otp':
        return `Enter the 6-digit code sent to ${phone}`;
    }
  };

  return (
    <Layout hideNavbar hideFooter>
      <div className="min-h-screen flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">PassAddis</span>
            </Link>

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{getTitle()}</h1>
              <p className="text-white/60">{getSubtitle()}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Password Login */}
              {(authMode === 'login' || authMode === 'register') && (
                <>
                  {authMode === 'register' && (
                    <Input
                      label="Full Name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError();
                      }}
                      leftIcon={<User className="w-5 h-5" />}
                    />
                  )}

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    leftIcon={<Mail className="w-5 h-5" />}
                  />

                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'register' ? 'Min 8 characters' : 'Enter password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                  />

                  {authMode === 'register' && (
                    <Input
                      label="Phone Number (Optional)"
                      placeholder="9XXXXXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearError();
                      }}
                      leftIcon={
                        <div className="flex items-center gap-1">
                          <Phone className="w-5 h-5" />
                          <span className="text-white/60 text-sm">+251</span>
                        </div>
                      }
                    />
                  )}
                </>
              )}

              {/* Phone OTP */}
              {authMode === 'otp' && (
                <Input
                  label="Phone Number"
                  placeholder="9XXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError();
                  }}
                  leftIcon={
                    <div className="flex items-center gap-1">
                      <Phone className="w-5 h-5" />
                      <span className="text-white/60 text-sm">+251</span>
                    </div>
                  }
                />
              )}

              {/* OTP Verification */}
              {authMode === 'verify-otp' && (
                <div>
                  <Input
                    label="Verification Code"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                      clearError();
                    }}
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode('');
                      handleSendOtp();
                    }}
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {authMode === 'login' && 'Sign In'}
                {authMode === 'register' && 'Create Account'}
                {authMode === 'otp' && 'Send Code'}
                {authMode === 'verify-otp' && 'Verify'}
              </Button>
            </form>

            {/* Divider */}
            {(authMode === 'login' || authMode === 'register') && (
              <>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/40 text-sm">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Phone Login Option */}
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setAuthMode('otp');
                    clearError();
                  }}
                  leftIcon={<Phone className="w-5 h-5" />}
                >
                  Continue with Phone
                </Button>
              </>
            )}

            {/* Back to Email */}
            {(authMode === 'otp' || authMode === 'verify-otp') && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setOtpCode('');
                  clearError();
                }}
                className="flex items-center gap-2 text-primary mt-6 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email Login
              </button>
            )}

            {/* Toggle Sign In/Up */}
            {(authMode === 'login' || authMode === 'register') && (
              <p className="text-center mt-6 text-white/60">
                {authMode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'register' ? 'login' : 'register');
                    clearError();
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  {authMode === 'register' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}

            {/* Terms */}
            <p className="text-center mt-8 text-white/40 text-xs">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920"
            alt="Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/50 to-transparent" />

          {/* Overlay Content */}
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Discover Amazing Events
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Join thousands of Ethiopians experiencing the best events. From concerts to
              conferences, we've got you covered.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

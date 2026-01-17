import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // No token - show error
  if (!token) {
    return (
      <Layout hideNavbar hideFooter>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-danger" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Invalid Link</h1>
            <p className="text-white/60 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await authApi.resetPassword(token, password);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <Layout hideNavbar hideFooter>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Password Reset!</h1>
            <p className="text-white/60 mb-8">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button onClick={() => navigate('/signin')} className="w-full">
              Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar hideFooter>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img
              src="/images/PassAddis_Logo_white.png"
              alt="PassAddis"
              className="h-10 w-auto"
            />
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-white/60">
              Enter your new password below.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
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

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              leftIcon={<Lock className="w-5 h-5" />}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>

          {/* Back to Sign In */}
          <Link
            to="/signin"
            className="flex items-center gap-2 text-primary mt-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </Layout>
  );
}

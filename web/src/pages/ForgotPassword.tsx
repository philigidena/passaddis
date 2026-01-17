import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await authApi.forgotPassword(email);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Layout hideNavbar hideFooter>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-white/60 mb-8">
              If an account exists with <span className="text-white">{email}</span>, you will receive a password reset link shortly.
            </p>
            <p className="text-white/40 text-sm mb-8">
              Didn't receive an email? Check your spam folder or try again with a different email address.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                variant="secondary"
                className="w-full"
              >
                Try Different Email
              </Button>
              <Link to="/signin">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-white/60">
              Enter your email and we'll send you a link to reset your password.
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
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              leftIcon={<Mail className="w-5 h-5" />}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Send Reset Link
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

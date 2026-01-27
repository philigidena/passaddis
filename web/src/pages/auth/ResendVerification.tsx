import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/lib/api';

export function ResendVerification() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await authApi.resendVerification(email);

      if (response.data) {
        setStatus('success');
        setMessage(response.data.message || 'If an account exists with this email, you will receive a verification link.');
      } else {
        setStatus('error');
        setMessage(response.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src="/images/PassAddis_Logo_white.png"
              alt="PassAddis"
              className="h-12 mx-auto"
            />
          </Link>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Resend Verification Email</h2>
          <p className="text-gray-400 text-center mb-6">
            Enter your email address and we'll send you a new verification link.
          </p>

          {status === 'success' ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-300 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2a] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35]"
                  placeholder="Enter your email"
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Verification Email'
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-[#FF6B35] hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

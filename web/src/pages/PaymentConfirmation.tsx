import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Loader2, Ticket, ShoppingBag, ArrowRight,
  RefreshCw, Clock, AlertTriangle,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { paymentsApi } from '@/lib/api';

type PaymentState = 'verifying' | 'success' | 'failed' | 'pending' | 'timeout';

export function PaymentConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>('verifying');
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    status: string;
  } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 12; // 12 attempts * 5s = 60 seconds max

  const orderId = searchParams.get('order_id');
  const paymentStatus = searchParams.get('payment_status');
  const sessionId = searchParams.get('session_id');
  const testPayment = searchParams.get('test_payment');

  useEffect(() => {
    if (!orderId && !sessionId) {
      setState('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Handle test payment
        if (testPayment === 'true' && sessionId) {
          const testResult = await paymentsApi.completeTestPayment(sessionId);
          if (testResult.data?.success) {
            setOrderDetails({ orderId: testResult.data.orderId, status: 'PAID' });
            setState('success');
          } else {
            setState('failed');
          }
          return;
        }

        // Verify real payment
        if (orderId) {
          const result = await paymentsApi.verify(orderId);

          if (result.data?.verified) {
            setOrderDetails({ orderId: result.data.order.id, status: result.data.order.status });
            setState('success');
            return;
          }

          // Check status
          const statusResult = await paymentsApi.getStatus(orderId);
          if (statusResult.data?.paid) {
            setOrderDetails({ orderId, status: 'PAID' });
            setState('success');
            return;
          }
        }

        // If paymentStatus=success from Telebirr redirect but not verified yet, keep polling
        if (paymentStatus === 'success' && attempts < maxAttempts) {
          setAttempts((prev) => prev + 1);
          setState('pending');
        } else if (attempts >= maxAttempts) {
          setState('timeout');
        } else {
          setState('failed');
        }
      } catch {
        if (attempts < maxAttempts && paymentStatus === 'success') {
          setAttempts((prev) => prev + 1);
          setState('pending');
        } else {
          setState('failed');
        }
      }
    };

    verifyPayment();
  }, [orderId, sessionId, testPayment, attempts, paymentStatus]);

  // Poll every 5 seconds while pending
  useEffect(() => {
    if (state !== 'pending' || attempts >= maxAttempts) return;

    const timer = setTimeout(() => {
      setAttempts((prev) => prev + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [state, attempts]);

  const isTicketOrder = !searchParams.has('shop');

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg pt-24 pb-20">
        <div className="max-w-lg mx-auto px-4">
          {/* Verifying */}
          {(state === 'verifying' || state === 'pending') && (
            <div className="text-center py-20">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Loader2 className="absolute inset-0 w-8 h-8 m-auto text-primary animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Verifying Payment</h1>
              <p className="text-white/50 mb-2">
                Please wait while we confirm your payment...
              </p>
              {state === 'pending' && (
                <p className="text-white/30 text-sm">
                  Attempt {attempts} of {maxAttempts}
                </p>
              )}
              <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-sm">
                <Clock className="w-4 h-4" />
                <span>This usually takes a few seconds</span>
              </div>
            </div>
          )}

          {/* Success */}
          {state === 'success' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
              <p className="text-white/50 mb-8">
                Your order has been confirmed. {isTicketOrder
                  ? 'Your tickets are ready!'
                  : 'Your order is being prepared.'}
              </p>

              {orderDetails && (
                <div className="bg-dark-card border border-white/10 rounded-2xl p-6 mb-8 text-left">
                  <h3 className="text-white/60 text-sm uppercase tracking-wider mb-3">Order Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/50">Order ID</span>
                      <span className="text-white font-mono text-sm">{orderDetails.orderId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Status</span>
                      <span className="text-green-400 font-semibold">{orderDetails.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {isTicketOrder ? (
                  <>
                    <Link to="/tickets">
                      <Button className="w-full" leftIcon={<Ticket className="w-4 h-4" />}>
                        View My Tickets
                      </Button>
                    </Link>
                    <Link to="/events">
                      <Button variant="outline" className="w-full" leftIcon={<ArrowRight className="w-4 h-4" />}>
                        Browse More Events
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/shop/orders">
                      <Button className="w-full" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                        View My Orders
                      </Button>
                    </Link>
                    <Link to="/shop">
                      <Button variant="outline" className="w-full" leftIcon={<ArrowRight className="w-4 h-4" />}>
                        Continue Shopping
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Failed */}
          {state === 'failed' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Payment Failed</h1>
              <p className="text-white/50 mb-8">
                We couldn't confirm your payment. If money was deducted, it will be refunded automatically.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate(-1)}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
                <Link to="/events">
                  <Button variant="outline" className="w-full">
                    Back to Events
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Timeout — payment may still process */}
          {state === 'timeout' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Payment Processing</h1>
              <p className="text-white/50 mb-4">
                Your payment is still being processed. This can take a few minutes with some payment providers.
              </p>
              <p className="text-white/40 text-sm mb-8">
                Don't worry — if payment was successful, your tickets will appear in "My Tickets" shortly.
                You'll also receive a notification.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => { setAttempts(0); setState('verifying'); }}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Check Again
                </Button>
                <Link to="/tickets">
                  <Button variant="outline" className="w-full" leftIcon={<Ticket className="w-4 h-4" />}>
                    Go to My Tickets
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

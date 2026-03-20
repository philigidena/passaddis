import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet as WalletIcon, Send, ArrowDownLeft, ArrowUpRight, Loader2, Gift,
  CreditCard, Plus, ExternalLink, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { walletApi } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import clsx from 'clsx';

// Remittance partner deep links
const remittancePartners = [
  {
    name: 'WorldRemit',
    logo: '/images/partners/worldremit.png',
    description: 'Send money from 50+ countries to Ethiopia',
    url: 'https://www.worldremit.com/en/ethiopia',
    color: 'from-purple-600/20 to-purple-600/5',
  },
  {
    name: 'Sendwave',
    logo: '/images/partners/sendwave.png',
    description: 'Fast transfers from US, UK, Canada, EU',
    url: 'https://www.sendwave.com/en-us/send-money-to-ethiopia',
    color: 'from-blue-600/20 to-blue-600/5',
  },
  {
    name: 'Remitly',
    logo: '/images/partners/remitly.png',
    description: 'Trusted by 5M+ customers worldwide',
    url: 'https://www.remitly.com/us/en/ethiopia',
    color: 'from-green-600/20 to-green-600/5',
  },
  {
    name: 'Western Union',
    logo: '/images/partners/wu.png',
    description: 'Global network with local pickup options',
    url: 'https://www.westernunion.com/us/en/send-money-to-ethiopia.html',
    color: 'from-yellow-600/20 to-yellow-600/5',
  },
];

type Tab = 'overview' | 'send' | 'topup' | 'remittance';

export function WalletPage() {
  const [searchParams] = useSearchParams();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Send Gift state
  const [recipientPhone, setRecipientPhone] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Top-up state
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpCurrency, setTopUpCurrency] = useState('USD');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpResult, setTopUpResult] = useState<{ success: boolean; message: string } | null>(null);

  const { formatPrice } = useCurrency();

  const fetchWallet = async () => {
    setIsLoading(true);
    const response = await walletApi.get();
    if (response.data) {
      setBalance(response.data.balance);
      setTransactions(response.data.transactions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Handle top-up success redirect
  useEffect(() => {
    if (searchParams.get('topup') === 'success') {
      setTopUpResult({ success: true, message: 'Your wallet has been topped up successfully!' });
      fetchWallet();
    }
  }, [searchParams]);

  const handleSendGift = async () => {
    if (!recipientPhone || !giftAmount) return;
    setIsSending(true);
    setSendResult(null);

    const response = await walletApi.sendGift(
      recipientPhone,
      parseFloat(giftAmount),
      giftMessage || undefined,
    );

    if (response.data) {
      setSendResult({ success: true, message: response.data.message });
      setRecipientPhone('');
      setGiftAmount('');
      setGiftMessage('');
      fetchWallet();
    } else {
      setSendResult({ success: false, message: response.error || 'Failed to send' });
    }
    setIsSending(false);
  };

  const handleTopUp = async () => {
    if (!topUpAmount) return;
    setIsTopUpLoading(true);
    setTopUpResult(null);

    const response = await walletApi.topUp(
      parseFloat(topUpAmount),
      topUpCurrency,
      'STRIPE',
    );

    if (response.data?.checkoutUrl) {
      window.location.href = response.data.checkoutUrl;
    } else {
      setTopUpResult({ success: false, message: response.error || 'Failed to initiate top-up' });
      setIsTopUpLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TOP_UP': return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'GIFT_RECEIVED': return <Gift className="w-4 h-4 text-green-400" />;
      case 'GIFT_SENT': return <Send className="w-4 h-4 text-red-400" />;
      case 'PURCHASE': return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'REFUND': return <ArrowDownLeft className="w-4 h-4 text-blue-400" />;
      default: return <WalletIcon className="w-4 h-4 text-white/40" />;
    }
  };

  const topUpPresets = [
    { label: '$10', amount: 10, currency: 'USD' },
    { label: '$25', amount: 25, currency: 'USD' },
    { label: '$50', amount: 50, currency: 'USD' },
    { label: '$100', amount: 100, currency: 'USD' },
  ];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <WalletIcon className="w-4 h-4" /> },
    { key: 'topup', label: 'Top Up', icon: <Plus className="w-4 h-4" /> },
    { key: 'send', label: 'Send Gift', icon: <Gift className="w-4 h-4" /> },
    { key: 'remittance', label: 'Remit', icon: <ExternalLink className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 rounded-2xl p-8 mb-6 text-center">
            <WalletIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-white/50 text-sm mb-1">PassAddis Balance</p>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
            ) : (
              <p className="text-4xl font-bold text-white">
                {balance.toLocaleString()} <span className="text-lg text-white/60">ETB</span>
              </p>
            )}
          </div>

          {/* Top-up success banner */}
          {topUpResult?.success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">{topUpResult.message}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-dark-card border border-white/10 rounded-xl p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}

          {/* === OVERVIEW TAB === */}
          {activeTab === 'overview' && (
            <div className="bg-dark-card border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Transaction History</h3>
              </div>
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40 mx-auto" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <WalletIcon className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40">No transactions yet</p>
                  <p className="text-white/30 text-sm mt-1">Top up your wallet to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-white text-sm">{tx.description}</p>
                          <p className="text-white/40 text-xs">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={clsx(
                        'text-sm font-semibold',
                        tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === TOP UP TAB === */}
          {activeTab === 'topup' && (
            <div className="bg-dark-card border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Top Up with Card
              </h3>
              <p className="text-white/40 text-sm mb-6">
                Add funds to your PassAddis wallet using Visa, Mastercard, or Amex
              </p>

              {/* Quick Amount Presets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {topUpPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setTopUpAmount(preset.amount.toString());
                      setTopUpCurrency(preset.currency);
                    }}
                    className={clsx(
                      'py-3 rounded-xl text-sm font-semibold transition-all border',
                      topUpAmount === preset.amount.toString()
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-white/60 text-sm mb-1 block">Amount</label>
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="0.00"
                      min="10"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-white/60 text-sm mb-1 block">Currency</label>
                    <select
                      value={topUpCurrency}
                      onChange={(e) => setTopUpCurrency(e.target.value)}
                      className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>

                {topUpAmount && parseFloat(topUpAmount) >= 10 && (
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <p className="text-white/60 text-sm">
                      You will receive approximately{' '}
                      <span className="text-white font-semibold">{formatPrice(parseFloat(topUpAmount))}</span>{' '}
                      in your wallet
                    </p>
                  </div>
                )}

                {topUpResult && !topUpResult.success && (
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {topUpResult.message}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleTopUp}
                  isLoading={isTopUpLoading}
                  disabled={!topUpAmount || parseFloat(topUpAmount) < 10}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                >
                  {topUpAmount ? `Pay ${topUpAmount} ${topUpCurrency}` : 'Top Up Wallet'}
                </Button>

                <p className="text-white/30 text-xs text-center">
                  Secure payment via Stripe. Funds are converted to ETB at current exchange rates.
                </p>
              </div>
            </div>
          )}

          {/* === SEND GIFT TAB === */}
          {activeTab === 'send' && (
            <div className="bg-dark-card border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                Send Gift Credit
              </h3>
              <p className="text-white/40 text-sm mb-6">
                Send PassAddis credit to family or friends in Ethiopia
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Recipient Phone</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Amount (ETB)</label>
                  <input
                    type="number"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    placeholder="100"
                    min="10"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Message (optional)</label>
                  <input
                    type="text"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Enjoy the show!"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>
                {sendResult && (
                  <div className={clsx(
                    'p-3 rounded-lg text-sm flex items-center gap-2',
                    sendResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  )}>
                    {sendResult.success
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {sendResult.message}
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={handleSendGift}
                  isLoading={isSending}
                  disabled={!recipientPhone || !giftAmount}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send {giftAmount ? `${giftAmount} ETB` : 'Gift'}
                </Button>
              </div>
            </div>
          )}

          {/* === REMITTANCE TAB === */}
          {activeTab === 'remittance' && (
            <div className="space-y-4">
              <div className="bg-dark-card border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-accent" />
                  Fund via Remittance
                </h3>
                <p className="text-white/40 text-sm mb-2">
                  Use your preferred remittance service to send money to Ethiopia,
                  then top up your PassAddis wallet with Telebirr or bank transfer.
                </p>
              </div>

              <div className="grid gap-3">
                {remittancePartners.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      'group flex items-center gap-4 p-4 rounded-2xl border border-white/10',
                      'bg-gradient-to-r', partner.color,
                      'hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <span className="text-white font-bold text-sm">{partner.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{partner.name}</p>
                      <p className="text-white/50 text-xs">{partner.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>

              <div className="bg-dark-card border border-white/10 rounded-2xl p-5">
                <h4 className="text-white/70 text-sm font-medium mb-3">How it works</h4>
                <div className="space-y-3">
                  {[
                    'Send money to Ethiopia via any remittance service',
                    'Receive funds in your Telebirr or bank account',
                    'Top up your PassAddis wallet from the Top Up tab',
                    'Buy tickets or send gift credit to family and friends',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-white/50 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

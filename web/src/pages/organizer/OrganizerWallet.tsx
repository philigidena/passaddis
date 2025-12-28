import { useState } from 'react';

interface WalletBalance {
  available: number;
  pending: number;
  totalEarnings: number;
  totalWithdrawn: number;
}

interface Transaction {
  id: string;
  type: 'TICKET_SALE' | 'WITHDRAWAL' | 'COMMISSION' | 'REFUND';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  eventName?: string;
}

interface Settlement {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankName: string;
  accountNumber: string;
  requestedAt: string;
  completedAt?: string;
}

// Mock data
const mockBalance: WalletBalance = {
  available: 45000,
  pending: 12500,
  totalEarnings: 125000,
  totalWithdrawn: 67500,
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'TICKET_SALE',
    amount: 2500,
    description: 'VIP ticket purchase',
    status: 'COMPLETED',
    createdAt: '2024-12-27T14:30:00',
    eventName: 'New Year Eve Party 2025',
  },
  {
    id: '2',
    type: 'COMMISSION',
    amount: -250,
    description: 'Platform commission (10%)',
    status: 'COMPLETED',
    createdAt: '2024-12-27T14:30:00',
    eventName: 'New Year Eve Party 2025',
  },
  {
    id: '3',
    type: 'TICKET_SALE',
    amount: 1500,
    description: 'Regular ticket purchase',
    status: 'COMPLETED',
    createdAt: '2024-12-26T10:15:00',
    eventName: 'New Year Eve Party 2025',
  },
  {
    id: '4',
    type: 'WITHDRAWAL',
    amount: -20000,
    description: 'Withdrawal to CBE account',
    status: 'COMPLETED',
    createdAt: '2024-12-25T09:00:00',
  },
  {
    id: '5',
    type: 'REFUND',
    amount: -1500,
    description: 'Ticket refund',
    status: 'COMPLETED',
    createdAt: '2024-12-24T16:45:00',
    eventName: 'Music Festival',
  },
];

const mockSettlements: Settlement[] = [
  {
    id: '1',
    amount: 20000,
    status: 'COMPLETED',
    bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '****4567',
    requestedAt: '2024-12-25T09:00:00',
    completedAt: '2024-12-25T12:30:00',
  },
  {
    id: '2',
    amount: 15000,
    status: 'PENDING',
    bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '****4567',
    requestedAt: '2024-12-27T11:00:00',
  },
];

export function OrganizerWallet() {
  const [balance] = useState<WalletBalance>(mockBalance);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [settlements] = useState<Settlement[]>(mockSettlements);
  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements'>('transactions');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const navItems = [
    { label: 'Dashboard', href: '/organizer', active: false },
    { label: 'Events', href: '/organizer/events', active: false },
    { label: 'Wallet', href: '/organizer/wallet', active: true },
    { label: 'Settings', href: '/organizer/settings', active: false },
  ];

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'TICKET_SALE':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'WITHDRAWAL':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'COMMISSION':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        );
      case 'REFUND':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'TICKET_SALE':
        return 'text-green-400 bg-green-500/20';
      case 'WITHDRAWAL':
        return 'text-blue-400 bg-blue-500/20';
      case 'COMMISSION':
        return 'text-orange-400 bg-orange-500/20';
      case 'REFUND':
        return 'text-red-400 bg-red-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'PROCESSING':
        return 'bg-blue-500/20 text-blue-400';
      case 'FAILED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="bg-dark-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-primary">
                PassAddis
              </a>
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      item.active
                        ? 'bg-primary/20 text-primary'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/60 text-sm">Organizer</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">O</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Wallet & Settlements</h1>
            <p className="text-white/60 mt-1">Manage your earnings and withdrawals</p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="mt-4 md:mt-0 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Withdraw</span>
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60">Available Balance</span>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{balance.available.toLocaleString()}</p>
            <p className="text-white/40 text-sm mt-1">ETB</p>
          </div>

          <div className="bg-dark-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60">Pending</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{balance.pending.toLocaleString()}</p>
            <p className="text-white/40 text-sm mt-1">ETB (settling)</p>
          </div>

          <div className="bg-dark-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60">Total Earnings</span>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{balance.totalEarnings.toLocaleString()}</p>
            <p className="text-white/40 text-sm mt-1">ETB all time</p>
          </div>

          <div className="bg-dark-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60">Total Withdrawn</span>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{balance.totalWithdrawn.toLocaleString()}</p>
            <p className="text-white/40 text-sm mt-1">ETB all time</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'bg-primary text-white'
                : 'bg-dark-card text-white/60 hover:text-white'
            }`}
          >
            Transaction History
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settlements'
                ? 'bg-primary text-white'
                : 'bg-dark-card text-white/60 hover:text-white'
            }`}
          >
            Settlements
          </button>
        </div>

        {/* Content */}
        {activeTab === 'transactions' ? (
          <div className="bg-dark-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Type</th>
                    <th className="text-left p-4 text-white/60 font-medium">Description</th>
                    <th className="text-left p-4 text-white/60 font-medium">Event</th>
                    <th className="text-left p-4 text-white/60 font-medium">Date</th>
                    <th className="text-right p-4 text-white/60 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{tx.description}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/60">{tx.eventName || '-'}</td>
                      <td className="p-4 text-white/60 text-sm">{formatDate(tx.createdAt)}</td>
                      <td className={`p-4 text-right font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="bg-dark-card rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{settlement.amount.toLocaleString()} ETB</p>
                      <p className="text-white/60 text-sm">{settlement.bankName}</p>
                      <p className="text-white/40 text-sm">Account: {settlement.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(settlement.status)}`}>
                      {settlement.status}
                    </span>
                    <p className="text-white/40 text-sm mt-2">Requested: {formatDate(settlement.requestedAt)}</p>
                    {settlement.completedAt && (
                      <p className="text-white/40 text-sm">Completed: {formatDate(settlement.completedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-dark-bg rounded-lg p-4">
                <p className="text-white/60 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-white">{balance.available.toLocaleString()} ETB</p>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Amount to Withdraw</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-primary"
                    placeholder="0"
                    max={balance.available}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">ETB</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[10000, 25000, 45000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(Math.min(amount, balance.available).toString())}
                      className="px-3 py-1 bg-dark-bg border border-white/10 rounded text-white/60 hover:text-white hover:border-primary/50 text-sm transition-colors"
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={() => setWithdrawAmount(balance.available.toString())}
                    className="px-3 py-1 bg-dark-bg border border-white/10 rounded text-white/60 hover:text-white hover:border-primary/50 text-sm transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Bank Account</label>
                <select className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                  <option value="1">Commercial Bank of Ethiopia - ****4567</option>
                  <option value="2">+ Add New Bank Account</option>
                </select>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">Processing Time</p>
                    <p className="text-white/60 text-sm mt-1">
                      Withdrawals are typically processed within 1-3 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance.available}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw {withdrawAmount ? `${Number(withdrawAmount).toLocaleString()} ETB` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { walletAPI } from '../api/apiclient';
import '../styles/ui-kit.css';

const Wallet = React.memo(() => {
  const [balance, setBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getBalance();
      setBalance(response.data.balance);
      setTotalDeposited(response.data.totalDeposited);
      setTotalWithdrawn(response.data.totalWithdrawn);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wallet balance');
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await walletAPI.getTransactions({
        limit: 10,
        skip: 0,
      });
      const data = response.data;
      setTransactions(Array.isArray(data) ? data : (data?.transactions || []));
    } catch (err) {
      console.error('Transaction fetch error:', err);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsProcessing(true);
      await walletAPI.deposit(parseFloat(depositAmount), 'upi');
      setBalance(prev => prev + parseFloat(depositAmount));
      setTotalDeposited(prev => prev + parseFloat(depositAmount));
      setDepositAmount('');
      setShowDepositModal(false);
      setError(null);
      fetchTransactions();
    } catch (err) {
      setError('Deposit failed. Please try again.');
      console.error('Deposit error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [depositAmount, fetchTransactions]);

  // Memoized stats
  const stats = useMemo(() => ({
    deposited: totalDeposited,
    withdrawn: totalWithdrawn,
    net: totalDeposited - totalWithdrawn,
  }), [totalDeposited, totalWithdrawn]);

  if (loading) {
    return (
      <div className="container">
        <h2>Wallet</h2>
        <NeonCard>
          <div className="center" style={{ height: '100px' }}>
            <div className="pulse-animation">Loading...</div>
          </div>
        </NeonCard>
      </div>
    );
  }

  return (
    <div className="container slide-in-up">
      <div className="header">
        <h2 style={{ margin: 0 }}>Wallet</h2>
        <button 
          onClick={fetchBalance}
          className="neon-button ghost"
          style={{ padding: '8px 12px' }}
        >
          ↻
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 100, 100, 0.1)',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          color: '#ff6464',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Balance Display */}
      <NeonCard style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 800, fontSize: '32px', color: '#00d4ff' }}>
          ₹{balance.toFixed(2)}
        </div>
        <div className="small-muted">Available Balance</div>
      </NeonCard>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <NeonCard>
          <div style={{ fontSize: '12px', color: '#9b59ff' }}>Total Deposited</div>
          <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '6px' }}>
            ₹{stats.deposited.toFixed(2)}
          </div>
        </NeonCard>
        <NeonCard>
          <div style={{ fontSize: '12px', color: '#00d4ff' }}>Total Withdrawn</div>
          <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '6px' }}>
            ₹{stats.withdrawn.toFixed(2)}
          </div>
        </NeonCard>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <NeonButton onClick={() => setShowDepositModal(true)}>
          Add Funds ➕
        </NeonButton>
        <NeonButton className="ghost">
          Withdraw 💸
        </NeonButton>
      </div>

      {/* Transactions */}
      {transactions.length > 0 && (
        <div>
          <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Recent</h3>
          {transactions.slice(0, 5).map((tx) => (
            <NeonCard key={tx.id || tx._id} style={{ marginBottom: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{tx.type.toUpperCase()}</div>
                  <div className="small-muted">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{
                  color: tx.type === 'deposit' || tx.type === 'reward' ? '#00d4ff' : '#ff6464',
                  fontWeight: 700,
                }}>
                  {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'}₹{tx.amount}
                </div>
              </div>
            </NeonCard>
          ))}
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <NeonCard style={{ width: '90%', maxWidth: '400px', padding: '24px' }}>
            <h3>Add Funds</h3>
            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '12px',
                marginBottom: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#e6e6f0',
                fontSize: '14px',
              }}
              disabled={isProcessing}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <NeonButton 
                className="ghost"
                onClick={() => setShowDepositModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </NeonButton>
              <NeonButton 
                onClick={handleDeposit}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Deposit'}
              </NeonButton>
            </div>
          </NeonCard>
        </div>
      )}
    </div>
  );
});

Wallet.displayName = 'Wallet';
export default Wallet;

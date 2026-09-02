import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, ChevronDown, ChevronRight, 
  Wallet, CreditCard, PiggyBank, 
  Coins, Landmark, RefreshCcw, Database,
  WalletCards, ClipboardList, 
  ArrowDown, ArrowUp 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Helper Functions
const formatCurrency = (amount) => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' }); 
};

// Sub-components
const SummaryCard = ({ title, amount, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col h-full">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{amount}</h3>
  </div>
);

const SavingsItem = ({ title, amount, percentage, Icon }) => (
  <div className="bg-gray-50/50 p-6 rounded-[20px] flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 h-full">
    <div className="mb-3">
      <Icon size={28} className="text-gray-800" strokeWidth={1.5} />
    </div>
    <p className="text-[13px] font-semibold text-gray-900 mb-1">{title}</p>
    <h4 className="text-[1.35rem] font-bold text-gray-900 mb-0.5 leading-tight">{amount}</h4>
    <span className="text-[11px] font-semibold text-gray-500">{percentage}</span>
  </div>
);

const QuickAction = ({ title, Icon, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[18px] hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm mb-3 last:mb-0 group">
    <div className="flex items-center gap-4">
      <div className="bg-gray-50 w-11 h-11 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
        <Icon size={20} className="text-gray-800" strokeWidth={2} />
      </div>
      <span className="font-semibold text-sm text-gray-900">{title}</span>
    </div>
    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
  </button>
);

const TransactionRow = ({ date, type, category, amount, iconDirection }) => (
  <div className="grid grid-cols-4 items-center py-4 border-b border-gray-100 last:border-0 min-w-[600px] hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-xl">
    <div className="text-[13px] font-medium text-gray-600 pl-2">{date}</div>
    <div className="flex items-center gap-3">
      <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 shrink-0">
        {iconDirection === 'down' ? (
          <ArrowDown size={14} className="text-emerald-600" strokeWidth={2.5} />
        ) : (
          <ArrowUp size={14} className="text-rose-600" strokeWidth={2.5} />
        )}
      </div>
      <span className={`text-[13.5px] font-semibold ${iconDirection === 'down' ? (type === 'Savings' ? 'text-amber-500' : 'text-emerald-600') : 'text-rose-600'}`}>
        {type}
      </span>
    </div>
    <div className="text-[13px] font-medium text-gray-600">{category}</div>
    <div className={`text-[14px] font-bold text-right pr-2 tracking-tight ${iconDirection === 'down' ? (type === 'Savings' ? 'text-amber-500' : 'text-emerald-600') : 'text-rose-600'}`}>
      {amount}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [amountReceived, setAmountReceived] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);

      const [
        { data: amountReceivedData, error: amountReceivedError },
        { data: expensesData, error: expensesError },
        { data: savingsData, error: savingsError },
      ] = await Promise.all([
        supabase.from('amount_received').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('savings').select('*'),
      ]);

      if (amountReceivedError) throw amountReceivedError;
      if (expensesError) throw expensesError;
      if (savingsError) throw savingsError;

      setAmountReceived(amountReceivedData || []);
      setExpenses(expensesData || []);
      setSavings(savingsData || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load your dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Calculations
  const totalReceived = useMemo(() => amountReceived.reduce((sum, item) => sum + Number(item.amount), 0), [amountReceived]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount), 0), [expenses]);
  const totalSavings = useMemo(() => savings.reduce((sum, item) => sum + Number(item.amount), 0), [savings]);
  const availableBalance = totalReceived - totalExpenses - totalSavings;

  const savingsBreakdown = useMemo(() => {
    const breakdown = { gold: 0, silver: 0, fixed_deposit: 0, recurring_deposit: 0 };
    savings.forEach(s => {
      if (breakdown[s.saving_type] !== undefined) {
        breakdown[s.saving_type] += Number(s.amount);
      }
    });
    return breakdown;
  }, [savings]);

  const getPercentage = (amount, total) => {
    if (total === 0) return '(0%)';
    return `(${Math.round((amount / total) * 100)}%)`;
  };

  const recentTransactions = useMemo(() => {
    const combined = [];
    amountReceived.forEach(r => combined.push({
      id: `received-${r.id}`,
      type: 'Amount Received',
      category: r.source,
      amount: `+ ${formatCurrency(r.amount)}`,
      rawAmount: Number(r.amount),
      date: r.received_date,
      createdAt: r.created_at,
      iconDirection: 'down'
    }));
    expenses.forEach(e => combined.push({
      id: `expense-${e.id}`,
      type: 'Expense',
      category: e.category,
      amount: `- ${formatCurrency(e.amount)}`,
      rawAmount: Number(e.amount),
      date: e.expense_date,
      createdAt: e.created_at,
      iconDirection: 'up'
    }));
    savings.forEach(s => {
      const displayType = s.saving_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      combined.push({
        id: `saving-${s.id}`,
        type: 'Savings',
        category: displayType,
        amount: `- ${formatCurrency(s.amount)}`,
        rawAmount: Number(s.amount),
        date: s.saving_date,
        createdAt: s.created_at,
        iconDirection: 'down'
      });
    });

    combined.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return combined.slice(0, 5);
  }, [amountReceived, expenses, savings]);

  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
          <RefreshCcw size={24} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h2>
        <p className="text-gray-500 font-medium max-w-md">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 flex items-center gap-2 bg-gray-900 text-white py-2.5 px-6 rounded-full shadow-sm hover:bg-black transition-all"
        >
          <RefreshCcw size={18} strokeWidth={2.5} />
          <span className="font-bold text-sm">Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Your personal expense & savings tracker</p>
        </div>
        
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 py-2.5 px-5 rounded-full shadow-sm w-max h-max">
          <Calendar size={16} className="text-gray-600" strokeWidth={2.5} />
          <span className="text-[13px] font-bold text-gray-900">{currentDate}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard title="Amount Received" amount={formatCurrency(totalReceived)} Icon={Wallet} />
        <SummaryCard title="Total Expenses" amount={formatCurrency(totalExpenses)} Icon={CreditCard} />
        <SummaryCard title="Total Savings" amount={formatCurrency(totalSavings)} Icon={PiggyBank} />
        <SummaryCard title="Available Balance" amount={formatCurrency(availableBalance)} Icon={Wallet} />
      </div>

      {/* Middle Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Savings Breakdown */}
        <div className="flex-[3] bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Savings Breakdown</h2>
            <button onClick={() => navigate('/savings')} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-900 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide hover:bg-gray-100 transition-colors uppercase">
              View Details <ChevronRight size={14} strokeWidth={2.5} className="text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <SavingsItem title="Gold" amount={formatCurrency(savingsBreakdown.gold)} percentage={getPercentage(savingsBreakdown.gold, totalSavings)} Icon={Coins} />
            <SavingsItem title="Silver" amount={formatCurrency(savingsBreakdown.silver)} percentage={getPercentage(savingsBreakdown.silver, totalSavings)} Icon={Database} />
            <SavingsItem title="Fixed Deposit" amount={formatCurrency(savingsBreakdown.fixed_deposit)} percentage={getPercentage(savingsBreakdown.fixed_deposit, totalSavings)} Icon={Landmark} />
            <SavingsItem title="Recurring Deposit" amount={formatCurrency(savingsBreakdown.recurring_deposit)} percentage={getPercentage(savingsBreakdown.recurring_deposit, totalSavings)} Icon={RefreshCcw} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-[2] bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6 md:mb-8">Quick Actions</h2>
          <div className="flex-1 flex flex-col justify-between">
            <QuickAction title="Add Amount Received" Icon={WalletCards} onClick={() => navigate('/amount-received')} />
            <QuickAction title="Add Expense" Icon={CreditCard} onClick={() => navigate('/expenses')} />
            <QuickAction title="Add to Savings" Icon={PiggyBank} onClick={() => navigate('/savings')} />
            <QuickAction title="View Transactions" Icon={ClipboardList} onClick={() => navigate('/transactions')} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Transactions</h2>
          <button onClick={() => navigate('/transactions')} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-900 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide hover:bg-gray-100 transition-colors uppercase">
            View All <ChevronRight size={14} strokeWidth={2.5} className="text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[650px] w-full">
            {/* Table Header */}
            <div className="grid grid-cols-4 items-center pb-4 border-b border-gray-100 px-2 -mx-2">
              <div className="text-[12px] font-bold text-gray-900 uppercase tracking-wider pl-2">Date</div>
              <div className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">Type</div>
              <div className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">Category / Detail</div>
              <div className="text-[12px] font-bold text-gray-900 uppercase tracking-wider text-right pr-2">Amount</div>
            </div>
            
            {/* Table Rows */}
            <div className="flex flex-col mt-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(t => (
                  <TransactionRow 
                    key={t.id}
                    date={formatDateDisplay(t.date)} 
                    type={t.type} 
                    category={t.category} 
                    amount={t.amount} 
                    iconDirection={t.iconDirection} 
                  />
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <ClipboardList size={22} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-bold text-gray-900">No recent transactions</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">Your financial activity will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

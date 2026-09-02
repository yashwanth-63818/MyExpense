import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, ChevronDown, Wallet, CreditCard, PiggyBank,
  BarChart3, Utensils, Plane, ShoppingBag, Zap, Film, Heart, Book, HelpCircle,
  Coins, Database, Landmark, RefreshCcw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PIE_COLORS = ['#111827', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const SummaryCard = ({ title, amount, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{amount}</h3>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center bg-white rounded-[24px] border border-gray-100 shadow-sm p-16 text-center">
    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
      <BarChart3 size={28} className="text-gray-400" strokeWidth={2} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">No analytics data available</h3>
    <p className="text-sm font-medium text-gray-500">Add transactions to start seeing your financial insights.</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm z-50 relative">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="font-medium text-gray-600">{entry.name}:</span>
            <span className="font-bold text-gray-900">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyOverview = ({ monthKey, rawAmountReceived, rawExpenses, rawSavings }) => {
  const currentMonthReceived = useMemo(() => rawAmountReceived.filter(r => r.received_date.startsWith(monthKey)), [rawAmountReceived, monthKey]);
  const currentMonthExpenses = useMemo(() => rawExpenses.filter(e => e.expense_date.startsWith(monthKey)), [rawExpenses, monthKey]);
  const currentMonthSavings = useMemo(() => rawSavings.filter(s => s.saving_date.startsWith(monthKey)), [rawSavings, monthKey]);

  const totalReceived = currentMonthReceived.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSavings = currentMonthSavings.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const availableBalance = totalReceived - totalExpenses - totalSavings;

  const cashFlowData = [
    { name: 'Amount Received', value: totalReceived },
    { name: 'Expenses', value: totalExpenses },
    { name: 'Savings', value: totalSavings }
  ];

  const ICONS_MAP = {
    "Food & Dining": Utensils,
    "Shopping": ShoppingBag,
    "Bills & Utilities": Zap,
    "Travel": Plane,
    "Entertainment": Film,
    "Health": Heart,
    "Education": Book,
    "Other": HelpCircle
  };

  const categories = useMemo(() => {
    const map = {};
    currentMonthExpenses.forEach(e => {
      if(!map[e.category]) map[e.category] = 0;
      map[e.category] += Number(e.amount);
    });
    return Object.keys(map).map(cat => ({
      name: cat,
      amount: map[cat],
      icon: ICONS_MAP[cat] || HelpCircle
    })).sort((a, b) => b.amount - a.amount);
  }, [currentMonthExpenses]);

  const savingsBreakdown = useMemo(() => {
    const SAVING_TYPE_MAP = { 'gold': 'Gold', 'silver': 'Silver', 'fixed_deposit': 'Fixed Deposit', 'recurring_deposit': 'Recurring Deposit' };
    const SAVINGS_ICON_MAP = { 'gold': Coins, 'silver': Database, 'fixed_deposit': Landmark, 'recurring_deposit': RefreshCcw };
    
    const map = {};
    currentMonthSavings.forEach(s => {
      const key = SAVING_TYPE_MAP[s.saving_type] || s.saving_type;
      if(!map[key]) map[key] = { amount: 0, icon: SAVINGS_ICON_MAP[s.saving_type] || Coins, name: key };
      map[key].amount += Number(s.amount);
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [currentMonthSavings]);

  const dailyExpenses = useMemo(() => {
    const map = {};
    currentMonthExpenses.forEach(e => {
      const d = parseInt(e.expense_date.split('-')[2], 10);
      if(!map[d]) map[d] = 0;
      map[d] += Number(e.amount);
    });
    const monthName = new Date(`${monthKey}-01`).toLocaleString('default', { month: 'short' });
    return Object.keys(map)
      .map(Number)
      .sort((a,b) => a-b)
      .map(day => ({ date: `${monthName} ${day}`, amount: map[day] }));
  }, [currentMonthExpenses, monthKey]);

  if (totalReceived === 0 && totalExpenses === 0 && totalSavings === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard title="Amount Received" amount={formatCurrency(totalReceived)} Icon={Wallet} />
        <SummaryCard title="Total Expenses" amount={formatCurrency(totalExpenses)} Icon={CreditCard} />
        <SummaryCard title="Total Savings" amount={formatCurrency(totalSavings)} Icon={PiggyBank} />
        <SummaryCard title="Available Balance" amount={formatCurrency(availableBalance)} Icon={Wallet} />
      </div>

      {/* Cash Flow Overview */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cash Flow Overview</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Your income, expenses and savings for the selected month.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {cashFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown & Rankings */}
      {totalExpenses > 0 && (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[1] bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Expense by Category</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-semibold text-gray-500">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
          {/* Simple Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {categories.slice(0,4).map((cat, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[12px] font-medium text-gray-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-[1] bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Top Spending Categories</h2>
          <div className="flex-1 flex flex-col gap-4">
            {categories.slice(0, 5).map((cat, index) => {
              const Icon = cat.icon;
              const percentage = Math.round((cat.amount / totalExpenses) * 100) || 0;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-5 text-sm font-bold text-gray-400 text-right">{index + 1}</div>
                  <div className="bg-gray-50 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-gray-800" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-semibold text-[14px] text-gray-900 truncate">{cat.name}</span>
                      <span className="font-bold text-[14px] text-gray-900">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Savings Analytics */}
      {totalSavings > 0 && (
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Savings Distribution</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={savingsBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {savingsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2">
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Savings</p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalSavings)}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savingsBreakdown.map((item, index) => {
                const Icon = item.icon;
                const percentage = Math.round((item.amount / totalSavings) * 100) || 0;
                return (
                  <div key={index} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-50 hover:border-gray-100 transition-colors">
                    <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                      <Icon size={18} className="text-gray-800" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-500">{item.name} ({percentage}%)</p>
                      <p className="text-[14px] font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Spending Trend */}
      {dailyExpenses.length > 0 && (
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Spending Trend</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Your daily expenses throughout the selected month.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" name="Expense" stroke="#111827" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#111827', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </div>
  );
};

const YearlyOverview = ({ yearKey, rawAmountReceived, rawExpenses, rawSavings }) => {
  const currentYearReceived = useMemo(() => rawAmountReceived.filter(r => r.received_date.startsWith(yearKey)), [rawAmountReceived, yearKey]);
  const currentYearExpenses = useMemo(() => rawExpenses.filter(e => e.expense_date.startsWith(yearKey)), [rawExpenses, yearKey]);
  const currentYearSavings = useMemo(() => rawSavings.filter(s => s.saving_date.startsWith(yearKey)), [rawSavings, yearKey]);

  const totalReceived = currentYearReceived.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenses = currentYearExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSavings = currentYearSavings.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const netBalance = totalReceived - totalExpenses - totalSavings;

  const months = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.map((name, index) => {
      const prefix = `${yearKey}-${String(index + 1).padStart(2, '0')}`;
      return {
        name,
        received: currentYearReceived.filter(r => r.received_date.startsWith(prefix)).reduce((acc, curr) => acc + Number(curr.amount), 0),
        expenses: currentYearExpenses.filter(e => e.expense_date.startsWith(prefix)).reduce((acc, curr) => acc + Number(curr.amount), 0),
        savings: currentYearSavings.filter(s => s.saving_date.startsWith(prefix)).reduce((acc, curr) => acc + Number(curr.amount), 0),
      };
    });
  }, [currentYearReceived, currentYearExpenses, currentYearSavings, yearKey]);

  const categories = useMemo(() => {
    const map = {};
    currentYearExpenses.forEach(e => {
      if(!map[e.category]) map[e.category] = 0;
      map[e.category] += Number(e.amount);
    });
    return Object.keys(map).map(name => ({ name, amount: map[name] })).sort((a, b) => b.amount - a.amount);
  }, [currentYearExpenses]);

  const savingsGrowth = useMemo(() => {
    let cumulative = 0;
    return months.map(m => {
      cumulative += m.savings;
      return { month: m.name, cumulative };
    });
  }, [months]);

  if (totalReceived === 0 && totalExpenses === 0 && totalSavings === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard title="Total Amount Received" amount={formatCurrency(totalReceived)} Icon={Wallet} />
        <SummaryCard title="Total Expenses" amount={formatCurrency(totalExpenses)} Icon={CreditCard} />
        <SummaryCard title="Total Savings" amount={formatCurrency(totalSavings)} Icon={PiggyBank} />
        <SummaryCard title="Net Available Balance" amount={formatCurrency(netBalance)} Icon={Wallet} />
      </div>

      {/* Monthly Financial Trend */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Monthly Financial Trend</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Amount received, expenses, and savings over the year.</p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }} />
              <Bar dataKey="received" name="Received" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="expenses" name="Expenses" fill="#6B7280" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="savings" name="Savings" fill="#D1D5DB" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Expense Breakdown */}
      {categories.length > 0 && (
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Yearly Expense Breakdown</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} width={120} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="amount" name="Expense" fill="#374151" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Yearly Savings Growth */}
      {totalSavings > 0 && (
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Yearly Savings Growth</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsGrowth} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative Savings" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" activeDot={{ r: 6, fill: '#111827', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </div>
  );
};

const Analytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('Monthly');
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });

  const [rawAmountReceived, setRawAmountReceived] = useState([]);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawSavings, setRawSavings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const [
        { data: aData, error: aError },
        { data: eData, error: eError },
        { data: sData, error: sError }
      ] = await Promise.all([
        supabase.from('amount_received').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('savings').select('*')
      ]);

      if (aError) throw aError;
      if (eError) throw eError;
      if (sError) throw sError;
      
      setRawAmountReceived(aData || []);
      setRawExpenses(eData || []);
      setRawSavings(sData || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load your analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading analytics...</p>
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
          onClick={fetchAnalyticsData}
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Analytics</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Understand your spending and savings patterns.</p>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-xl inline-flex w-max shadow-inner">
          <button 
            onClick={() => setPeriod('Monthly')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${period === 'Monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setPeriod('Yearly')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${period === 'Yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {period === 'Monthly' ? 'Monthly Overview' : 'Yearly Overview'}
        </h2>
        
        {period === 'Monthly' ? (
          <input 
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white border border-gray-200 py-2 px-4 rounded-full shadow-sm text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 w-max cursor-pointer"
          />
        ) : (
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-white border border-gray-200 py-2 px-4 rounded-full shadow-sm text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 w-max cursor-pointer"
          >
            {[2023, 2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {period === 'Monthly' ? (
        <MonthlyOverview 
          monthKey={selectedMonth} 
          rawAmountReceived={rawAmountReceived}
          rawExpenses={rawExpenses}
          rawSavings={rawSavings}
        />
      ) : (
        <YearlyOverview 
          yearKey={selectedYear} 
          rawAmountReceived={rawAmountReceived}
          rawExpenses={rawExpenses}
          rawSavings={rawSavings}
        />
      )}

    </div>
  );
};

export default Analytics;

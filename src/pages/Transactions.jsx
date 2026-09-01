import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Eye, Trash2, X, Download, 
  ArrowDownLeft, ArrowUpRight, PiggyBank,
  Wallet, CreditCard, Inbox, ChevronDown
} from 'lucide-react';

// --- Initial Data ---
const INITIAL_TRANSACTIONS = [
  { id: '1', date: '2025-05-31', type: 'amount_received', displayType: 'Amount Received', description: 'Monthly Salary', category: 'Company', amount: 50000, notes: '' },
  { id: '2', date: '2025-05-25', type: 'amount_received', displayType: 'Amount Received', description: 'Freelance Project', category: 'Client', amount: 5000, notes: '' },
  { id: '3', date: '2025-05-15', type: 'amount_received', displayType: 'Amount Received', description: 'Money Received', category: 'Friend', amount: 2000, notes: '' },
  
  { id: '4', date: '2025-05-30', type: 'expense', displayType: 'Expense', description: 'Dinner', category: 'Food & Dining', amount: 650, notes: '' },
  { id: '5', date: '2025-05-29', type: 'expense', displayType: 'Expense', description: 'Taxi', category: 'Travel', amount: 350, notes: '' },
  { id: '6', date: '2025-05-27', type: 'expense', displayType: 'Expense', description: 'Online Shopping', category: 'Shopping', amount: 2500, notes: '' },
  { id: '7', date: '2025-05-25', type: 'expense', displayType: 'Expense', description: 'Electricity Bill', category: 'Bills & Utilities', amount: 1800, notes: '' },
  
  { id: '8', date: '2025-05-28', type: 'savings', displayType: 'Savings', description: 'Gold Investment', category: 'Gold', amount: 6000, notes: '' },
  { id: '9', date: '2025-05-20', type: 'savings', displayType: 'Savings', description: 'Silver Investment', category: 'Silver', amount: 2000, notes: '' },
  { id: '10', date: '2025-01-01', type: 'savings', displayType: 'Savings', description: 'Fixed Deposit', category: 'Fixed Deposit', amount: 10000, notes: '' },
  { id: '11', date: '2025-04-01', type: 'savings', displayType: 'Savings', description: 'Recurring Deposit', category: 'Recurring Deposit', amount: 5000, notes: '' },
];

const CATEGORIES = [
  'Food & Dining', 'Travel', 'Shopping', 'Bills & Utilities', 
  'Entertainment', 'Health', 'Education', 'Other', 
  'Gold', 'Silver', 'Fixed Deposit', 'Recurring Deposit'
];

// --- Helper Functions ---
const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' }); 
};

const formatCurrency = (amount) => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
};

const isToday = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  return d.getUTCDate() === now.getUTCDate() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
};

const isThisWeek = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  const firstDay = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
  const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6)); // Saturday
  return d >= firstDay && d <= lastDay;
};

const isThisMonth = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  return d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
};

const isLastMonth = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getUTCMonth() === lastMonth.getMonth() && d.getUTCFullYear() === lastMonth.getFullYear();
};

// --- Sub-components ---
const SummaryCard = ({ title, amount, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{amount}</h3>
  </div>
);

const TypeIcon = ({ type }) => {
  if (type === 'amount_received') return <ArrowDownLeft size={14} className="text-emerald-600" strokeWidth={2.5} />;
  if (type === 'expense') return <ArrowUpRight size={14} className="text-rose-600" strokeWidth={2.5} />;
  if (type === 'savings') return <PiggyBank size={14} className="text-amber-500" strokeWidth={2.5} />;
  return null;
};

const Transactions = () => {
  // State
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('All Time');
  
  // Modal States
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Dropdown UI states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'All Types' || categoryFilter !== 'All Categories' || dateFilter !== 'All Time';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All Types');
    setCategoryFilter('All Categories');
    setDateFilter('All Time');
  };

  // Calculations
  const totalReceived = useMemo(() => transactions.filter(t => t.type === 'amount_received').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalSavings = useMemo(() => transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0), [transactions]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const s = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        (t.description?.toLowerCase().includes(s)) ||
        (t.category?.toLowerCase().includes(s)) ||
        (t.displayType?.toLowerCase().includes(s));
      
      const matchesType = typeFilter === 'All Types' || t.displayType === typeFilter;
      const matchesCategory = categoryFilter === 'All Categories' || t.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter === 'Today') matchesDate = isToday(t.date);
      if (dateFilter === 'This Week') matchesDate = isThisWeek(t.date);
      if (dateFilter === 'This Month') matchesDate = isThisMonth(t.date);
      if (dateFilter === 'Last Month') matchesDate = isLastMonth(t.date);

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateFilter]);

  // Handlers
  const handleDelete = () => {
    if (itemToDelete) {
      setTransactions(transactions.filter(t => t.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = ['Date', 'Type', 'Description', 'Category/Source', 'Amount'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.displayType,
      `"${t.description || ''}"`,
      `"${t.category || ''}"`,
      t.amount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Transactions</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">View and manage your complete financial activity.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-900 py-2.5 px-5 rounded-full shadow-sm hover:bg-gray-50 transition-all w-max h-max active:scale-[0.98]"
        >
          <Download size={16} strokeWidth={2.5} />
          <span className="text-[13px] font-bold">Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard title="Total Amount Received" amount={formatCurrency(totalReceived)} Icon={Wallet} />
        <SummaryCard title="Total Expenses" amount={formatCurrency(totalExpenses)} Icon={CreditCard} />
        <SummaryCard title="Total Savings" amount={formatCurrency(totalSavings)} Icon={PiggyBank} />
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
        
        {/* Filters Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Type Filter */}
              <div className="relative">
                <button 
                  onClick={() => {setIsTypeDropdownOpen(!isTypeDropdownOpen); setIsCategoryDropdownOpen(false); setIsDateDropdownOpen(false);}}
                  className={`flex items-center gap-2 border py-2 px-4 rounded-full transition-colors text-[13px] font-bold ${typeFilter !== 'All Types' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {typeFilter} <ChevronDown size={14} className={typeFilter !== 'All Types' ? 'text-gray-300' : 'text-gray-400'} />
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute right-0 lg:left-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 z-20">
                    {['All Types', 'Amount Received', 'Expense', 'Savings'].map(opt => (
                      <button key={opt} onClick={() => { setTypeFilter(opt); setIsTypeDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${typeFilter === opt ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative">
                <button 
                  onClick={() => {setIsCategoryDropdownOpen(!isCategoryDropdownOpen); setIsTypeDropdownOpen(false); setIsDateDropdownOpen(false);}}
                  className={`flex items-center gap-2 border py-2 px-4 rounded-full transition-colors text-[13px] font-bold ${categoryFilter !== 'All Categories' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {categoryFilter} <ChevronDown size={14} className={categoryFilter !== 'All Categories' ? 'text-gray-300' : 'text-gray-400'} />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute right-0 lg:left-0 mt-2 w-56 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 z-20 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {['All Categories', ...CATEGORIES].map(opt => (
                      <button key={opt} onClick={() => { setCategoryFilter(opt); setIsCategoryDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === opt ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="relative">
                <button 
                  onClick={() => {setIsDateDropdownOpen(!isDateDropdownOpen); setIsTypeDropdownOpen(false); setIsCategoryDropdownOpen(false);}}
                  className={`flex items-center gap-2 border py-2 px-4 rounded-full transition-colors text-[13px] font-bold ${dateFilter !== 'All Time' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {dateFilter} <ChevronDown size={14} className={dateFilter !== 'All Time' ? 'text-gray-300' : 'text-gray-400'} />
                </button>
                {isDateDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 z-20">
                    {['All Time', 'Today', 'This Week', 'This Month', 'Last Month'].map(opt => (
                      <button key={opt} onClick={() => { setDateFilter(opt); setIsDateDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === opt ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-full text-[13px] font-bold text-gray-500 hover:text-gray-900 transition-colors ml-1"
                >
                  <X size={14} strokeWidth={2.5} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[950px] w-full">
            <div className="grid grid-cols-12 items-center pb-4 border-b border-gray-100 px-2">
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider pl-2">Date</div>
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Type</div>
              <div className="col-span-3 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Description</div>
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Category / Source</div>
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-right pr-4">Amount</div>
              <div className="col-span-1 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-center">Actions</div>
            </div>
            
            <div className="flex flex-col mt-2">
              {filteredTransactions.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Inbox size={24} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No transactions found</h3>
                  <p className="text-sm font-medium text-gray-500">Try adjusting your filters or search.</p>
                </div>
              ) : (
                filteredTransactions.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
                    
                    <div className="col-span-2 text-[13px] font-medium text-gray-600 pl-2">
                      {formatDateDisplay(item.date)}
                    </div>

                    <div className="col-span-2 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        item.type === 'amount_received' ? 'bg-emerald-50 border-emerald-100' :
                        item.type === 'expense' ? 'bg-rose-50 border-rose-100' :
                        'bg-amber-50 border-amber-100'
                      }`}>
                        <TypeIcon type={item.type} />
                      </div>
                      <span className={`text-[13px] font-semibold ${
                        item.type === 'amount_received' ? 'text-emerald-600' :
                        item.type === 'expense' ? 'text-rose-600' :
                        'text-amber-500'
                      }`}>{item.displayType}</span>
                    </div>
                    
                    <div className="col-span-3 pr-4">
                      <span className="text-[14px] font-bold text-gray-900 tracking-tight">{item.description}</span>
                    </div>

                    <div className="col-span-2 pr-4">
                      <span className="text-[13px] font-semibold text-gray-600">{item.category}</span>
                    </div>
                    
                    <div className={`col-span-2 text-[14px] font-bold text-right pr-4 tracking-tight ${
                      item.type === 'amount_received' ? 'text-emerald-600' :
                      item.type === 'expense' ? 'text-rose-600' :
                      'text-amber-500'
                    }`}>
                      {item.type === 'amount_received' ? `+ ${formatCurrency(item.amount)}` : `- ${formatCurrency(item.amount)}`}
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setViewingTransaction(item)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => setItemToDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* View Details Modal */}
      {viewingTransaction && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Transaction Details</h2>
              <button onClick={() => setViewingTransaction(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gray-50/30">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                <TypeIcon type={viewingTransaction.type} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                {viewingTransaction.type === 'amount_received' ? `+ ${formatCurrency(viewingTransaction.amount)}` : `- ${formatCurrency(viewingTransaction.amount)}`}
              </h3>
              <p className="text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{viewingTransaction.displayType}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-[14px] font-bold text-gray-900">{viewingTransaction.description}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category / Source</p>
                <p className="text-[14px] font-bold text-gray-900">{viewingTransaction.category}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-[14px] font-bold text-gray-900">{formatDateDisplay(viewingTransaction.date)}</p>
              </div>
              {viewingTransaction.notes && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-[14px] font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{viewingTransaction.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 pt-2">
              <button 
                onClick={() => setViewingTransaction(null)}
                className="w-full py-3 rounded-full text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 size={24} className="text-red-500" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Transaction</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;

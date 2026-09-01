import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Pencil, Trash2, X,
  PiggyBank, Coins, Landmark, RefreshCcw, Database, ChevronRight,
  Wallet
} from 'lucide-react';

// --- Constants & Initial Data ---

const SAVINGS_TYPES = {
  GOLD: 'Gold',
  SILVER: 'Silver',
  FD: 'Fixed Deposit',
  RD: 'Recurring Deposit'
};

const INITIAL_SAVINGS = [
  { 
    id: '1', type: SAVINGS_TYPES.GOLD, 
    description: 'Gold Investment', date: '2025-05-28', amount: 6000 
  },
  { 
    id: '2', type: SAVINGS_TYPES.GOLD, 
    description: 'Gold Savings', date: '2025-05-10', amount: 4000 
  },
  { 
    id: '3', type: SAVINGS_TYPES.SILVER, 
    description: 'Silver Investment', date: '2025-05-20', amount: 2000 
  },
  { 
    id: '4', type: SAVINGS_TYPES.FD, 
    bank: 'SBI', startDate: '2025-01-01', maturityDate: '2026-01-01', 
    interestRate: 7, amount: 10000 
  },
  { 
    id: '5', type: SAVINGS_TYPES.RD, 
    bank: 'HDFC', startDate: '2025-04-01', maturityDate: '2026-04-01', 
    monthlyDeposit: 2500, interestRate: 6.5, currentTotal: 5000 
  }
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

const getSavingsAmount = (item) => {
  if (item.type === SAVINGS_TYPES.RD) return Number(item.currentTotal || 0);
  return Number(item.amount || 0);
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

const CategoryCard = ({ type, icon: Icon, totalAmount, count, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-6 rounded-[24px] border transition-all flex flex-col shadow-sm
      ${isActive 
        ? 'bg-gray-900 border-gray-900 text-white ring-4 ring-gray-900/10' 
        : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-900'
      }`}
  >
    <div className="flex items-center justify-between w-full mb-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isActive ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
        <Icon size={22} className={isActive ? 'text-white' : 'text-gray-800'} strokeWidth={2} />
      </div>
      <ChevronRight size={20} className={isActive ? 'text-gray-400' : 'text-gray-400'} />
    </div>
    <p className={`text-sm font-semibold mb-1 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>{type}</p>
    <h3 className="text-2xl font-bold tracking-tight mb-2">{formatCurrency(totalAmount)}</h3>
    <span className={`text-[13px] font-semibold ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
      {count} {count === 1 ? 'entry' : 'entries'}
    </span>
  </button>
);

const TYPE_MAPPING = {
  'gold': SAVINGS_TYPES.GOLD,
  'silver': SAVINGS_TYPES.SILVER,
  'fd': SAVINGS_TYPES.FD,
  'rd': SAVINGS_TYPES.RD
};

const Savings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [savings, setSavings] = useState(INITIAL_SAVINGS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryType = searchParams.get('type');
  const initialCategory = queryType && TYPE_MAPPING[queryType] ? TYPE_MAPPING[queryType] : 'All Savings';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Sync category state with URL if it changes externally
  useEffect(() => {
    if (queryType && TYPE_MAPPING[queryType]) {
      setSelectedCategory(TYPE_MAPPING[queryType]);
    } else {
      setSelectedCategory('All Savings');
    }
  }, [queryType]);

  // Modals
  const [isTypeSelectModalOpen, setIsTypeSelectModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form State
  const [formType, setFormType] = useState(null); // Which type of savings is being added/edited
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);

  // Calculations
  const goldTotal = useMemo(() => savings.filter(s => s.type === SAVINGS_TYPES.GOLD).reduce((sum, s) => sum + getSavingsAmount(s), 0), [savings]);
  const silverTotal = useMemo(() => savings.filter(s => s.type === SAVINGS_TYPES.SILVER).reduce((sum, s) => sum + getSavingsAmount(s), 0), [savings]);
  const fdTotal = useMemo(() => savings.filter(s => s.type === SAVINGS_TYPES.FD).reduce((sum, s) => sum + getSavingsAmount(s), 0), [savings]);
  const rdTotal = useMemo(() => savings.filter(s => s.type === SAVINGS_TYPES.RD).reduce((sum, s) => sum + getSavingsAmount(s), 0), [savings]);
  const totalSavings = goldTotal + silverTotal + fdTotal + rdTotal;
  
  const counts = useMemo(() => {
    return {
      [SAVINGS_TYPES.GOLD]: savings.filter(s => s.type === SAVINGS_TYPES.GOLD).length,
      [SAVINGS_TYPES.SILVER]: savings.filter(s => s.type === SAVINGS_TYPES.SILVER).length,
      [SAVINGS_TYPES.FD]: savings.filter(s => s.type === SAVINGS_TYPES.FD).length,
      [SAVINGS_TYPES.RD]: savings.filter(s => s.type === SAVINGS_TYPES.RD).length,
    };
  }, [savings]);

  // Filtered List
  const filteredSavings = useMemo(() => {
    return savings.filter(item => {
      const matchesCategory = selectedCategory === 'All Savings' || item.type === selectedCategory;
      const searchStr = searchQuery.toLowerCase();
      const name = item.description || item.bank || '';
      const matchesSearch = name.toLowerCase().includes(searchStr);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => new Date(b.date || b.startDate) - new Date(a.date || a.startDate));
  }, [savings, selectedCategory, searchQuery]);

  // Handlers
  const handleCategoryClick = (type) => {
    if (selectedCategory === type) {
      setSelectedCategory('All Savings');
      setSearchParams({});
    } else {
      setSelectedCategory(type);
      const key = Object.keys(TYPE_MAPPING).find(k => TYPE_MAPPING[k] === type);
      if (key) setSearchParams({ type: key });
    }
  };

  const openTypeSelection = () => {
    setIsTypeSelectModalOpen(true);
  };

  const openForm = (type, existingItem = null) => {
    setFormType(type);
    if (existingItem) {
      setEditingId(existingItem.id);
      setFormData({ ...existingItem });
    } else {
      setEditingId(null);
      // Initialize defaults based on type
      if (type === SAVINGS_TYPES.GOLD || type === SAVINGS_TYPES.SILVER) {
        setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0], quantity: '', notes: '' });
      } else if (type === SAVINGS_TYPES.FD) {
        setFormData({ bank: '', amount: '', interestRate: '', startDate: new Date().toISOString().split('T')[0], maturityDate: '', expectedAmount: '', notes: '' });
      } else if (type === SAVINGS_TYPES.RD) {
        setFormData({ bank: '', monthlyDeposit: '', interestRate: '', startDate: new Date().toISOString().split('T')[0], maturityDate: '', currentTotal: '', notes: '' });
      }
    }
    setIsTypeSelectModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let finalData = { ...formData, type: formType };
    
    // Auto-fill currentTotal for RD if new
    if (formType === SAVINGS_TYPES.RD && !editingId && !finalData.currentTotal) {
      finalData.currentTotal = finalData.monthlyDeposit;
    }

    if (editingId) {
      setSavings(savings.map(s => s.id === editingId ? { ...finalData, id: s.id } : s));
    } else {
      setSavings([...savings, { ...finalData, id: Date.now().toString() }]);
    }
    setIsFormModalOpen(false);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setSavings(savings.filter(s => s.id !== itemToDelete));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const renderFormFields = () => {
    if (formType === SAVINGS_TYPES.GOLD || formType === SAVINGS_TYPES.SILVER) {
      return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Description *</label>
            <input
              type="text" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder={`e.g. ${formType} investment`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Amount *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">₹</span>
                <input
                  type="number" required min="0" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Date *</label>
              <input
                type="date" required value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Quantity <span className="text-gray-400 font-medium">(Optional)</span></label>
            <input
              type="text" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="e.g. 10g, 1 coin"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Notes <span className="text-gray-400 font-medium">(Optional)</span></label>
            <textarea
              rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all resize-none"
            ></textarea>
          </div>
        </>
      );
    }

    if (formType === SAVINGS_TYPES.FD) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Bank Name *</label>
              <input
                type="text" required value={formData.bank || ''} onChange={e => setFormData({...formData, bank: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
                placeholder="e.g. SBI"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Deposit Amount *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">₹</span>
                <input
                  type="number" required min="0" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Interest Rate (%) *</label>
            <input
              type="number" required min="0" step="0.01" value={formData.interestRate || ''} onChange={e => setFormData({...formData, interestRate: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
              placeholder="e.g. 7"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Start Date *</label>
              <input
                type="date" required value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Maturity Date *</label>
              <input
                type="date" required value={formData.maturityDate || ''} onChange={e => setFormData({...formData, maturityDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Expected Maturity Amount <span className="text-gray-400 font-medium">(Optional)</span></label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">₹</span>
                <input
                  type="number" min="0" step="0.01" value={formData.expectedAmount || ''} onChange={e => setFormData({...formData, expectedAmount: e.target.value})}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
                />
              </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Notes <span className="text-gray-400 font-medium">(Optional)</span></label>
            <textarea
              rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 resize-none"
            ></textarea>
          </div>
        </>
      );
    }

    if (formType === SAVINGS_TYPES.RD) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Bank Name *</label>
              <input
                type="text" required value={formData.bank || ''} onChange={e => setFormData({...formData, bank: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Monthly Deposit *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">₹</span>
                <input
                  type="number" required min="0" step="0.01" value={formData.monthlyDeposit || ''} onChange={e => setFormData({...formData, monthlyDeposit: e.target.value})}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Interest Rate (%) *</label>
            <input
              type="number" required min="0" step="0.01" value={formData.interestRate || ''} onChange={e => setFormData({...formData, interestRate: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Start Date *</label>
              <input
                type="date" required value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Maturity Date *</label>
              <input
                type="date" required value={formData.maturityDate || ''} onChange={e => setFormData({...formData, maturityDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Current Total Deposited *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">₹</span>
              <input
                type="number" required min="0" step="0.01" value={formData.currentTotal || ''} onChange={e => setFormData({...formData, currentTotal: e.target.value})}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900"
                placeholder={formData.monthlyDeposit ? "Defaults to Monthly Deposit" : "Amount currently invested"}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Notes <span className="text-gray-400 font-medium">(Optional)</span></label>
            <textarea
              rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 resize-none"
            ></textarea>
          </div>
        </>
      );
    }
    return null;
  };

  const renderTableDetails = (item) => {
    if (item.type === SAVINGS_TYPES.GOLD || item.type === SAVINGS_TYPES.SILVER) {
      return item.quantity ? `Quantity: ${item.quantity}` : `${item.type} Investment`;
    }
    if (item.type === SAVINGS_TYPES.FD) {
      return `${item.bank} • ${item.interestRate}% interest`;
    }
    if (item.type === SAVINGS_TYPES.RD) {
      return `${item.bank} • ₹${item.monthlyDeposit}/month • ${item.interestRate}%`;
    }
    return '-';
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">My Savings</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage and track your savings and investments in one place.</p>
        </div>
        
        <button 
          onClick={openTypeSelection}
          className="flex items-center gap-2 bg-gray-900 text-white py-2.5 px-5 rounded-full shadow-sm hover:bg-black transition-all w-max h-max active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="text-[13px] font-bold">Add Savings</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard title="Total Savings" amount={formatCurrency(totalSavings)} Icon={PiggyBank} />
        <SummaryCard title="Gold" amount={formatCurrency(goldTotal)} Icon={Coins} />
        <SummaryCard title="Silver" amount={formatCurrency(silverTotal)} Icon={Database} />
        <SummaryCard title="FD + RD" amount={formatCurrency(fdTotal + rdTotal)} Icon={Landmark} />
      </div>

      {/* Savings Category Overview */}
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Savings Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CategoryCard 
            type={SAVINGS_TYPES.GOLD} icon={Coins} 
            totalAmount={goldTotal} count={counts[SAVINGS_TYPES.GOLD]}
            isActive={selectedCategory === SAVINGS_TYPES.GOLD}
            onClick={() => handleCategoryClick(SAVINGS_TYPES.GOLD)}
          />
          <CategoryCard 
            type={SAVINGS_TYPES.SILVER} icon={Database} 
            totalAmount={silverTotal} count={counts[SAVINGS_TYPES.SILVER]}
            isActive={selectedCategory === SAVINGS_TYPES.SILVER}
            onClick={() => handleCategoryClick(SAVINGS_TYPES.SILVER)}
          />
          <CategoryCard 
            type={SAVINGS_TYPES.FD} icon={Landmark} 
            totalAmount={fdTotal} count={counts[SAVINGS_TYPES.FD]}
            isActive={selectedCategory === SAVINGS_TYPES.FD}
            onClick={() => handleCategoryClick(SAVINGS_TYPES.FD)}
          />
          <CategoryCard 
            type={SAVINGS_TYPES.RD} icon={RefreshCcw} 
            totalAmount={rdTotal} count={counts[SAVINGS_TYPES.RD]}
            isActive={selectedCategory === SAVINGS_TYPES.RD}
            onClick={() => handleCategoryClick(SAVINGS_TYPES.RD)}
          />
        </div>
      </div>

      {/* Entries Section */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {selectedCategory === 'All Savings' ? 'All Savings' : 
             selectedCategory === SAVINGS_TYPES.FD ? 'Fixed Deposits' : 
             selectedCategory === SAVINGS_TYPES.RD ? 'Recurring Deposits' : 
             `${selectedCategory} Savings`}
          </h2>
          
          <div className="relative w-full lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search savings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[900px] w-full">
            <div className="grid grid-cols-12 items-center pb-4 border-b border-gray-100 px-2">
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider pl-2">Type</div>
              <div className="col-span-3 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Name / Description</div>
              <div className="col-span-3 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Details</div>
              <div className="col-span-1 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Date</div>
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-right pr-4">Amount</div>
              <div className="col-span-1 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-center">Actions</div>
            </div>
            
            <div className="flex flex-col mt-2">
              {filteredSavings.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-medium text-sm">
                  No savings found in this category.
                </div>
              ) : (
                filteredSavings.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
                    
                    <div className="col-span-2 flex items-center gap-3 pl-2">
                      <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100">
                        {item.type === SAVINGS_TYPES.GOLD && <Coins size={14} className="text-gray-700" strokeWidth={2.5} />}
                        {item.type === SAVINGS_TYPES.SILVER && <Database size={14} className="text-gray-700" strokeWidth={2.5} />}
                        {item.type === SAVINGS_TYPES.FD && <Landmark size={14} className="text-gray-700" strokeWidth={2.5} />}
                        {item.type === SAVINGS_TYPES.RD && <RefreshCcw size={14} className="text-gray-700" strokeWidth={2.5} />}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700">{item.type}</span>
                    </div>
                    
                    <div className="col-span-3 pr-4">
                      <span className="text-[14px] font-bold text-gray-900 tracking-tight">{item.description || item.bank}</span>
                    </div>

                    <div className="col-span-3 pr-4">
                      <span className="text-[13px] font-medium text-gray-500">{renderTableDetails(item)}</span>
                    </div>

                    <div className="col-span-1 text-[13px] font-medium text-gray-600">
                      {formatDateDisplay(item.date || item.startDate)}
                    </div>
                    
                    <div className="col-span-2 text-[14px] font-bold text-right text-gray-900 pr-4 tracking-tight">
                      {formatCurrency(getSavingsAmount(item))}
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button 
                        onClick={() => openForm(item.type, item)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil size={16} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* STEP 1: Select Savings Type */}
      {isTypeSelectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add to Savings</h2>
              <button onClick={() => setIsTypeSelectModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-4">
              {[
                { type: SAVINGS_TYPES.GOLD, icon: Coins, desc: "Track your gold investments" },
                { type: SAVINGS_TYPES.SILVER, icon: Database, desc: "Track your silver investments" },
                { type: SAVINGS_TYPES.FD, icon: Landmark, desc: "Track fixed deposits and maturity" },
                { type: SAVINGS_TYPES.RD, icon: RefreshCcw, desc: "Track monthly recurring deposits" }
              ].map(opt => (
                <button 
                  key={opt.type}
                  onClick={() => openForm(opt.type)}
                  className="w-full flex items-center gap-4 p-4 rounded-[18px] border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors border border-gray-100">
                    <opt.icon size={22} className="text-gray-800" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-gray-900">{opt.type}</h4>
                    <p className="text-sm font-medium text-gray-500">{opt.desc}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-900" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {editingId ? `Edit ${formType}` : `Add ${formType}`}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <form id="savings-form" onSubmit={handleFormSubmit} className="space-y-5">
                {renderFormFields()}
              </form>
            </div>
            
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 mt-auto">
              <button 
                type="button" onClick={() => setIsFormModalOpen(false)}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" form="savings-form"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-black"
              >
                {editingId ? 'Save Changes' : `Add ${formType === SAVINGS_TYPES.FD || formType === SAVINGS_TYPES.RD ? 'Deposit' : formType}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 size={24} className="text-red-500" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Savings Entry</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Are you sure you want to delete this savings entry? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
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

export default Savings;

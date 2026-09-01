import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Pencil, Trash2, X,
  Utensils, Car, ShoppingBag, Receipt, Film, 
  HeartPulse, GraduationCap, MoreHorizontal,
  CreditCard, Calendar, Hash, ChevronDown
} from 'lucide-react';

// --- Constants & Mock Data ---

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Travel': Car,
  'Shopping': ShoppingBag,
  'Bills & Utilities': Receipt,
  'Entertainment': Film,
  'Health': HeartPulse,
  'Education': GraduationCap,
  'Other': MoreHorizontal,
};

const CATEGORIES = Object.keys(CATEGORY_ICONS);

const INITIAL_EXPENSES = [
  { id: '1', date: '2025-05-30', name: 'Dinner', category: 'Food & Dining', amount: 650, notes: '' },
  { id: '2', date: '2025-05-29', name: 'Taxi', category: 'Travel', amount: 350, notes: '' },
  { id: '3', date: '2025-05-27', name: 'Online Shopping', category: 'Shopping', amount: 2500, notes: '' },
  { id: '4', date: '2025-05-25', name: 'Electricity Bill', category: 'Bills & Utilities', amount: 1800, notes: '' },
  { id: '5', date: '2025-05-22', name: 'Movie', category: 'Entertainment', amount: 500, notes: '' },
  { id: '6', date: '2025-05-20', name: 'Doctor Visit', category: 'Health', amount: 1200, notes: '' },
  { id: '7', date: '2025-05-18', name: 'Course Fee', category: 'Education', amount: 3000, notes: '' },
  { id: '8', date: '2025-05-15', name: 'Miscellaneous', category: 'Other', amount: 750, notes: '' },
];

// --- Helper Functions ---

const formatDateDisplay = (dateString) => {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const date = new Date(dateString);
  // Using UTC to avoid timezone shifts changing the displayed date from the input string
  return date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' }); 
};

const formatCurrency = (amount) => {
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const isCurrentMonth = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const isLastMonth = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
};

// --- Components ---

const SummaryCard = ({ title, amount, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{amount}</h3>
  </div>
);

const Expenses = () => {
  // State
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form State
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Derived State (Summaries)
  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  , [expenses]);

  const thisMonthExpenses = useMemo(() => 
    expenses.filter(exp => isCurrentMonth(exp.date)).reduce((sum, exp) => sum + Number(exp.amount), 0)
  , [expenses]);

  const numberOfExpenses = expenses.length;

  // Derived State (Filtered List)
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || exp.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter === 'This Month') matchesDate = isCurrentMonth(exp.date);
      if (dateFilter === 'Last Month') matchesDate = isLastMonth(exp.date);

      return matchesSearch && matchesCategory && matchesDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first
  }, [expenses, searchQuery, categoryFilter, dateFilter]);

  // Handlers
  const openAddModal = () => {
    setEditingExpenseId(null);
    setFormData({
      name: '',
      amount: '',
      category: CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsExpenseModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpenseId(expense.id);
    setFormData({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || ''
    });
    setIsExpenseModalOpen(true);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (editingExpenseId) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpenseId ? { ...formData, id: exp.id } : exp
      ));
    } else {
      setExpenses([...expenses, { ...formData, id: Date.now().toString() }]);
    }
    setIsExpenseModalOpen(false);
  };

  const confirmDelete = (id) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setExpenses(expenses.filter(exp => exp.id !== expenseToDelete));
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Expenses</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Track and manage where your money goes.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 text-white py-2.5 px-5 rounded-full shadow-sm hover:bg-black transition-all w-max h-max active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="text-[13px] font-bold">Add Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SummaryCard title="Total Expenses" amount={formatCurrency(totalExpenses)} Icon={CreditCard} />
        <SummaryCard title="This Month" amount={formatCurrency(thisMonthExpenses)} Icon={Calendar} />
        <SummaryCard title="Number of Expenses" amount={numberOfExpenses.toString()} Icon={Hash} />
      </div>

      {/* Expense Management Section */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
        
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">All Expenses</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-full hover:bg-gray-100 transition-colors w-full sm:w-max justify-center"
              >
                <Filter size={16} className="text-gray-600" />
                <span className="text-[13px] font-bold text-gray-900">Filter</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 z-20">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</div>
                  {['All Time', 'This Month', 'Last Month'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setDateFilter(opt); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === opt ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                  <div className="px-3 py-2 mt-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100">Category</div>
                  {['All Categories', ...CATEGORIES].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setCategoryFilter(opt); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === opt ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[800px] w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center pb-4 border-b border-gray-100 px-2">
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Date</div>
              <div className="col-span-4 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Expense</div>
              <div className="col-span-3 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Category</div>
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-right pr-4">Amount</div>
              <div className="col-span-1 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-center">Actions</div>
            </div>
            
            {/* Table Rows */}
            <div className="flex flex-col mt-2">
              {filteredExpenses.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-medium text-sm">
                  No expenses found. Try adjusting your search or filters.
                </div>
              ) : (
                filteredExpenses.map((expense) => {
                  const CatIcon = CATEGORY_ICONS[expense.category] || MoreHorizontal;
                  return (
                    <div key={expense.id} className="grid grid-cols-12 items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
                      <div className="col-span-2 text-[13px] font-medium text-gray-600">
                        {formatDateDisplay(expense.date)}
                      </div>
                      
                      <div className="col-span-4 pr-4">
                        <span className="text-[14px] font-bold text-gray-900 tracking-tight">{expense.name}</span>
                        {expense.notes && <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{expense.notes}</p>}
                      </div>
                      
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100">
                          <CatIcon size={14} className="text-gray-700" strokeWidth={2.5} />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-700">{expense.category}</span>
                      </div>
                      
                      <div className="col-span-2 text-[14px] font-bold text-right text-gray-900 pr-4 tracking-tight">
                        {formatCurrency(expense.amount)}
                      </div>
                      
                      <div className="col-span-1 flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(expense)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Add/Edit Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <form id="expense-form" onSubmit={handleExpenseSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Expense Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="e.g. Lunch, Electricity Bill"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Amount *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">₹</span>
                      </div>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Category *</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Notes <span className="text-gray-400 font-medium">(Optional)</span></label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 mt-auto">
              <button 
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="expense-form"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-sm"
              >
                {editingExpenseId ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 size={24} className="text-red-500" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Expense</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-full text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Expenses;

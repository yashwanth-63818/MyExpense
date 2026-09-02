import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronDown, Plus, Wallet, CreditCard, Target,
  Utensils, Plane, ShoppingBag, Zap, Film, Heart, Book, HelpCircle,
  Pencil, Trash2, X
} from 'lucide-react';

const CATEGORIES = [
  { name: "Food & Dining", icon: Utensils },
  { name: "Travel", icon: Plane },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Bills & Utilities", icon: Zap },
  { name: "Entertainment", icon: Film },
  { name: "Health", icon: Heart },
  { name: "Education", icon: Book },
  { name: "Other", icon: HelpCircle },
];

const INITIAL_DATA = {
  "2025-05": {
    monthlyBudget: 25000,
    categories: [
      { id: 1, category: "Food & Dining", budget: 5000, spent: 3500 },
      { id: 2, category: "Travel", budget: 3000, spent: 1500 },
      { id: 3, category: "Shopping", budget: 5000, spent: 2500 },
      { id: 4, category: "Bills & Utilities", budget: 4000, spent: 2000 },
      { id: 5, category: "Entertainment", budget: 2000, spent: 1000 },
      { id: 6, category: "Health", budget: 3000, spent: 1000 },
      { id: 7, category: "Education", budget: 3000, spent: 500 },
    ]
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const SummaryCard = ({ title, amount, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col h-full">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{amount}</h3>
  </div>
);

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl relative">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
        <X size={20} strokeWidth={2.5} />
      </button>
      {children}
    </div>
  </div>
);

const Budget = () => {
  const [budgetData, setBudgetData] = useState(INITIAL_DATA);
  const [selectedMonth, setSelectedMonth] = useState("2025-05");
  const [filter, setFilter] = useState('All');

  // Modal states
  const [isSetBudgetModalOpen, setIsSetBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // Form states
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState("");
  const [budgetMonthInput, setBudgetMonthInput] = useState("2025-05");
  const [budgetNotesInput, setBudgetNotesInput] = useState("");

  const [categoryInput, setCategoryInput] = useState("Food & Dining");
  const [categoryBudgetInput, setCategoryBudgetInput] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Derived state
  const currentData = budgetData[selectedMonth] || { monthlyBudget: 0, categories: [] };
  const totalBudget = currentData.monthlyBudget;
  const totalSpent = currentData.categories.reduce((acc, cat) => acc + cat.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  const filteredCategories = useMemo(() => {
    return currentData.categories.filter(cat => {
      const pct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
      if (filter === 'All') return true;
      if (filter === 'On Track') return pct < 80;
      if (filter === 'Near Limit') return pct >= 80 && pct <= 100;
      if (filter === 'Over Budget') return pct > 100;
      return true;
    });
  }, [currentData.categories, filter]);

  // Handlers
  const openSetBudgetModal = () => {
    setMonthlyBudgetInput(totalBudget.toString());
    setBudgetMonthInput(selectedMonth);
    setBudgetNotesInput("");
    setIsSetBudgetModalOpen(true);
  };

  const handleSetBudget = () => {
    const amount = parseFloat(monthlyBudgetInput);
    if (isNaN(amount) || amount < 0) return;

    setBudgetData(prev => {
      const monthData = prev[budgetMonthInput] || { categories: [] };
      return {
        ...prev,
        [budgetMonthInput]: {
          ...monthData,
          monthlyBudget: amount
        }
      };
    });
    setSelectedMonth(budgetMonthInput);
    setIsSetBudgetModalOpen(false);
  };

  const openAddCategoryModal = () => {
    setCategoryModalMode('add');
    setCategoryInput(CATEGORIES[0].name);
    setCategoryBudgetInput("");
    setCategoryError("");
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setCategoryModalMode('edit');
    setEditingCategoryId(cat.id);
    setCategoryInput(cat.category);
    setCategoryBudgetInput(cat.budget.toString());
    setCategoryError("");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryBudget = () => {
    const amount = parseFloat(categoryBudgetInput);
    if (isNaN(amount) || amount < 0) return;

    setBudgetData(prev => {
      const monthData = prev[selectedMonth] || { monthlyBudget: 0, categories: [] };
      const categories = [...monthData.categories];
      
      if (categoryModalMode === 'add') {
        if (categories.some(c => c.category === categoryInput)) {
          setCategoryError("A budget for this category already exists in this month.");
          return prev;
        }
        categories.push({
          id: Date.now(),
          category: categoryInput,
          budget: amount,
          spent: 0 // default for now
        });
      } else {
        const index = categories.findIndex(c => c.id === editingCategoryId);
        if (index > -1) {
          // Check duplicate only if we changed the category name
          if (categories[index].category !== categoryInput && categories.some(c => c.category === categoryInput)) {
            setCategoryError("A budget for this category already exists in this month.");
            return prev;
          }
          categories[index] = { ...categories[index], category: categoryInput, budget: amount };
        }
      }

      setIsCategoryModalOpen(false);
      return {
        ...prev,
        [selectedMonth]: {
          ...monthData,
          categories
        }
      };
    });
  };

  const confirmDeleteCategory = (id) => {
    setDeletingCategoryId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = () => {
    setBudgetData(prev => {
      const monthData = prev[selectedMonth];
      return {
        ...prev,
        [selectedMonth]: {
          ...monthData,
          categories: monthData.categories.filter(c => c.id !== deletingCategoryId)
        }
      };
    });
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Budget</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Plan your spending and stay in control of your monthly finances.</p>
        </div>
        
        <button 
          onClick={openSetBudgetModal}
          className="flex items-center gap-2 bg-gray-900 text-white py-2.5 px-5 rounded-full font-bold text-[13px] hover:bg-gray-800 transition-colors w-max shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          Set Budget
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex">
        <button className="flex items-center gap-2.5 bg-white border border-gray-200 py-2.5 px-4 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all w-max">
          <Calendar size={16} className="text-gray-600" strokeWidth={2.5} />
          <select 
            className="text-[13px] font-bold text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-1"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="2025-04">Apr 2025</option>
            <option value="2025-05">May 2025</option>
            <option value="2025-06">Jun 2025</option>
          </select>
          <ChevronDown size={14} className="text-gray-500 pointer-events-none" strokeWidth={2.5} />
        </button>
      </div>

      {/* Overall Budget Overview & Summary Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Budget Overview Card */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Monthly Budget</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalBudget)}</h2>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Spent</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Remaining</p>
                <p className={`text-xl font-bold ${isOverBudget ? 'text-gray-900' : 'text-gray-900'}`}>{formatCurrency(remainingBudget)}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-900">{Math.min(Math.round(overallPercentage), 100)}% Used</span>
              {isOverBudget && (
                <span className="text-sm font-bold text-gray-900">{formatCurrency(Math.abs(remainingBudget))} over budget</span>
              )}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${isOverBudget ? 'bg-gray-900' : 'bg-gray-800'}`} 
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCard title="Total Budget" amount={formatCurrency(totalBudget)} Icon={Target} />
        <SummaryCard title="Total Spent" amount={formatCurrency(totalSpent)} Icon={CreditCard} />
        <SummaryCard title="Remaining Budget" amount={formatCurrency(remainingBudget)} Icon={Wallet} />
      </div>

      {/* Category Budgets */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Category Budgets</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Track your spending across different categories.</p>
          </div>
          <button 
            onClick={openAddCategoryModal}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 py-2 px-4 rounded-full font-bold text-[13px] text-gray-900 hover:bg-gray-100 hover:border-gray-300 transition-colors w-max"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Category Budget
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'On Track', 'Near Limit', 'Over Budget'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border ${
                filter === f 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Categories List */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {filteredCategories.map(cat => {
              const categoryConfig = CATEGORIES.find(c => c.name === cat.category) || CATEGORIES[CATEGORIES.length - 1];
              const Icon = categoryConfig.icon;
              const remaining = cat.budget - cat.spent;
              const pct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
              const isCatOverBudget = cat.spent > cat.budget;

              return (
                <div key={cat.id} className="bg-white border border-gray-100 p-5 rounded-[20px] shadow-sm hover:border-gray-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-gray-800" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-[15px]">{cat.category}</h3>
                        <p className="text-[12px] font-semibold text-gray-500">
                          {formatCurrency(cat.spent)} spent of {formatCurrency(cat.budget)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditCategoryModal(cat)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => confirmDeleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isCatOverBudget ? 'bg-gray-900' : 'bg-gray-800'}`} 
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[12px] font-bold">
                    <span className="text-gray-900">{Math.min(Math.round(pct), 100)}% used</span>
                    <span className={isCatOverBudget ? 'text-gray-900' : 'text-gray-500'}>
                      {isCatOverBudget ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center bg-gray-50/50 rounded-[20px] border border-dashed border-gray-200 py-16 px-4 text-center">
            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <Target size={24} className="text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No category budgets found</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 max-w-sm">Create a category budget to start tracking your spending and stay within your limits.</p>
            <button 
              onClick={openAddCategoryModal}
              className="flex items-center gap-2 bg-gray-900 text-white py-2 px-5 rounded-full font-bold text-[13px] hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Category Budget
            </button>
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      {isSetBudgetModalOpen && (
        <ModalOverlay onClose={() => setIsSetBudgetModalOpen(false)}>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Set Monthly Budget</h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Month *</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={budgetMonthInput}
                onChange={(e) => setBudgetMonthInput(e.target.value)}
              >
                <option value="2025-04">April 2025</option>
                <option value="2025-05">May 2025</option>
                <option value="2025-06">June 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Monthly Budget Amount *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input 
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={monthlyBudgetInput}
                  onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                  placeholder="25000"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Notes (Optional)</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                rows="3"
                value={budgetNotesInput}
                onChange={(e) => setBudgetNotesInput(e.target.value)}
                placeholder="Any special plans this month?"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={() => setIsSetBudgetModalOpen(false)}
              className="px-5 py-2.5 rounded-full text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSetBudget}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Save Budget
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Add/Edit Category Budget Modal */}
      {isCategoryModalOpen && (
        <ModalOverlay onClose={() => setIsCategoryModalOpen(false)}>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {categoryModalMode === 'add' ? 'Add Category Budget' : 'Edit Category Budget'}
          </h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Month *</label>
              <input 
                type="text"
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-500 cursor-not-allowed"
                value={selectedMonth === '2025-05' ? 'May 2025' : (selectedMonth === '2025-04' ? 'April 2025' : 'June 2025')}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Category *</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={categoryInput}
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                  setCategoryError("");
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Budget Amount *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input 
                  type="number"
                  className={`w-full bg-gray-50 border ${categoryError ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'} rounded-xl pl-8 pr-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
                  value={categoryBudgetInput}
                  onChange={(e) => {
                    setCategoryBudgetInput(e.target.value);
                    setCategoryError("");
                  }}
                  placeholder="5000"
                />
              </div>
              {categoryError && <p className="text-[12px] font-bold text-gray-900 mt-2">{categoryError}</p>}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-5 py-2.5 rounded-full text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveCategoryBudget}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              {categoryModalMode === 'add' ? 'Add Budget' : 'Save Changes'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ModalOverlay onClose={() => setIsDeleteModalOpen(false)}>
          <div className="text-center py-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-sm">
              <Trash2 size={24} className="text-gray-900" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Category Budget?</h2>
            <p className="text-sm font-medium text-gray-500">Are you sure you want to delete this category budget? This action cannot be undone.</p>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 rounded-full text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteCategory}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Delete
            </button>
          </div>
        </ModalOverlay>
      )}

    </div>
  );
};

export default Budget;

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, Pencil, Trash2, X,
  Briefcase, Laptop, Building2, TrendingUp, Gift, MoreHorizontal,
  WalletCards, Calendar, Hash, ChevronDown, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// --- Constants ---
const SOURCE_ICONS = {
  'Salary': Briefcase,
  'Freelance': Laptop,
  'Business': Building2,
  'Investment': TrendingUp,
  'Gift': Gift,
  'Other': MoreHorizontal,
};

const SOURCES = Object.keys(SOURCE_ICONS);

// --- Helper Functions ---
const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' }); 
};

const formatCurrency = (amount) => {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const isCurrentMonth = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const isLastMonth = (dateString) => {
  if (!dateString) return false;
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

const AmountReceived = () => {
  const { user } = useAuth();
  
  // Data State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form State
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: SOURCES[0],
    description: '',
    received_date: new Date().toISOString().split('T')[0]
  });
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Fetch Data
  const fetchAmountReceived = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('amount_received')
        .select('*')
        .order('received_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching amount received:', err);
      setError('Unable to load your amounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmountReceived();
  }, [user]);

  // Derived State (Summaries)
  const totalAmount = useMemo(() => 
    records.reduce((sum, rec) => sum + Number(rec.amount), 0)
  , [records]);

  const thisMonthAmount = useMemo(() => 
    records.filter(rec => isCurrentMonth(rec.received_date)).reduce((sum, rec) => sum + Number(rec.amount), 0)
  , [records]);

  const numberOfRecords = records.length;

  // Derived State (Filtered List)
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const searchMatch = (rec.description?.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (rec.source.toLowerCase().includes(searchQuery.toLowerCase()));
      const sourceMatch = sourceFilter === 'All Sources' || rec.source === sourceFilter;
      
      let dateMatch = true;
      if (dateFilter === 'This Month') dateMatch = isCurrentMonth(rec.received_date);
      if (dateFilter === 'Last Month') dateMatch = isLastMonth(rec.received_date);

      return searchMatch && sourceMatch && dateMatch;
    });
  }, [records, searchQuery, sourceFilter, dateFilter]);

  // Handlers
  const openAddModal = () => {
    setEditingRecordId(null);
    setFormData({
      amount: '',
      source: SOURCES[0],
      description: '',
      received_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecordId(record.id);
    setFormData({
      amount: record.amount,
      source: record.source,
      description: record.description || '',
      received_date: record.received_date
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setActionLoading(true);
      const amountValue = Number(formData.amount);
      
      if (amountValue <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const payload = {
        amount: amountValue,
        source: formData.source,
        description: formData.description,
        received_date: formData.received_date
      };

      if (editingRecordId) {
        const { error: updateError } = await supabase
          .from('amount_received')
          .update(payload)
          .eq('id', editingRecordId);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('amount_received')
          .insert({
            ...payload,
            user_id: user.id
          });
          
        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      await fetchAmountReceived();
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.message || 'Failed to save record.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      const { error: deleteError } = await supabase
        .from('amount_received')
        .delete()
        .eq('id', recordToDelete);
        
      if (deleteError) throw deleteError;
      
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      await fetchAmountReceived();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete record.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="bg-black text-white p-3 rounded-2xl shadow-sm">
            <WalletCards size={32} strokeWidth={2.5} />
          </div>
          <p className="text-gray-500 font-semibold text-sm">Loading amount received...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[80vh] w-full items-center justify-center gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
          <RefreshCw size={24} className="text-red-500" strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{error}</h3>
        <button 
          onClick={fetchAmountReceived}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Amount Received</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Track and manage your income sources.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 text-white py-2.5 px-5 rounded-full shadow-sm hover:bg-black transition-all w-max h-max active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="text-[13px] font-bold">Add Amount Received</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SummaryCard title="Total Received" amount={formatCurrency(totalAmount)} Icon={WalletCards} />
        <SummaryCard title="This Month" amount={formatCurrency(thisMonthAmount)} Icon={Calendar} />
        <SummaryCard title="Number of Entries" amount={numberOfRecords.toString()} Icon={Hash} />
      </div>

      {/* Management Section */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
        
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">All Amounts Received</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search description..."
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
                  <div className="px-3 py-2 mt-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100">Source</div>
                  {['All Sources', ...SOURCES].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setSourceFilter(opt); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${sourceFilter === opt ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
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
              <div className="col-span-4 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Source</div>
              <div className="col-span-3 text-[12px] font-bold text-gray-900 uppercase tracking-wider">Description</div>
              <div className="col-span-2 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-right pr-4">Amount</div>
              <div className="col-span-1 text-[12px] font-bold text-gray-900 uppercase tracking-wider text-center">Actions</div>
            </div>
            
            {/* Table Rows */}
            <div className="flex flex-col mt-2">
              {filteredRecords.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <WalletCards size={24} className="text-gray-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {records.length === 0 ? 'No amount received yet' : 'No records found'}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm mb-6 max-w-sm">
                    {records.length === 0 
                      ? 'Add your first received amount to start tracking your finances.'
                      : 'Try adjusting your search or filters to find what you are looking for.'}
                  </p>
                  {records.length === 0 && (
                    <button 
                      onClick={openAddModal}
                      className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-sm"
                    >
                      + Add Amount Received
                    </button>
                  )}
                </div>
              ) : (
                filteredRecords.map((record) => {
                  const SrcIcon = SOURCE_ICONS[record.source] || MoreHorizontal;
                  return (
                    <div key={record.id} className="grid grid-cols-12 items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
                      <div className="col-span-2 text-[13px] font-medium text-gray-600">
                        {formatDateDisplay(record.received_date)}
                      </div>
                      
                      <div className="col-span-4 pr-4 flex items-center gap-3">
                        <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100">
                          <SrcIcon size={14} className="text-gray-700" strokeWidth={2.5} />
                        </div>
                        <span className="text-[14px] font-bold text-gray-900 tracking-tight">{record.source}</span>
                      </div>
                      
                      <div className="col-span-3 pr-4">
                        <p className="text-[13px] font-semibold text-gray-700 truncate">{record.description || '-'}</p>
                      </div>
                      
                      <div className="col-span-2 text-[14px] font-bold text-right text-green-600 pr-4 tracking-tight">
                        +{formatCurrency(record.amount)}
                      </div>
                      
                      <div className="col-span-1 flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(record)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(record.id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {editingRecordId ? 'Edit Amount' : 'Add Received Amount'}
              </h2>
              <button 
                onClick={() => !actionLoading && setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                disabled={actionLoading}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <form id="record-form" onSubmit={handleSubmit} className="space-y-5">
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
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                        placeholder="0.00"
                        disabled={actionLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.received_date}
                      onChange={(e) => setFormData({...formData, received_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Source *</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                      disabled={actionLoading}
                    >
                      {SOURCES.map(src => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Description <span className="text-gray-400 font-medium">(Optional)</span></label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none"
                    placeholder="E.g. August salary, Client payment..."
                    disabled={actionLoading}
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 mt-auto">
              <button 
                type="button"
                onClick={() => !actionLoading && setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="record-form"
                disabled={actionLoading}
                className={`px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-sm ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {actionLoading ? 'Saving...' : (editingRecordId ? 'Save Changes' : 'Add Amount')}
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Record</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Are you sure you want to delete this received amount? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => !actionLoading && setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-full text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={actionLoading}
                className={`flex-1 py-3 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AmountReceived;

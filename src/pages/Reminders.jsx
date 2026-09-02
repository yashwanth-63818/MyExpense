import React, { useState, useMemo } from 'react';
import { 
  Plus, Bell, Clock, CheckCircle2, CalendarClock,
  Search, Receipt, RefreshCcw, Landmark, Repeat,
  CreditCard, Pencil, Trash2, X, AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { name: "Bill Payment", icon: Receipt },
  { name: "Subscription", icon: RefreshCcw },
  { name: "Fixed Deposit", icon: Landmark },
  { name: "Recurring Deposit", icon: Repeat },
  { name: "Loan / EMI", icon: CreditCard },
  { name: "Custom", icon: Bell }
];

const INITIAL_DATA = [
  {
    id: 1,
    title: "Electricity Bill",
    category: "Bill Payment",
    dueDate: "2025-06-05",
    description: "Pay monthly electricity bill.",
    completed: false,
    repeat: "Monthly"
  },
  {
    id: 2,
    title: "Netflix Subscription",
    category: "Subscription",
    dueDate: "2025-06-10",
    description: "Monthly subscription renewal.",
    completed: false,
    repeat: "Monthly"
  },
  {
    id: 3,
    title: "RD Monthly Deposit",
    category: "Recurring Deposit",
    dueDate: "2025-06-01",
    description: "Deposit ₹2,500 into recurring deposit.",
    completed: false,
    repeat: "Monthly"
  },
  {
    id: 4,
    title: "FD Maturity",
    category: "Fixed Deposit",
    dueDate: "2026-01-01",
    description: "Review or renew fixed deposit.",
    completed: false,
    repeat: "Does not repeat"
  },
  {
    id: 5,
    title: "Phone Bill",
    category: "Bill Payment",
    dueDate: "2025-05-25",
    description: "Monthly mobile recharge/payment.",
    completed: true,
    repeat: "Monthly"
  }
];

const calculateStatus = (dueDateStr, completed) => {
  if (completed) return 'Completed';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 7) return 'Due Soon';
  return 'Upcoming';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const SummaryCard = ({ title, count, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col h-full">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{count}</h3>
  </div>
);

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
        <X size={20} strokeWidth={2.5} />
      </button>
      {children}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let Icon = CalendarClock;
  let bgClass = "bg-gray-100";
  let textClass = "text-gray-700";

  if (status === 'Completed') {
    Icon = CheckCircle2;
    bgClass = "bg-gray-100";
    textClass = "text-gray-500";
  } else if (status === 'Due Soon') {
    Icon = Clock;
    bgClass = "bg-gray-200";
    textClass = "text-gray-900";
  } else if (status === 'Overdue') {
    Icon = AlertCircle;
    bgClass = "bg-gray-900";
    textClass = "text-white";
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${bgClass}`}>
      <Icon size={14} className={textClass} strokeWidth={2.5} />
      <span className={`text-[12px] font-bold ${textClass}`}>{status}</span>
    </div>
  );
};

const Reminders = () => {
  const [reminders, setReminders] = useState(INITIAL_DATA);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Modals
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Bill Payment');
  const [dueDateInput, setDueDateInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [repeatInput, setRepeatInput] = useState('Does not repeat');
  const [formError, setFormError] = useState('');

  // Processed Data
  const processedReminders = useMemo(() => {
    return reminders.map(r => ({
      ...r,
      status: calculateStatus(r.dueDate, r.completed)
    }));
  }, [reminders]);

  const summary = useMemo(() => {
    let upcoming = 0;
    let dueSoon = 0;
    let completed = 0;

    processedReminders.forEach(r => {
      if (r.status === 'Completed') completed++;
      else if (r.status === 'Due Soon') dueSoon++;
      else if (r.status === 'Upcoming') upcoming++;
      // Overdue is implicitly calculated but summary cards asked for are Upcoming, Due Soon, Completed.
    });

    return { upcoming, dueSoon, completed };
  }, [processedReminders]);

  const filteredReminders = useMemo(() => {
    return processedReminders.filter(r => {
      // Status Filter
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      
      // Category Filter
      if (categoryFilter !== 'All Categories' && r.category !== categoryFilter) return false;
      
      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesDesc = (r.description || '').toLowerCase().includes(query);
        const matchesCat = r.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      
      return true;
    });
  }, [processedReminders, statusFilter, categoryFilter, searchQuery]);

  // Handlers
  const openAddModal = () => {
    setModalMode('add');
    setTitleInput('');
    setCategoryInput('Bill Payment');
    setDueDateInput('');
    setDescriptionInput('');
    setRepeatInput('Does not repeat');
    setFormError('');
    setIsReminderModalOpen(true);
  };

  const openEditModal = (reminder) => {
    setModalMode('edit');
    setEditingId(reminder.id);
    setTitleInput(reminder.title);
    setCategoryInput(reminder.category);
    setDueDateInput(reminder.dueDate);
    setDescriptionInput(reminder.description || '');
    setRepeatInput(reminder.repeat || 'Does not repeat');
    setFormError('');
    setIsReminderModalOpen(true);
  };

  const handleSaveReminder = () => {
    if (!titleInput.trim() || !dueDateInput) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setReminders(prev => {
      if (modalMode === 'add') {
        return [...prev, {
          id: Date.now(),
          title: titleInput.trim(),
          category: categoryInput,
          dueDate: dueDateInput,
          description: descriptionInput.trim(),
          completed: false,
          repeat: repeatInput
        }];
      } else {
        return prev.map(r => r.id === editingId ? {
          ...r,
          title: titleInput.trim(),
          category: categoryInput,
          dueDate: dueDateInput,
          description: descriptionInput.trim(),
          repeat: repeatInput
        } : r);
      }
    });

    setIsReminderModalOpen(false);
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setReminders(prev => prev.filter(r => r.id !== deletingId));
    setIsDeleteModalOpen(false);
  };

  const toggleComplete = (id, currentStatus) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !currentStatus } : r));
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Reminders</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Never miss an important payment, deposit, or financial deadline.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 text-white py-2.5 px-5 rounded-full font-bold text-[13px] hover:bg-gray-800 transition-colors w-max shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Reminder
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard title="Upcoming" count={summary.upcoming} Icon={Bell} />
        <SummaryCard title="Due Soon" count={summary.dueSoon} Icon={Clock} />
        <SummaryCard title="Completed" count={summary.completed} Icon={CheckCircle2} />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
            </select>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reminders List */}
        {filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(reminder => {
              const categoryConfig = CATEGORIES.find(c => c.name === reminder.category) || CATEGORIES[CATEGORIES.length - 1];
              const Icon = categoryConfig.icon;
              const isCompleted = reminder.completed;

              return (
                <div key={reminder.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[20px] border transition-all ${isCompleted ? 'bg-gray-50/50 border-gray-100 opacity-70' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-gray-800" strokeWidth={2} />
                    </div>
                    
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`font-bold text-[16px] truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {reminder.title}
                        </h3>
                        <StatusBadge status={reminder.status} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[13px] font-semibold text-gray-500">
                        <span>{reminder.category}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>Due {formatDate(reminder.dueDate)}</span>
                        {reminder.repeat !== 'Does not repeat' && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>Repeats {reminder.repeat}</span>
                          </>
                        )}
                      </div>
                      
                      {reminder.description && (
                        <p className="text-[13px] font-medium text-gray-500 mt-0.5 line-clamp-1">{reminder.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:pl-4 sm:border-l border-gray-100 shrink-0">
                    <button 
                      onClick={() => toggleComplete(reminder.id, reminder.completed)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-colors ${isCompleted ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'}`}
                    >
                      {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                    
                    <button 
                      onClick={() => openEditModal(reminder)} 
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(reminder.id)} 
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
              <Bell size={28} className="text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No reminders found</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">Create a reminder so you never miss an important financial task.</p>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-gray-900 text-white py-2 px-5 rounded-full font-bold text-[13px] hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Reminder
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isReminderModalOpen && (
        <ModalOverlay onClose={() => setIsReminderModalOpen(false)}>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {modalMode === 'add' ? 'Add Reminder' : 'Edit Reminder'}
          </h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Reminder Title *</label>
              <input 
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={titleInput}
                onChange={(e) => { setTitleInput(e.target.value); setFormError(''); }}
                placeholder="e.g. Electricity Bill"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Category *</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Due Date *</label>
                <input 
                  type="date"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={dueDateInput}
                  onChange={(e) => { setDueDateInput(e.target.value); setFormError(''); }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Repeat</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={repeatInput}
                onChange={(e) => setRepeatInput(e.target.value)}
              >
                <option value="Does not repeat">Does not repeat</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                rows="3"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Add additional details..."
              ></textarea>
            </div>

            {formError && (
              <p className="text-[13px] font-bold text-gray-900">{formError}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={() => setIsReminderModalOpen(false)}
              className="px-5 py-2.5 rounded-full text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveReminder}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              {modalMode === 'add' ? 'Add Reminder' : 'Save Changes'}
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Reminder?</h2>
            <p className="text-sm font-medium text-gray-500">Are you sure you want to delete this reminder? This action cannot be undone.</p>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 rounded-full text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
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

export default Reminders;

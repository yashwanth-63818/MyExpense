import React, { useState, useEffect } from 'react';
import { 
  User, Mail, ChevronDown, Check, Download, 
  Trash2, AlertTriangle, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Toast = ({ message, visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
      <Check size={18} className="text-gray-300" />
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

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

const Toggle = ({ checked, onChange }) => (
  <button 
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
  >
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingsCard = ({ title, subtext, children, className = "" }) => (
  <div className={`bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm ${className}`}>
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      {subtext && <p className="text-sm font-medium text-gray-500 mt-1">{subtext}</p>}
    </div>
    {children}
  </div>
);

const DEFAULT_NOTIFS = { reminders: true, budget: true, savings: false };

const Settings = () => {
  const { user } = useAuth();
  
  const userEmail = user?.email || "";
  const fallbackName = userEmail.split('@')[0];
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || fallbackName;

  // State
  const [currency, setCurrency] = useState(() => localStorage.getItem('myexpense_currency') || 'Indian Rupee (₹)');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('myexpense_date_format') || 'DD/MM/YYYY');
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('myexpense_notifications')) || DEFAULT_NOTIFS);
  const [theme, setTheme] = useState(() => localStorage.getItem('myexpense_theme') || 'System');
  
  // Modals & UI state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Forms
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  
  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Effects to persist state
  useEffect(() => { localStorage.setItem('myexpense_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('myexpense_date_format', dateFormat); }, [dateFormat]);
  useEffect(() => { localStorage.setItem('myexpense_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { 
    localStorage.setItem('myexpense_theme', theme);
    // Apply theme
    if (theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handlers
  const handleSaveProfile = async () => {
    try {
      const updates = { data: { full_name: editName, name: editName } };
      if (editEmail !== userEmail) {
        updates.email = editEmail;
      }
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      setIsEditProfileOpen(false);
      triggerToast("Profile updated");
    } catch (err) {
      triggerToast(err.message || "Failed to update profile");
    }
  };

  const handleExportData = () => {
    const data = {
      profile: { name: userName, email: userEmail },
      currency, dateFormat, notifications, theme,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myexpense-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Data exported successfully");
  };

  const handleClearData = () => {
    localStorage.removeItem('myexpense_currency');
    localStorage.removeItem('myexpense_date_format');
    localStorage.removeItem('myexpense_notifications');
    localStorage.removeItem('myexpense_theme');
    
    setCurrency('Indian Rupee (₹)');
    setDateFormat('DD/MM/YYYY');
    setNotifications(DEFAULT_NOTIFS);
    setTheme('System');
    
    setIsClearDataOpen(false);
    triggerToast("Local data cleared");
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountOpen(false);
    setDeleteConfirmText("");
    triggerToast("Account deletion will be available once authentication and database integration are connected.");
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Settings</h1>
        <p className="text-gray-500 font-medium text-sm">Manage your account and application preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Profile */}
        <SettingsCard title="Profile" subtext="Manage your personal information.">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{userName}</h3>
                <p className="text-sm font-medium text-gray-500">{userEmail}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setEditName(userName);
                setEditEmail(userEmail);
                setIsEditProfileOpen(true);
              }}
              className="bg-gray-50 border border-gray-200 text-gray-900 px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-colors shadow-sm w-max"
            >
              Edit Profile
            </button>
          </div>
        </SettingsCard>

        {/* Currency */}
        <SettingsCard title="Currency" subtext="Choose your preferred currency for tracking expenses.">
          <div className="relative max-w-sm">
            <select 
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                triggerToast("Currency preference saved");
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
            >
              <option value="Indian Rupee (₹)">Indian Rupee (₹)</option>
              <option value="US Dollar ($)">US Dollar ($)</option>
              <option value="Euro (€)">Euro (€)</option>
              <option value="British Pound (£)">British Pound (£)</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </SettingsCard>

        {/* Date Format */}
        <SettingsCard title="Date Format" subtext="Choose how dates are displayed.">
          <div className="flex flex-wrap gap-3">
            {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(fmt => (
              <button
                key={fmt}
                onClick={() => {
                  setDateFormat(fmt);
                  triggerToast("Date format saved");
                }}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${
                  dateFormat === fmt 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard title="Notifications" subtext="Choose which reminders and updates you want to receive.">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-[14px] font-bold text-gray-900">Reminder Notifications</h4>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Receive notifications for upcoming reminders.</p>
              </div>
              <Toggle 
                checked={notifications.reminders} 
                onChange={(v) => {
                  setNotifications(prev => ({ ...prev, reminders: v }));
                  triggerToast("Preferences saved");
                }} 
              />
            </div>
            <div className="w-full h-px bg-gray-100"></div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-[14px] font-bold text-gray-900">Budget Alerts</h4>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Get notified when you are close to or exceed your budget.</p>
              </div>
              <Toggle 
                checked={notifications.budget} 
                onChange={(v) => {
                  setNotifications(prev => ({ ...prev, budget: v }));
                  triggerToast("Preferences saved");
                }} 
              />
            </div>
            <div className="w-full h-px bg-gray-100"></div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-[14px] font-bold text-gray-900">Savings Reminders</h4>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Receive reminders for RD deposits and FD maturity dates.</p>
              </div>
              <Toggle 
                checked={notifications.savings} 
                onChange={(v) => {
                  setNotifications(prev => ({ ...prev, savings: v }));
                  triggerToast("Preferences saved");
                }} 
              />
            </div>
          </div>
        </SettingsCard>

        {/* Appearance */}
        <SettingsCard title="Appearance" subtext="Customize how MyExpense looks.">
          <div className="flex flex-wrap gap-3">
            {['Light', 'Dark', 'System'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  triggerToast("Theme updated");
                }}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${
                  theme === t 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </SettingsCard>

        {/* Data & Privacy */}
        <SettingsCard title="Data & Privacy" subtext="Manage your local application data.">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[14px] font-bold text-gray-900">Export My Data</h4>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Download your financial data.</p>
              </div>
              <button 
                onClick={handleExportData}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-900 px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-colors shadow-sm w-max"
              >
                <Download size={16} strokeWidth={2.5} />
                Export Data
              </button>
            </div>
            <div className="w-full h-px bg-gray-100"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[14px] font-bold text-gray-900">Clear Local Data</h4>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Remove all locally stored application preferences and temporary data.</p>
              </div>
              <button 
                onClick={() => setIsClearDataOpen(true)}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm w-max"
              >
                Clear Data
              </button>
            </div>
          </div>
        </SettingsCard>

        {/* Danger Zone */}
        <SettingsCard 
          title="Danger Zone" 
          subtext="These actions may permanently affect your account."
          className="border-gray-200 bg-gray-50/30"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-[14px] font-bold text-gray-900">Delete Account</h4>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">Permanently delete your account and all associated data.</p>
            </div>
            <button 
              onClick={() => setIsDeleteAccountOpen(true)}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm w-max"
            >
              Delete Account
            </button>
          </div>
        </SettingsCard>

      </div>

      {/* Modals */}
      
      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <ModalOverlay onClose={() => setIsEditProfileOpen(false)}>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Edit Profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Name</label>
              <input 
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={() => setIsEditProfileOpen(false)}
              className="px-5 py-2.5 rounded-full text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Clear Data Modal */}
      {isClearDataOpen && (
        <ModalOverlay onClose={() => setIsClearDataOpen(false)}>
          <div className="text-center py-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-sm">
              <Trash2 size={24} className="text-gray-900" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Clear Local Data?</h2>
            <p className="text-sm font-medium text-gray-500">Are you sure you want to clear your local data? This action cannot be undone and will reset all preferences.</p>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button 
              onClick={() => setIsClearDataOpen(false)}
              className="px-6 py-2.5 rounded-full text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleClearData}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Clear Data
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Delete Account Modal */}
      {isDeleteAccountOpen && (
        <ModalOverlay onClose={() => {
          setIsDeleteAccountOpen(false);
          setDeleteConfirmText("");
        }}>
          <div className="text-center py-2">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-200 shadow-sm">
              <AlertTriangle size={24} className="text-gray-900" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
            <p className="text-sm font-medium text-gray-500 mb-6">Are you sure you want to delete your account? Type <strong>DELETE</strong> to confirm.</p>
            
            <input 
              type="text"
              placeholder="Type DELETE"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-bold text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <div className="flex justify-center gap-3 mt-8">
            <button 
              onClick={() => {
                setIsDeleteAccountOpen(false);
                setDeleteConfirmText("");
              }}
              className="px-6 py-2.5 rounded-full text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
              className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-colors shadow-sm ${
                deleteConfirmText === "DELETE" 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Delete Account
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} visible={showToast} onClose={() => setShowToast(false)} />

    </div>
  );
};

export default Settings;

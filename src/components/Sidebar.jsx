import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  House, 
  WalletCards, 
  CreditCard, 
  Coins, 
  Landmark, 
  RefreshCcw, 
  ClipboardList, 
  BarChart3, 
  Target, 
  Bell, 
  Settings, 
  User, 
  ChevronRight,
  ChevronDown,
  X,
  LogOut
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const [isSavingsExpanded, setIsSavingsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: House },
    { name: 'Amount Received', path: '/amount-received', icon: WalletCards },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
  ];

  const bottomNavItems = [
    { name: 'Transactions', path: '/transactions', icon: ClipboardList },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Budget', path: '/budget', icon: Target },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const savingsItems = [
    { name: 'Gold', path: '/savings', icon: Coins },
    { name: 'Silver', path: '/savings', icon: Coins },
    { name: 'Fixed Deposit', path: '/savings', icon: Landmark },
    { name: 'Recurring Deposit', path: '/savings', icon: RefreshCcw },
  ];

  const NavItem = ({ item, isSubItem = false, onClick }) => (
    <NavLink
      to={item.path}
      onClick={(e) => {
        if (onClick) onClick(e);
        onClose?.();
      }}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
        ${isSubItem ? 'pl-11 py-2 text-[13px]' : 'text-sm font-medium'}
        ${isActive && !isSubItem 
          ? 'bg-[#222222] text-white shadow-sm' 
          : isActive && isSubItem
            ? 'text-white font-semibold'
            : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}
      `}
    >
      {({ isActive }) => (
        <>
          <item.icon size={isSubItem ? 16 : 20} strokeWidth={isActive ? 2.5 : 2} />
          <span>{item.name}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="w-[250px] bg-[#0f0f11] h-screen border-r border-[#1f1f22] flex flex-col text-white shadow-xl lg:shadow-none">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white text-black p-2.5 rounded-xl shadow-sm">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">MyExpense</h1>
            <p className="text-gray-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Track • Save • Grow</p>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          className="lg:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors" 
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-3 flex flex-col gap-1 pb-4">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* Expandable Savings */}
        <div className="mt-1 flex flex-col">
          <button
            onClick={() => {
              setIsSavingsExpanded(!isSavingsExpanded);
            }}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
              ${isSavingsExpanded ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}
            `}
          >
            <div className="flex items-center gap-3">
              <Wallet size={20} strokeWidth={isSavingsExpanded ? 2.5 : 2} />
              <span>My Savings</span>
            </div>
            {isSavingsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {/* Expanded Items */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isSavingsExpanded ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
          >
            <div className="flex flex-col gap-0.5 mb-2">
              {savingsItems.map((item) => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isSubItem={true} 
                  onClick={(e) => {
                    // Temporarily navigate to /savings when a sub-item is clicked
                    e.preventDefault();
                    navigate('/savings');
                    onClose?.();
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="my-3 border-t border-[#1f1f22] mx-2"></div>

        {bottomNavItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>

      {/* Bottom Profile */}
      <div className="p-4 mt-auto">
        <div className="flex items-center justify-between p-3 bg-[#17171a] rounded-2xl border border-[#222225] cursor-pointer hover:bg-[#1f1f22] transition-colors shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-[#2a2a2d] p-2 rounded-full text-gray-200 flex-shrink-0">
              <User size={18} strokeWidth={2.5} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5 truncate">
                {user?.email || 'Manage account'}
              </p>
            </div>
          </div>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              await signOut();
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2d] rounded-lg transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

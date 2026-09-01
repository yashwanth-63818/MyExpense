import React from 'react';
import { 
  Calendar, ChevronDown, ChevronRight, 
  Wallet, CreditCard, PiggyBank, 
  Coins, Landmark, RefreshCcw, Database,
  WalletCards, ClipboardList, 
  ArrowDown, ArrowUp 
} from 'lucide-react';

const SummaryCard = ({ title, amount, Icon }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5">
      <Icon size={22} className="text-gray-800" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{amount}</h3>
  </div>
);

const SavingsItem = ({ title, amount, percentage, Icon }) => (
  <div className="bg-gray-50/50 p-6 rounded-[20px] flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
    <div className="mb-3">
      <Icon size={28} className="text-gray-800" strokeWidth={1.5} />
    </div>
    <p className="text-[13px] font-semibold text-gray-900 mb-1">{title}</p>
    <h4 className="text-[1.35rem] font-bold text-gray-900 mb-0.5 leading-tight">{amount}</h4>
    <span className="text-[11px] font-semibold text-gray-500">{percentage}</span>
  </div>
);

const QuickAction = ({ title, Icon }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[18px] hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm mb-3 last:mb-0 group">
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
      <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100">
        {iconDirection === 'down' ? (
          <ArrowDown size={14} className="text-gray-800" strokeWidth={2.5} />
        ) : (
          <ArrowUp size={14} className="text-gray-800" strokeWidth={2.5} />
        )}
      </div>
      <span className="text-[13.5px] font-semibold text-gray-900">{type}</span>
    </div>
    <div className="text-[13px] font-medium text-gray-600">{category}</div>
    <div className="text-[14px] font-bold text-right text-gray-900 pr-2 tracking-tight">
      {amount}
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Your personal expense & savings tracker</p>
        </div>
        
        <button className="flex items-center gap-2.5 bg-white border border-gray-200 py-2.5 px-4 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all w-max h-max">
          <Calendar size={16} className="text-gray-600" strokeWidth={2.5} />
          <span className="text-[13px] font-bold text-gray-900">31 May 2025</span>
          <ChevronDown size={14} className="text-gray-500" strokeWidth={2.5} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard title="Amount Received" amount="₹50,000" Icon={Wallet} />
        <SummaryCard title="Total Expenses" amount="₹18,750" Icon={CreditCard} />
        <SummaryCard title="Total Savings" amount="₹15,000" Icon={PiggyBank} />
        <SummaryCard title="Available Balance" amount="₹16,250" Icon={Wallet} />
      </div>

      {/* Middle Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Savings Breakdown */}
        <div className="flex-[3] bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Savings Breakdown</h2>
            <button className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-900 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide hover:bg-gray-100 transition-colors uppercase">
              View Details <ChevronRight size={14} strokeWidth={2.5} className="text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <SavingsItem title="Gold" amount="₹6,000" percentage="(40%)" Icon={Coins} />
            <SavingsItem title="Silver" amount="₹2,000" percentage="(13%)" Icon={Database} />
            <SavingsItem title="Fixed Deposit" amount="₹4,500" percentage="(30%)" Icon={Landmark} />
            <SavingsItem title="Recurring Deposit" amount="₹2,500" percentage="(17%)" Icon={RefreshCcw} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-[2] bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6 md:mb-8">Quick Actions</h2>
          <div className="flex-1 flex flex-col justify-between">
            <QuickAction title="Add Amount Received" Icon={WalletCards} />
            <QuickAction title="Add Expense" Icon={CreditCard} />
            <QuickAction title="Add to Savings" Icon={PiggyBank} />
            <QuickAction title="View Transactions" Icon={ClipboardList} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Transactions</h2>
          <button className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-900 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide hover:bg-gray-100 transition-colors uppercase">
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
              <TransactionRow 
                date="31 May 2025" 
                type="Amount Received" 
                category="Salary" 
                amount="+ ₹50,000" 
                iconDirection="down" 
              />
              <TransactionRow 
                date="30 May 2025" 
                type="Expense" 
                category="Food & Dining" 
                amount="- ₹650" 
                iconDirection="up" 
              />
              <TransactionRow 
                date="29 May 2025" 
                type="Expense" 
                category="Travel" 
                amount="- ₹350" 
                iconDirection="up" 
              />
              <TransactionRow 
                date="28 May 2025" 
                type="Savings" 
                category="Gold Purchase" 
                amount="- ₹5,000" 
                iconDirection="down" 
              />
              <TransactionRow 
                date="27 May 2025" 
                type="Savings" 
                category="Recurring Deposit" 
                amount="- ₹2,500" 
                iconDirection="down" 
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

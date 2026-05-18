import React from 'react';
import { Menu, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, title, showSearch = false, searchValue = '', onSearchChange = null }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/40 bg-[#0B0D19]/65 backdrop-blur-md px-6 shadow-sm">
      {/* Left Area: Mobile Menu + Navigation Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-lg md:text-xl font-bold tracking-tight text-white">
          {title}
        </h1>
      </div>

      {/* Center Search Input */}
      {showSearch && onSearchChange && (
        <div className="hidden md:flex relative w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 py-2 pl-10 pr-4 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:bg-slate-950/70 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      )}

      {/* Right Area: Profile Menu */}
      <div className="flex items-center gap-4">
        {/* Decorative Quick Stat */}
        <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
          Active Workspace
        </span>

        {/* User Profile Mini Display */}
        <div className="flex items-center gap-2.5">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-md border border-white/5"
            style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <span className="hidden md:block text-xs font-medium text-slate-300">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

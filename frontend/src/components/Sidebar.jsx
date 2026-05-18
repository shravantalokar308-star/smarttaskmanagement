import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderGit2, 
  LogOut, 
  Layers, 
  CheckSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col glass-panel border-r border-slate-800/40 bg-[#0B0D19]/90 px-5 py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-heading text-lg font-bold text-white tracking-wider text-glow-violet">SYNAPSE</span>
            <span className="block text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Task Sphere</span>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 border border-slate-800/50 p-3 mb-8">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white shadow-inner"
            style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium text-slate-200">{user?.name}</h4>
            <span className="block truncate text-xs text-slate-400">{user?.email}</span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-indigo-300 border-l-[3px] border-indigo-500 font-semibold shadow-[0_0_20px_-3px_rgba(99,102,241,0.15)]'
                      : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200 border-l-[3px] border-transparent'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/60 pt-4 mt-auto">
          <button
            onClick={() => {
              logout();
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 transition-standard hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

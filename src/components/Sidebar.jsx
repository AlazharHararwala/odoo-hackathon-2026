import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  PlusCircle, 
  Compass, 
  Calendar, 
  PieChart, 
  Settings, 
  Globe,
  Sparkles,
  User,
  X
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { label: t('dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('myTrips', 'My Trips'), path: '/trips', icon: Map },
    { label: t('planNewTrip', 'Plan New Trip'), path: '/create-trip', icon: PlusCircle, highlight: true },
    { label: t('exploreCities', 'Explore Cities'), path: '/explore', icon: Compass },
    { label: t('timelineCalendar', 'Timeline & Calendar'), path: '/timeline', icon: Calendar },
    { label: t('budgetAnalytics', 'Budget Analytics'), path: '/budget', icon: PieChart },
    { label: t('settings', 'Settings'), path: '/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <NavLink to="/dashboard" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-400/20" />
              <Compass className="w-5 h-5 text-emerald-400 relative z-10" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">Odyssey</span>
            <span className="block text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold">Travel Planner</span>
          </div>
        </NavLink>
        {setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 shadow-sm'
                    : item.highlight
                    ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-md shadow-primary-900/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <Icon className={`w-5 h-5 mr-3 ${item.highlight ? 'text-white' : ''}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Personal Traveler Passport Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-emerald-950/40 border border-emerald-500/30 shadow-lg relative overflow-hidden group">
        <Link to="/settings" className="flex items-center space-x-3 mb-2.5 hover:opacity-90 transition-opacity">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={user?.name || 'User Avatar'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/60 shadow-xs"
          />
          <div className="overflow-hidden">
            <span className="text-xs font-extrabold text-white block truncate">{user?.name || 'Alazhar'}</span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-wide uppercase block">Lead Explorer</span>
          </div>
        </Link>

        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
          {t('assistantDesc', '900+ cities unlocked. Craft your route & track live budgets.')}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-800/80">
          <span className="flex items-center space-x-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>{t('allSystemsLive', 'Explorer Ready')}</span>
          </span>
          <Link to="/settings" className="text-slate-400 hover:text-white font-semibold flex items-center space-x-1">
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

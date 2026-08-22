import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
  X
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { t } = useLanguage();

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center shadow-lg shadow-primary-900/40 group-hover:scale-105 transition-transform duration-200">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">GlobeTrotter</span>
            <span className="block text-[10px] uppercase tracking-widest text-primary-400 font-semibold">Travel Planner</span>
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

      {/* Bottom Professional Travel Assistant Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-950 border border-slate-700/70 shadow-lg relative overflow-hidden group">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-primary-500/20 border border-primary-400/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">{t('smartAssistant', 'Smart Travel Assistant')}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          {t('assistantDesc', 'Optimize multi-city routes, track real-time budgets, and explore curated local attractions.')}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-800">
          <span className="flex items-center space-x-1.5 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>{t('allSystemsLive', 'All Systems Live')}</span>
          </span>
          <span className="text-slate-500 font-mono text-[10px]">v1.2.0</span>
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

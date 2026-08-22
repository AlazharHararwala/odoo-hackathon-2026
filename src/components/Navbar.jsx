import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Bell, 
  Menu, 
  Plus, 
  User, 
  Settings, 
  LogOut, 
  Globe,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onOpenMobileSidebar }) => {
  const { user, logoutUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: '🧳 Trip "European Dream Tour" is coming up soon!', time: '2h ago', unread: true },
    { id: 2, text: '🗺️ 900+ tourist destinations loaded from MySQL database', time: 'Just now', unread: true },
    { id: 3, text: '💡 Budget tip: 3 suggested activities added per stop', time: '1d ago', unread: true },
  ]);

  const unreadCount = notificationsList.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logoutUser();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search destinations, trips, activities...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 border border-transparent focus:border-primary-500 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 pl-10 pr-4 py-2.5 rounded-2xl outline-none transition-all"
            />
          </form>
        </div>

        {/* Right Side: Quick Action & Profile */}
        <div className="flex items-center space-x-3">
          <Link
            to="/create-trip"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-900/10 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newTrip', 'New Trip')}</span>
          </Link>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name || 'User Avatar'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
            />
            <span className="hidden lg:inline-block text-xs font-semibold text-slate-700">
              {user?.name || 'Traveler'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline-block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name || 'Traveler'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'alex@example.com'}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                >
                  <User className="w-4 h-4 mr-2 text-slate-400" />
                  View Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2 text-slate-400" />
                  Preferences
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);
};

export default Navbar;

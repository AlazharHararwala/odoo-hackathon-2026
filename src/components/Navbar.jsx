import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'Trip "Grand European Adventure" is in 19 days!', time: '2h ago', unread: true },
    { id: 2, text: 'New activities added to Paris city catalog', time: '1d ago', unread: false },
    { id: 3, text: 'Budget tip: Hotel prices in Dubai are low this week', time: '2d ago', unread: false },
  ];

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
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center space-x-3 md:space-x-6 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search destinations, trips, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Quick Plan Button */}
        <button
          onClick={() => navigate('/create-trip')}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:shadow duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                <span className="text-[11px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-xs text-slate-700 leading-snug">{n.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
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
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getCities } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { 
  User, 
  Settings, 
  Bookmark, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Globe, 
  Bell, 
  IndianRupee, 
  Mail, 
  Camera 
} from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateUserProfile, logoutUser } = useAuth();
  const { showToast } = useToast();
  const { t, currency: activeCurr, setCurrency: setGlobalCurrency } = useLanguage();

  const [activeTab, setActiveTab] = useState('preferences');

  // Form State
  const [name, setName] = useState(user?.name || 'Alazhar');
  const [email, setEmail] = useState(user?.email || 'az@gmail.com');
  const [bio, setBio] = useState(user?.bio || 'Avid traveler exploring one city at a time.');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80');

  // Preferences Form State
  const [currency, setCurrency] = useState(activeCurr || 'USD ($)');
  const [notifications, setNotifications] = useState(true);

  // Sync with active currency if it changes externally
  useEffect(() => {
    if (activeCurr) setCurrency(activeCurr);
  }, [activeCurr]);

  // Saved Cities
  const [savedCities, setSavedCities] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSavedCities();
  }, []);

  const fetchSavedCities = async () => {
    try {
      const cities = await getCities();
      // Filter saved city IDs
      const saved = cities.filter((c) => user?.savedCityIds?.includes(c.id) || ['c_goa', 'c_paris', 'c_tokyo'].includes(c.id));
      setSavedCities(saved);
    } catch (e) { console.error(e); }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email, bio, avatar });
    showToast('Profile updated successfully!', 'success');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setGlobalCurrency(currency);
    updateUserProfile({ currency, notifications });
    showToast(`Preferences saved! Currency updated to ${currency.split('—')[0].trim()}`, 'success');
  };

  const handleRemoveSavedCity = (cityId) => {
    setSavedCities(savedCities.filter((c) => c.id !== cityId));
    showToast('Removed city from bookmarks', 'info');
  };

  const handleDeleteAccount = () => {
    logoutUser();
    showToast('Account deleted', 'info');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('accountPreferences', 'Account & Preferences')}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{t('accountSubtitle', 'Manage your profile information, travel currency, and saved destinations')}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'profile', label: t('profileInformation', 'Profile Information'), icon: User },
          { id: 'preferences', label: t('appPreferences', 'App Preferences'), icon: Settings },
          { id: 'saved', label: t('savedDestinations', 'Saved Destinations'), icon: Bookmark },
          { id: 'account', label: t('accountSafety', 'Account Safety'), icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center space-x-5 pb-6 border-b border-slate-100">
            <div className="relative">
              <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 shadow-md" />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors"
                title="Change Avatar URL"
                onClick={() => {
                  const url = prompt('Enter image URL for avatar:', avatar);
                  if (url) setAvatar(url);
                }}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Short Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PREFERENCES */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Regional & Currency Settings</h3>
              <p className="text-xs text-slate-500">Configure your preferred display currency format and travel alerts</p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-xs rounded-full border border-teal-200 w-max">
              Current: {currency.split('—')[0].trim()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default Display Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="USD ($)">US Dollar — USD ($)</option>
                <option value="INR (₹)">Indian Rupee — INR (₹)</option>
                <option value="EUR (€)">Euro — EUR (€)</option>
                <option value="GBP (£)">British Pound — GBP (£)</option>
                <option value="JPY (¥)">Japanese Yen — JPY (¥)</option>
                <option value="CAD ($)">Canadian Dollar — CAD ($)</option>
                <option value="AUD ($)">Australian Dollar — AUD ($)</option>
                <option value="AED (د.إ)">UAE Dirham — AED (د.إ)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Email Travel Notifications</span>
                <span className="text-[11px] text-slate-500">Receive flight price drops, budget tips, and itinerary reminders</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SAVED DESTINATIONS */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">Bookmarked Destinations</h3>

          {savedCities.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No saved cities yet. Bookmark destinations from the City Explorer.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCities.map((city) => (
                <div key={city.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3">
                    <img src={city.image} alt={city.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{city.name}</h4>
                      <p className="text-[10px] text-slate-500">{city.country}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSavedCity(city.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACCOUNT SAFETY */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-3 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-bold text-lg text-slate-900">Danger Zone</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Permanently delete your GlobeTrotter account and erase all your stored multi-city itineraries, custom activities, and budget history. This action cannot be reversed.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Delete GlobeTrotter Account
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently"
        message="Are you sure you want to permanently delete your GlobeTrotter account? All your saved trips and itinerary data will be destroyed."
        confirmText="Permanently Delete"
        isDanger={true}
      />
    </div>
  );
};

export default ProfileSettings;

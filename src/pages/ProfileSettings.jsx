import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  FolderOpen,
  RefreshCcw,
  Image as ImageIcon
} from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateUserProfile, logoutUser } = useAuth();
  const { showToast } = useToast();
  const { t, currency: activeCurr, setCurrency: setGlobalCurrency } = useLanguage();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');

  // Form State
  const [name, setName] = useState(user?.name || 'Alazhar');
  const [email, setEmail] = useState(user?.email || 'az@gmail.com');
  const [bio, setBio] = useState(user?.bio || 'Avid traveler exploring one city at a time.');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80');
  const [isDragging, setIsDragging] = useState(false);

  // Preferences Form State
  const [currency, setCurrency] = useState(activeCurr || 'USD ($)');
  const [notifications, setNotifications] = useState(true);

  // Sync with active currency if it changes externally
  useEffect(() => {
    if (activeCurr) setCurrency(activeCurr);
  }, [activeCurr]);

  // Sync with active user if it changes or initializes
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.bio !== undefined) setBio(user.bio);
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user]);

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

  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WEBP, etc.)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setAvatar(dataUrl);
        showToast('Image selected! Click "Save Changes" to apply.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
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
          {/* Avatar Section with File Picker & Drag-and-Drop Zone */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Profile Photo & Avatar
            </label>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Current Avatar Preview */}
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100 shadow-md transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs cursor-pointer"
                  title="Upload from File"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Change</span>
                </button>
              </div>

              {/* Drag and Drop Zone + File Upload Button */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 w-full p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50/80 scale-[1.01] shadow-md ring-4 ring-primary-500/20'
                    : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-400'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center space-x-3.5 text-center sm:text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isDragging ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
                  }`}>
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {isDragging ? 'Drop your image file here!' : 'Drag & Drop your image here'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      or click to choose an image from your device (PNG, JPG, WEBP)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-primary-600" />
                    <span>Choose File</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = prompt('Enter image URL for avatar:', avatar);
                      if (url && url.trim()) {
                        setAvatar(url.trim());
                        showToast('Avatar URL set!', 'success');
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors"
                    title="Paste Image URL"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
          <p className="text-xs text-rose-600 leading-relaxed mb-4">
            Permanently delete your Odyssey account and erase all your stored multi-city itineraries, custom activities, and budget history. This action cannot be reversed.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              Delete Odyssey Account
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your Odyssey account? All your saved trips and itinerary data will be destroyed."
        confirmText="Permanently Delete"
        isDanger={true}
      />
    </div>
  );
};

export default ProfileSettings;

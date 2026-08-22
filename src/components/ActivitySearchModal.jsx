import React, { useState, useEffect } from 'react';
import { getActivities } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  X, 
  Clock, 
  IndianRupee, 
  Plus, 
  Filter, 
  Check,
  Compass,
  Utensils,
  Mountain,
  Landmark,
  ShoppingBag,
  Film,
  TreePine
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Filter },
  { name: 'Sightseeing', icon: Compass },
  { name: 'Food', icon: Utensils },
  { name: 'Adventure', icon: Mountain },
  { name: 'Culture', icon: Landmark },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Entertainment', icon: Film },
  { name: 'Nature', icon: TreePine },
];

const ActivitySearchModal = ({ 
  isOpen, 
  onClose, 
  cityId, 
  cityName, 
  existingActivities = [], 
  onAddActivity 
}) => {
  const { formatPrice, currencySymbol, t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCost, setMaxCost] = useState('');
  const [addedIds, setAddedIds] = useState([]);

  // Custom Activity Form State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Sightseeing');
  const [customCost, setCustomCost] = useState('1000');
  const [customTime, setCustomTime] = useState('10:00');
  const [customParticipants, setCustomParticipants] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, cityId, selectedCategory, searchQuery, maxCost]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await getActivities({
        cityId,
        category: selectedCategory,
        search: searchQuery,
        maxCost: maxCost || undefined,
      });
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAlreadySelected = (act) => {
    if (addedIds.includes(act.id)) return true;
    return existingActivities.some(
      (existing) => 
        (existing.activityId && (existing.activityId === act.id || existing.activityId === act.activityId)) ||
        (existing.name && existing.name.toLowerCase() === act.name.toLowerCase())
    );
  };

  const handleAdd = (activity) => {
    onAddActivity(activity);
    setAddedIds((prev) => [...prev, activity.id]);
  };

  const handleCreateCustomActivity = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customAct = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      cost: Number(customCost) || 0,
      participantCount: Number(customParticipants) || 1,
      time: customTime || '10:00',
      isCustom: true,
      image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=300&q=80',
    };

    onAddActivity(customAct);
    setCustomName('');
    setCustomCost('1000');
    setShowCustomForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Discover Activities</span>
              <button
                type="button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-xs flex items-center space-x-1 transition-all ml-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Activity</span>
              </button>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add experiences to your itinerary for <span className="font-semibold text-primary-600">{cityName || 'Destination'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Activity Inline Form Drawer */}
        {showCustomForm && (
          <form onSubmit={handleCreateCustomActivity} className="p-5 bg-emerald-50/80 border-b border-emerald-200 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Create Your Own Custom Experience
              </h4>
              <button 
                type="button" 
                onClick={() => setShowCustomForm(false)} 
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Private Sunset Yacht Cruise"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Culture">Culture & Heritage</option>
                  <option value="Adventure">Adventure & Nature</option>
                  <option value="Shopping">Shopping & Nightlife</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Cost ({currencySymbol}) / Person</label>
                <input
                  type="number"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-700">Persons Doing Activity:</label>
                <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-xl border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setCustomParticipants((prev) => Math.max(1, prev - 1))}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold">{customParticipants}</span>
                  <button
                    type="button"
                    onClick={() => setCustomParticipants((prev) => prev + 1)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Add Custom Activity
              </button>
            </div>
          </form>
        )}

        {/* Filter Controls Bar */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3">
          {/* Search + Cost inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities, places, food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="relative">
              <span className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs flex items-center justify-center">
                {currencySymbol}
              </span>
              <input
                type="number"
                placeholder={`Max budget (${currencySymbol})`}
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Activities List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Finding best activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Compass className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No activities found</h4>
              <p className="text-xs text-slate-400">Try adjusting your category filter or max budget</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((act) => {
                const isSelected = isAlreadySelected(act);
                return (
                  <div
                    key={act.id}
                    className={`flex flex-col justify-between bg-white rounded-2xl border p-4 transition-all group ${
                      isSelected ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200/90 hover:shadow-md'
                    }`}
                  >
                    <div className="flex space-x-3">
                      <img
                        src={act.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80'}
                        alt={act.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {act.category}
                          </span>
                          <span className="text-xs font-semibold text-amber-500">★ {act.rating || '4.8'}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{act.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{act.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="flex items-center text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {act.durationHours || 2}h
                        </span>
                        <span className="flex items-center text-slate-900 font-extrabold">
                          {formatPrice(act.cost || 0)}
                        </span>
                      </div>

                      <button
                        onClick={() => !isSelected && handleAdd(act)}
                        disabled={isSelected}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 opacity-90 cursor-default'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20 cursor-pointer'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Already Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Done Selecting
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivitySearchModal;

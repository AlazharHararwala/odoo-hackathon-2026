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

const ActivitySearchModal = ({ isOpen, onClose, cityId, cityName, onAddActivity }) => {
  const { formatPrice, currencySymbol, t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCost, setMaxCost] = useState('');
  const [addedIds, setAddedIds] = useState([]);

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

  const handleAdd = (activity) => {
    onAddActivity(activity);
    setAddedIds((prev) => [...prev, activity.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== activity.id));
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discover Activities</h2>
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
                const isAdded = addedIds.includes(act.id);
                return (
                  <div
                    key={act.id}
                    className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={act.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80'}
                        alt={act.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
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
                          {act.durationHours}h
                        </span>
                        <span className="flex items-center text-slate-900 font-extrabold">
                          {formatPrice(act.cost || 0)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAdd(act)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
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
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Done Selecting
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivitySearchModal;

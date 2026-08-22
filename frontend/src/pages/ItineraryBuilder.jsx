import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTrip, 
  updateTrip, 
  deleteTrip,
  deleteTripStop, 
  addTripActivity, 
  deleteTripActivity,
  updateTripActivity,
  addTripStop,
  getCities,
  createShareLink
} from '../services/api';
import ActivitySearchModal from '../components/ActivitySearchModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { 
  GripVertical, 
  MapPin, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  IndianRupee, 
  Share2, 
  Eye, 
  Save, 
  Edit2, 
  Sparkles,
  Check,
  X,
  PieChart,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const getActivitySavingsTip = (act, formatPrice) => {
  const cat = act.category?.toLowerCase() || '';
  if (cat.includes('food') || cat.includes('dining')) {
    return 'Suggestion: You can avoid fine dining; try local street food or self-catered meals to stay within budget.';
  }
  if (cat.includes('sightseeing') || cat.includes('culture') || cat.includes('heritage')) {
    return 'Suggestion: You can avoid paid guided tours; explore free exterior landmarks, public walking trails, or free museum days.';
  }
  if (cat.includes('adventure') || cat.includes('nature')) {
    return 'Suggestion: You can avoid chartered tours; explore public scenic trails or free viewpoints.';
  }
  if (cat.includes('shopping') || cat.includes('nightlife')) {
    return 'Suggestion: You can avoid high cover charges; enjoy open evening walks and night markets.';
  }
  return `Suggestion: Skip or replace with a free attraction to reduce trip cost by ${formatPrice(act.cost)}.`;
};

// Sortable City Stop Component
const SortableCityStop = ({ 
  stop, 
  onRemoveStop, 
  onOpenActivityModal, 
  onDeleteActivity,
  onEditActivity,
  onUpdateStopCost,
  onUpdateActivityParticipants,
  isOverBudget = false
}) => {
  const { t, formatPrice, currencySymbol } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const stopTotal = (stop.activities || []).reduce((acc, act) => acc + (act.cost || 0) * (act.participantCount || 1), 0) + (Number(stop.accommodationCost) || 0) + (Number(stop.transportCost) || 0);

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'sightseeing':
        return 'bg-blue-600 text-white border-blue-700 shadow-xs';
      case 'food':
      case 'dining':
        return 'bg-amber-500 text-white border-amber-600 shadow-xs';
      case 'culture':
      case 'heritage':
        return 'bg-purple-600 text-white border-purple-700 shadow-xs';
      case 'nature':
      case 'adventure':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
      case 'shopping':
      case 'nightlife':
        return 'bg-rose-600 text-white border-rose-700 shadow-xs';
      default:
        return 'bg-indigo-600 text-white border-indigo-700 shadow-xs';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-3xl border-2 ${isDragging ? 'border-teal-600 shadow-2xl scale-[1.01]' : 'border-teal-200'} shadow-lg transition-all overflow-hidden`}
    >
      {/* City Stop Drag Header - Bold Forest Teal & Emerald */}
      <div 
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #047857 100%)' }}
        className="text-white p-5 sm:p-6 flex items-center justify-between shadow-md border-b-2 border-teal-700"
      >
        <div className="flex items-center space-x-3.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/20 text-teal-100 hover:text-white rounded-xl transition-colors"
            title="Drag to reorder city stop"
          >
            <GripVertical className="w-5 h-5 text-teal-200" />
          </button>
          <div 
            style={{ background: 'rgba(255, 255, 255, 0.22)' }}
            className="w-12 h-12 rounded-2xl border-2 border-white/40 flex items-center justify-center text-white font-black shadow-md"
          >
            <MapPin className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>📍 {stop.cityName}</span>
              {stop.country && (
                <span className="text-xs font-black bg-white/25 text-white px-3 py-0.5 rounded-full border border-white/40 backdrop-blur-xs">
                  {stop.country}
                </span>
              )}
            </h3>
            <p className="text-xs text-teal-100 font-bold tracking-wide mt-0.5 flex items-center space-x-1.5">
              <span>🗓️ {stop.startDate} – {stop.endDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div 
            style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
            className="text-right hidden sm:block px-4 py-2.5 rounded-2xl border border-teal-300/30 shadow-md"
          >
            <span className="text-[10px] text-teal-200 uppercase tracking-wider block font-black">{t('stopSubtotal', 'Stop Subtotal')}</span>
            <span className="text-base font-black text-white flex items-center justify-end">
              {formatPrice(stopTotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemoveStop(stop);
            }}
            className="p-3 text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center shrink-0 relative z-30"
            title="Delete whole city and activities"
          >
            <Trash2 className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* User Editable Stop Expenses: Accommodation & Travelling Costs */}
      <div className="bg-emerald-50/60 p-4 border-b border-teal-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-teal-200 shadow-2xs">
          <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>🏨</span>
              <span>Accommodation Cost ({currencySymbol})</span>
            </span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Editable</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={stop.accommodationCost !== undefined ? stop.accommodationCost : 5000}
              onChange={(e) => onUpdateStopCost && onUpdateStopCost(stop.id, 'accommodationCost', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-teal-200 shadow-2xs">
          <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>✈️</span>
              <span>Travelling / Transit Cost ({currencySymbol})</span>
            </span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Editable</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={stop.transportCost !== undefined ? stop.transportCost : 2000}
              onChange={(e) => onUpdateStopCost && onUpdateStopCost(stop.id, 'transportCost', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="e.g. 2000"
            />
          </div>
        </div>
      </div>

      {/* Activities Timeline List */}
      <div className="p-5 sm:p-6 space-y-4 bg-slate-50">
        {(!stop.activities || stop.activities.length === 0) ? (
          <div className="py-8 border-2 border-dashed border-teal-200 rounded-2xl text-center space-y-3 bg-white">
            <p className="text-xs font-bold text-slate-500">No activities scheduled for {stop.cityName} yet.</p>
            <button
              onClick={() => onOpenActivityModal(stop)}
              style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-white rounded-xl text-xs font-black shadow-md shadow-teal-800/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('addActivity', 'Add Activity')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stop.activities.map((act) => (
              <div
                key={act.id}
                className="group flex items-center justify-between bg-white hover:bg-teal-50/40 p-4 sm:p-4.5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 shadow-sm transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-white font-black text-xs rounded-xl shrink-0 flex items-center space-x-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-white font-black">{act.time || '10:00'}</span>
                  </span>

                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-black text-base text-slate-900 tracking-tight leading-snug">{act.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[11px] font-black border px-3 py-0.5 rounded-lg inline-block ${getCategoryBadgeClass(act.category)}`}>
                        {act.category || 'Sightseeing'}
                      </span>
                      {isOverBudget && (act.cost || 0) > 0 && (
                        <span className="text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 shadow-2xs">
                          ⚠️ Can Avoid
                        </span>
                      )}
                    </div>
                    {isOverBudget && (act.cost || 0) > 0 && (
                      <p className="text-xs text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-xl px-3 py-1.5 mt-2 font-medium leading-relaxed">
                        💡 {getActivitySavingsTip(act, formatPrice)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  {/* Person / Participant Counter */}
                  <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200" title="Number of people doing this activity">
                    <Users className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
                    <button
                      type="button"
                      onClick={() => onUpdateActivityParticipants && onUpdateActivityParticipants(stop.id, act.id, (act.participantCount || 1) - 1)}
                      disabled={(act.participantCount || 1) <= 1}
                      className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-2xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-black text-slate-900">{act.participantCount || 1}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateActivityParticipants && onUpdateActivityParticipants(stop.id, act.id, (act.participantCount || 1) + 1)}
                      className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      +
                    </button>
                  </div>

                  {act.cost === 0 ? (
                    <span className="font-black text-xs text-white bg-emerald-600 px-3.5 py-1.5 rounded-xl shadow-xs tracking-wide uppercase">
                      {t('free', 'Free')}
                    </span>
                  ) : (
                    <span className="font-black text-sm text-white bg-slate-900 px-3 py-1.5 rounded-xl shadow-xs flex items-center space-x-1" title={`${formatPrice(act.cost)} x ${act.participantCount || 1} persons`}>
                      <span>{formatPrice((act.cost || 0) * (act.participantCount || 1))}</span>
                      {(act.participantCount || 1) > 1 && (
                        <span className="text-[10px] text-teal-300 font-bold ml-1">({act.participantCount}p)</span>
                      )}
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteActivity(stop.id, act.id)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer"
                    title="Remove Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Activity Button Bar */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onOpenActivityModal(stop)}
            style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}
            className="px-6 py-3 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-800/30 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('addActivity', 'Add Activity')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ItineraryBuilder = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, formatPrice } = useLanguage();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal Controls
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedNewCityId, setSelectedNewCityId] = useState('');
  const [deletingStopId, setDeletingStopId] = useState(null);
  const [showDeleteTripModal, setShowDeleteTripModal] = useState(false);
  const [newStopAccomCost, setNewStopAccomCost] = useState(5000);
  const [newStopTransportCost, setNewStopTransportCost] = useState(2000);

  const handleConfirmDeleteTrip = async () => {
    try {
      await deleteTrip(trip.id);
      showToast('Trip deleted successfully', 'info');
      navigate('/trips');
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    } finally {
      setShowDeleteTripModal(false);
    }
  };

  // DND Kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchTripDetails();
    fetchCitiesCatalog();
  }, [tripId]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const data = await getTrip(tripId);
      if (data && data.stops) {
        data.stops = data.stops.map((s, idx) => ({
          ...s,
          id: s.id || `stop_${data.id || 'trip'}_${idx}_${s.cityId || idx}`,
          activities: (s.activities || []).map((a, aIdx) => ({
            ...a,
            id: a.id || `tac_${idx}_${aIdx}`,
          })),
        }));
      }
      setTrip(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading trip itinerary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCitiesCatalog = async () => {
    try {
      const cities = await getCities();
      setAvailableCities(cities);
      if (cities.length > 0) setSelectedNewCityId(cities[0].id);
    } catch (e) { console.error(e); }
  };

  // Status Change Handler
  const handleStatusChange = async (newStatus) => {
    try {
      await updateTrip(trip.id, { status: newStatus });
      setTrip((prev) => ({ ...prev, status: newStatus }));
      showToast(`Trip status updated to "${newStatus}"`, 'success');
    } catch (err) {
      showToast('Failed to update trip status', 'error');
    }
  };

  // Reordering Stops via DND
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTrip((prev) => {
        const oldIndex = prev.stops.findIndex((s) => s.id === active.id);
        const newIndex = prev.stops.findIndex((s) => s.id === over.id);
        const updatedStops = arrayMove(prev.stops, oldIndex, newIndex).map((s, idx) => ({
          ...s,
          order: idx + 1,
        }));
        const updatedTrip = { ...prev, stops: updatedStops };
        updateTrip(tripId, { stops: updatedStops });
        return updatedTrip;
      });
      showToast('Reordered city stops', 'info');
    }
  };

  // Add Activity to Specific Stop
  const handleAddActivityToStop = async (activity) => {
    if (!activeStopForActivity) return;
    const targetStopId = String(activeStopForActivity.id);

    try {
      const newTac = await addTripActivity(trip.id, targetStopId, {
        activityId: activity.id,
        name: activity.name,
        cost: activity.cost,
        category: activity.category,
        time: '10:00',
      });

      // Update local state ONLY for this specific stop
      setTrip((prev) => {
        if (!prev) return prev;
        const updatedStops = (prev.stops || []).map((stop) => {
          if (String(stop.id) === targetStopId) {
            return {
              ...stop,
              activities: [...(stop.activities || []), newTac],
            };
          }
          return stop;
        });
        updateTrip(tripId || prev.id, { stops: updatedStops });
        return { ...prev, stops: updatedStops };
      });

      showToast(`Added "${activity.name}" to ${activeStopForActivity.cityName}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add activity', 'error');
    }
  };

  // Delete Activity
  const handleDeleteActivity = async (stopId, activityId) => {
    const targetStopId = String(stopId);
    const targetActId = String(activityId);
    try {
      setTrip((prev) => {
        if (!prev) return prev;
        const updatedStops = (prev.stops || []).map((stop) => {
          if (String(stop.id) === targetStopId) {
            return {
              ...stop,
              activities: (stop.activities || []).filter((a) => String(a.id) !== targetActId && String(a.activityId) !== targetActId),
            };
          }
          return stop;
        });
        updateTrip(tripId || prev.id, { stops: updatedStops });
        return { ...prev, stops: updatedStops };
      });
      await deleteTripActivity(trip.id, targetActId);
      showToast('Activity removed from itinerary', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove activity', 'error');
    }
  };

  // Handle Live Updating Stop Costs (Accommodation & Travelling)
  const handleUpdateStopCost = async (stopId, field, rawValue) => {
    const val = Number(rawValue) || 0;
    setTrip((prev) => {
      if (!prev || !prev.stops) return prev;
      const updatedStops = prev.stops.map((s) => {
        if (s.id === stopId) {
          return { ...s, [field]: val };
        }
        return s;
      });
      return { ...prev, stops: updatedStops };
    });

    const targetStop = trip?.stops?.find((s) => s.id === stopId);
    if (targetStop) {
      try {
        await updateTripStop(stopId, {
          ...targetStop,
          [field]: val,
        });
      } catch (err) {
        console.error('Failed to update stop cost:', err);
      }
    }
  };

  // Handle Updating Participant Count per Activity
  const handleUpdateActivityParticipants = async (stopId, actId, newCount) => {
    const count = Math.max(1, parseInt(newCount) || 1);
    setTrip((prev) => {
      if (!prev || !prev.stops) return prev;
      const updatedStops = prev.stops.map((s) => {
        if (s.id === stopId) {
          const updatedActs = (s.activities || []).map((a) => {
            if (a.id === actId) {
              return { ...a, participantCount: count };
            }
            return a;
          });
          return { ...s, activities: updatedActs };
        }
        return s;
      });
      return { ...prev, stops: updatedStops };
    });

    try {
      await updateTripActivity(trip.id, actId, { participantCount: count });
    } catch (err) {
      console.error('Failed to update activity participant count:', err);
    }
  };

  // Add New City Stop
  const handleAddCityStop = async () => {
    if (!selectedNewCityId) return;
    try {
      const newStop = await addTripStop(trip.id, { 
        cityId: selectedNewCityId,
        accommodationCost: Number(newStopAccomCost) || 5000,
        transportCost: Number(newStopTransportCost) || 2000,
      });
      setTrip((prev) => ({
        ...prev,
        stops: [...(prev.stops || []), newStop],
      }));
      setShowAddCityModal(false);
      showToast(`Added ${newStop.cityName} stop to your trip!`, 'success');
    } catch (err) {
      showToast('Failed to add city stop', 'error');
    }
  };

  // Delete whole city stop and all its activities from the trip
  const handleDeleteStop = async (stopOrId) => {
    const stopId = typeof stopOrId === 'object' ? stopOrId?.id : stopOrId;
    const cityName = typeof stopOrId === 'object' ? stopOrId?.cityName : 'City';
    if (!stopId) return;
    const targetId = String(stopId);

    // 1. Instantly update UI state and persist with updateTrip
    setTrip((prev) => {
      if (!prev) return prev;
      const updatedStops = (prev.stops || []).filter(
        (s) => String(s.id) !== targetId && String(s._id) !== targetId
      );
      updateTrip(tripId || prev.id, { stops: updatedStops });
      return {
        ...prev,
        stops: updatedStops,
      };
    });

    // 2. Persist with deleteTripStop API
    try {
      await deleteTripStop(tripId || trip?.id, targetId);
      showToast(`${cityName} stop and all its activities removed!`, 'info');
    } catch (err) {
      console.error('Error removing stop:', err);
      showToast('Failed to remove stop', 'error');
    }
  };

  const handleConfirmRemoveStop = async () => {
    if (!deletingStopId) return;
    await handleDeleteStop(deletingStopId);
    setDeletingStopId(null);
  };

  // Share Link generator
  const handleShare = async () => {
    try {
      const { shareUrl } = await createShareLink(trip.id);
      navigator.clipboard.writeText(shareUrl);
      showToast('Public share link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy share link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading Interactive Itinerary Builder...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Trip not found</h2>
        <button onClick={() => navigate('/trips')} className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl">
          Return to My Trips
        </button>
      </div>
    );
  }

  // Calculate live trip metrics
  const totalStopsCost = (trip.stops || []).reduce((acc, stop) => {
    const actSum = (stop.activities || []).reduce((aSum, a) => aSum + (a.cost || 0), 0);
    return acc + actSum + (stop.accommodationCost || 0) + (stop.transportCost || 0);
  }, 0);

  const targetBudget = trip.targetBudget || 50000;
  const isOverBudget = totalStopsCost > targetBudget;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800 overflow-hidden">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary-500/30 border border-primary-400/40 text-primary-300 text-xs font-bold backdrop-blur-md">
                Interactive Itinerary Builder
              </span>
              
              {/* INTERACTIVE STATUS SELECTOR DROPDOWN */}
              <div className="relative inline-block">
                <select
                  value={trip.status || 'Planning'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-3.5 py-1 rounded-full text-xs font-extrabold border backdrop-blur-md cursor-pointer transition-all focus:outline-none ${
                    trip.status === 'Upcoming'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : trip.status === 'Completed'
                      ? 'bg-slate-700/60 border-slate-500 text-slate-300'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  }`}
                >
                  <option value="Planning" className="bg-slate-900 text-amber-300">🟡 Status: Planning</option>
                  <option value="Upcoming" className="bg-slate-900 text-emerald-300">🟢 Status: Upcoming</option>
                  <option value="Completed" className="bg-slate-900 text-slate-300">🔘 Status: Completed</option>
                </select>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-primary-400" />
                {trip.startDate} – {trip.endDate} ({trip.totalDays} Days)
              </span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-teal-400" />
                {trip.stops?.length || 0} Cities
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/itinerary/${trip.id}`)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center space-x-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Mode</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Trip</span>
            </button>

            <button
              onClick={() => setShowDeleteTripModal(true)}
              className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 transition-colors border border-rose-500/40"
              title="Delete trip permanently"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Trip</span>
            </button>
          </div>
        </div>

        {/* Live Budget Meter */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-0.5">Calculated Total Cost:</span>
            <span className="text-lg font-extrabold text-teal-400 flex items-center">
              {formatPrice(totalStopsCost)}
            </span>
          </div>

          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-0.5">Target Budget Limit:</span>
            <span className="text-lg font-extrabold text-white flex items-center">
              {formatPrice(trip.targetBudget || 50000)}
            </span>
          </div>

          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block mb-0.5">Budget Status:</span>
              <span className={`text-xs font-bold ${totalStopsCost > (trip.targetBudget || 50000) ? 'text-rose-400' : 'text-emerald-400'}`}>
                {totalStopsCost > (trip.targetBudget || 50000) ? 'Over Budget' : 'Within Budget'}
              </span>
            </div>
            <button
              onClick={() => navigate('/budget')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              title="Open Detailed Budget Page"
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>



      {/* Main Drag-and-Drop City Stops Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('itineraryRoute', 'Itinerary Route & Activities')}</h2>
            <p className="text-xs text-slate-500">{t('itineraryDesc', 'Drag handle to reorder city sequence. Add or remove activities per stop.')}</p>
          </div>

          <button
            onClick={() => setShowAddCityModal(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ {t('addCityStop', 'Add City Stop')}</span>
          </button>
        </div>

        {(!trip.stops || trip.stops.length === 0) ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No city stops added</h3>
            <button
              onClick={() => setShowAddCityModal(true)}
              className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl"
            >
              Add First City
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={trip.stops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {trip.stops.map((stop) => (
                  <SortableCityStop
                    key={stop.id}
                    stop={stop}
                    onRemoveStop={handleDeleteStop}
                    onOpenActivityModal={(s) => setActiveStopForActivity(s)}
                    onDeleteActivity={handleDeleteActivity}
                    onUpdateStopCost={handleUpdateStopCost}
                    onUpdateActivityParticipants={handleUpdateActivityParticipants}
                    isOverBudget={isOverBudget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Activity Search Drawer / Modal */}
      {activeStopForActivity && (
        <ActivitySearchModal
          isOpen={!!activeStopForActivity}
          onClose={() => setActiveStopForActivity(null)}
          cityId={activeStopForActivity.cityId}
          cityName={activeStopForActivity.cityName}
          existingActivities={activeStopForActivity.activities || []}
          onAddActivity={handleAddActivityToStop}
        />
      )}

      {/* Add City Modal */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Add New City Stop</h3>
              <button onClick={() => setShowAddCityModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Destination City</label>
              <select
                value={selectedNewCityId}
                onChange={(e) => setSelectedNewCityId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {availableCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country} ({c.costIndex})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">🏨 Accommodation Cost ({currencySymbol})</label>
                <input
                  type="number"
                  value={newStopAccomCost}
                  onChange={(e) => setNewStopAccomCost(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">✈️ Travelling Cost ({currencySymbol})</label>
                <input
                  type="number"
                  value={newStopTransportCost}
                  onChange={(e) => setNewStopTransportCost(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  placeholder="2000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowAddCityModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCityStop}
                className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl"
              >
                Add City
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Stop Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStopId}
        onClose={() => setDeletingStopId(null)}
        onConfirm={handleConfirmRemoveStop}
        title="Remove City Stop"
        message="Are you sure you want to remove this city stop and its scheduled activities from your itinerary?"
        confirmText="Remove Stop"
        isDanger={true}
      />

      {/* Delete Entire Trip Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteTripModal}
        onClose={() => setShowDeleteTripModal(false)}
        onConfirm={handleConfirmDeleteTrip}
        title="Delete Trip"
        message={`Are you sure you want to delete "${trip?.name}"? This action cannot be undone.`}
        confirmText="Delete Trip"
        isDanger={true}
      />
    </div>
  );
};

export default ItineraryBuilder;

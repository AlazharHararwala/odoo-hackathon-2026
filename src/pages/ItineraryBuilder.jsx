import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTrip, 
  updateTrip, 
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
  ChevronDown
} from 'lucide-react';

// Sortable City Stop Component
const SortableCityStop = ({ 
  stop, 
  onRemoveStop, 
  onOpenActivityModal, 
  onDeleteActivity,
  onEditActivity
}) => {
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

  const stopTotal = (stop.activities || []).reduce((acc, act) => acc + (act.cost || 0), 0) + (stop.accommodationCost || 0) + (stop.transportCost || 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-3xl border ${isDragging ? 'border-primary-500 shadow-2xl' : 'border-slate-200/90'} shadow-sm transition-all overflow-hidden`}
    >
      {/* City Stop Drag Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 text-white rounded-xl transition-colors"
            title="Drag to reorder city stop"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-extrabold shadow-xs">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>📍 {stop.cityName}</span>
              {stop.country && <span className="text-xs font-bold text-teal-100">({stop.country})</span>}
            </h3>
            <p className="text-xs text-teal-100 font-semibold">
              {stop.startDate} – {stop.endDate}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block bg-black/20 px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-[10px] text-teal-100 uppercase tracking-wider block font-bold">Stop Subtotal</span>
            <span className="text-xs font-black text-white flex items-center justify-end">
              <IndianRupee className="w-3.5 h-3.5 text-white" />
              {stopTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => onRemoveStop(stop.id)}
            className="p-2 text-white hover:bg-rose-500/30 rounded-xl transition-colors"
            title="Remove city stop"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activities Timeline List */}
      <div className="p-5 space-y-3">
        {(!stop.activities || stop.activities.length === 0) ? (
          <div className="py-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">No activities scheduled for {stop.cityName} yet.</p>
            <button
              onClick={() => onOpenActivityModal(stop)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stop.activities.map((act) => (
              <div
                key={act.id}
                className="group flex items-center justify-between bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-950 font-black text-xs rounded-xl shrink-0 flex items-center space-x-1 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-primary-600" />
                    <span className="text-slate-950 font-black">{act.time || '10:00'}</span>
                  </span>

                  <div className="min-w-0">
                    <h4 className="font-black text-base text-slate-950 tracking-tight leading-snug">{act.name}</h4>
                    <span className="text-[11px] font-extrabold text-primary-800 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                      {act.category || 'Sightseeing'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-black text-sm text-slate-950 flex items-center bg-slate-100 px-3 py-1 rounded-xl border border-slate-300 shadow-2xs">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-700 mr-0.5" />
                    {act.cost === 0 ? 'Free' : act.cost?.toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => onDeleteActivity(stop.id, act.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove Activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

                  <button
                    onClick={() => onDeleteActivity(stop.id, act.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove Activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Activity</span>
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

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal Controls
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedNewCityId, setSelectedNewCityId] = useState('');
  const [deletingStopId, setDeletingStopId] = useState(null);

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

  // Add Activity to Stop
  const handleAddActivityToStop = async (activity) => {
    if (!activeStopForActivity) return;

    try {
      const newTac = await addTripActivity(trip.id, activeStopForActivity.id, {
        activityId: activity.id,
        name: activity.name,
        cost: activity.cost,
        category: activity.category,
        time: '10:00',
      });

      // Update local state instantly
      setTrip((prev) => {
        const updatedStops = prev.stops.map((stop) => {
          if (stop.id === activeStopForActivity.id) {
            return {
              ...stop,
              activities: [...(stop.activities || []), newTac],
            };
          }
          return stop;
        });
        return { ...prev, stops: updatedStops };
      });

      showToast(`Added "${activity.name}" to ${activeStopForActivity.cityName}!`, 'success');
    } catch (err) {
      showToast('Failed to add activity', 'error');
    }
  };

  // Delete Activity
  const handleDeleteActivity = async (stopId, activityId) => {
    try {
      await deleteTripActivity(trip.id, activityId);
      setTrip((prev) => {
        const updatedStops = prev.stops.map((stop) => {
          if (stop.id === stopId) {
            return {
              ...stop,
              activities: stop.activities.filter((a) => a.id !== activityId),
            };
          }
          return stop;
        });
        return { ...prev, stops: updatedStops };
      });
      showToast('Activity removed from itinerary', 'info');
    } catch (err) {
      showToast('Failed to remove activity', 'error');
    }
  };

  // Add New City Stop
  const handleAddCityStop = async () => {
    if (!selectedNewCityId) return;
    try {
      const newStop = await addTripStop(trip.id, { cityId: selectedNewCityId });
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

  // Delete City Stop
  const handleConfirmRemoveStop = async () => {
    if (!deletingStopId) return;
    try {
      await deleteTripStop(trip.id, deletingStopId);
      setTrip((prev) => ({
        ...prev,
        stops: prev.stops.filter((s) => s.id !== deletingStopId),
      }));
      showToast('City stop removed', 'info');
    } catch (err) {
      showToast('Failed to remove stop', 'error');
    } finally {
      setDeletingStopId(null);
    }
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
          </div>
        </div>

        {/* Live Budget Meter */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-0.5">Calculated Total Cost:</span>
            <span className="text-lg font-extrabold text-teal-400 flex items-center">
              <IndianRupee className="w-4 h-4" />
              {totalStopsCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-0.5">Target Budget Limit:</span>
            <span className="text-lg font-extrabold text-white flex items-center">
              <IndianRupee className="w-4 h-4" />
              {(trip.targetBudget || 50000).toLocaleString('en-IN')}
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Itinerary Route & Activities</h2>
            <p className="text-xs text-slate-500">Drag handle to reorder city sequence. Add or remove activities per stop.</p>
          </div>

          <button
            onClick={() => setShowAddCityModal(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add City Stop</span>
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
                    onRemoveStop={(id) => setDeletingStopId(id)}
                    onOpenActivityModal={(s) => setActiveStopForActivity(s)}
                    onDeleteActivity={handleDeleteActivity}
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
    </div>
  );
};

export default ItineraryBuilder;

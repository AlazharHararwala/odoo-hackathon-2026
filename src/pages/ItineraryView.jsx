import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip, createShareLink } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Share2, 
  Edit3, 
  ArrowLeft, 
  List, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

const ItineraryView = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewFormat, setViewFormat] = useState('list'); // 'list' | 'calendar'

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const data = await getTrip(tripId);
      setTrip(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading itinerary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const { shareUrl } = await createShareLink(trip.id);
      navigator.clipboard.writeText(shareUrl);
      showToast('Public itinerary link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy share link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading Itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-slate-700">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/trips')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Format Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setViewFormat('list')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewFormat === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day-by-Day List</span>
            </button>
            <button
              onClick={() => setViewFormat('calendar')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewFormat === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          <button
            onClick={() => navigate(`/itinerary-builder/${trip.id}`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Builder</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Read-Only Trip Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/30 border border-primary-400/40 text-primary-300 text-xs font-bold backdrop-blur-md">
            <span>Read-Only Itinerary View</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{trip.name}</h1>
          <p className="text-sm text-slate-200 max-w-xl leading-relaxed">{trip.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-3 border-t border-white/20">
            <span className="flex items-center font-semibold">
              <Calendar className="w-4 h-4 mr-1.5 text-primary-400" />
              {trip.startDate} – {trip.endDate} ({trip.totalDays} Days)
            </span>
            <span className="flex items-center font-semibold">
              <MapPin className="w-4 h-4 mr-1.5 text-teal-400" />
              {trip.stops?.length || 0} Cities Route
            </span>
            <span className="flex items-center font-bold text-amber-400 text-sm">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {(trip.estimatedBudget || 0).toLocaleString('en-IN')} Est. Total
            </span>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewFormat === 'list' ? (
        /* DAY-BY-DAY LIST VIEW */
        <div className="space-y-6">
          {trip.stops?.map((stop, sIdx) => (
            <div key={stop.id || sIdx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              {/* City Section Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-sm">
                    {sIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900">📍 {stop.cityName}</h3>
                    <p className="text-xs text-slate-500">{stop.startDate} – {stop.endDate}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {stop.activities?.length || 0} Activities
                </span>
              </div>

              {/* Day Activities Sequence */}
              <div className="space-y-4 pl-4 border-l-2 border-primary-100">
                {stop.activities?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No scheduled activities for this city.</p>
                ) : (
                  stop.activities?.map((act) => (
                    <div key={act.id} className="relative pl-6 space-y-1">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary-500 ring-4 ring-white" />
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {act.time}
                        </span>
                        <span className="font-semibold text-slate-500">{act.category}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900">{act.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-600 pt-0.5">
                        <span className="font-bold text-slate-900 flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {act.cost === 0 ? 'Free' : act.cost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* GRID CALENDAR VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trip.stops?.map((stop, sIdx) => (
            <div key={stop.id || sIdx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-lg text-slate-900">📍 {stop.cityName}</h3>
                <span className="text-xs font-semibold text-slate-500">{stop.startDate}</span>
              </div>
              <div className="space-y-2">
                {stop.activities?.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-primary-700 block">{act.time} — {act.name}</span>
                      <span className="text-slate-500 text-[10px]">{act.category}</span>
                    </div>
                    <span className="font-extrabold text-slate-800">₹{act.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItineraryView;

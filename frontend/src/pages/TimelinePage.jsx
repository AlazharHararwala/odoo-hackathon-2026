import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, getTripTimeline } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  IndianRupee, 
  ChevronDown, 
  ChevronUp, 
  ArrowDown, 
  Compass,
  Plus
} from 'lucide-react';

const TimelinePage = () => {
  const navigate = useNavigate();
  const { t, formatPrice } = useLanguage();
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchTimeline(selectedTripId);
    } else {
      setTimelineData(null);
    }
  }, [selectedTripId]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data || []);
      if (data && data.length > 0) {
        setSelectedTripId(data[0].id);
      } else {
        setTimelineData(null);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchTimeline = async (tripId) => {
    setLoading(true);
    try {
      const data = await getTripTimeline(tripId);
      setTimelineData(data);
      // Default all days to expanded
      const initialExpand = {};
      data.timelineDays?.forEach((d) => { initialExpand[d.dayNumber] = true; });
      setExpandedDays(initialExpand);
    } catch (err) {
      console.error(err);
      showToast('Error loading trip timeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trip Timeline & Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">Chronological visual schedule of your multi-city stops and activities</p>
        </div>

        {trips.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.startDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Building visual timeline...</p>
        </div>
      ) : trips.length === 0 || !timelineData ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-slate-900">No trips planned yet</h3>
            <p className="text-xs text-slate-500">
              Create your first multi-city trip to view its day-by-day chronological schedule and itinerary timeline.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-trip')}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 transition-all hover:scale-105 inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a Trip</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {timelineData.timelineDays?.map((day, idx) => {
            const isExpanded = expandedDays[day.dayNumber];
            return (
              <React.Fragment key={day.stopId || idx}>
                {/* Day / Stop Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
                  {/* Day Header */}
                  <div
                    onClick={() => toggleDay(day.dayNumber)}
                    className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-primary-600/40 border border-primary-400/30 flex items-center justify-center font-black text-sm text-primary-300">
                        {day.dayNumber}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-lg text-white">📍 {day.cityName}</span>
                          <span className="text-xs text-slate-400 font-normal">({day.country})</span>
                        </div>
                        <span className="text-xs text-slate-300 flex items-center mt-0.5">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1 text-primary-400" />
                          {day.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-300">
                        {day.events?.length || 0} Events
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Day Events Body */}
                  {isExpanded && (
                    <div className="p-6 space-y-4">
                      {(!day.events || day.events.length === 0) ? (
                        <p className="text-xs text-slate-400 py-2">No activities scheduled for this day.</p>
                      ) : (
                        <div className="space-y-3 pl-4 border-l-2 border-primary-200">
                          {day.events.map((event) => (
                            <div
                              key={event.id}
                              className="relative pl-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary-600 ring-4 ring-white" />
                              
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="px-2.5 py-0.5 rounded-md bg-primary-100 text-primary-800 text-[11px] font-bold flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {event.time}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                                    {event.category}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">{event.name}</h4>
                              </div>

                              <div className="flex items-center space-x-3 self-end sm:self-center">
                                <span className="font-extrabold text-sm text-slate-900 flex items-center bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                  {formatPrice(event.cost || 0)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Transition Arrow between Stops */}
                {idx < timelineData.timelineDays.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center shadow-2xs">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimelinePage;

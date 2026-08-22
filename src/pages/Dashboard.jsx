import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTrips, getCities, createShareLink, deleteTrip } from '../services/api';
import TripCard from '../components/TripCard';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { 
  Plus, 
  Compass, 
  Calendar, 
  PieChart, 
  MapPin, 
  IndianRupee, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, formatPrice } = useLanguage();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingTripId, setDeletingTripId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tripsData, citiesData] = await Promise.all([
        getTrips(),
        getCities()
      ]);
      setTrips(tripsData);
      setPopularCities(citiesData.slice(0, 4));
    } catch (err) {
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteTrip = async () => {
    if (!deletingTripId) return;
    try {
      await deleteTrip(deletingTripId);
      setTrips(trips.filter((t) => t.id !== deletingTripId));
      showToast('Trip deleted successfully', 'info');
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    } finally {
      setDeletingTripId(null);
    }
  };

  const handleShareTrip = async (trip) => {
    try {
      const { shareUrl } = await createShareLink(trip.id);
      navigator.clipboard.writeText(shareUrl);
      showToast('Share link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to generate share link', 'error');
    }
  };

  const totalPlannedSpending = trips.reduce((sum, t) => sum + (t.estimatedBudget || 0), 0);
  const totalDaysPlanned = trips.reduce((sum, t) => {
    if (!t.startDate || !t.endDate) return sum;
    const days = Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return sum + (days > 0 ? days : 1);
  }, 0);
  const avgPerDay = totalDaysPlanned > 0 ? Math.round(totalPlannedSpending / totalDaysPlanned) : 0;

  const upcomingTrip = trips
    .filter((t) => t.status === 'Upcoming' || t.status === 'Planning')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getTimeBasedGreeting = (userName) => {
    const hour = new Date().getHours();
    const name = userName || 'Explorer';
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${name}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${name}`;
    } else {
      return `Good evening, ${name}`;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{getTimeBasedGreeting(user?.name)}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            Where is your heart taking you next?
          </h1>
          <p className="text-sm text-slate-300">
            Crafting memories across {trips.length} active trip{trips.length !== 1 ? 's' : ''} and {trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0)} destination stops.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/create-trip')}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('planNewTrip', 'Plan New Trip')}</span>
          </button>
        </div>
      </div>

      {/* Daily Travel Inspiration Quote & Vibe Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-emerald-500/10 border border-amber-200/60 rounded-3xl p-5 flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold italic text-slate-800 text-sm">
              "The world is a book and those who do not travel read only one page."
            </p>
            <p className="text-[11px] text-slate-500 font-semibold">— Saint Augustine • Travel Inspiration of the Day</p>
          </div>
        </div>

        {/* Travel Vibe Selector Badge */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <span>✨ Your Travel Vibe Today</span>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100/70 text-emerald-800 text-[11px] font-bold cursor-pointer hover:bg-emerald-200 transition-colors">
              🌴 Chill & Relax
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-sky-100/70 text-sky-800 text-[11px] font-bold cursor-pointer hover:bg-sky-200 transition-colors">
              🏛️ Culture Walk
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-100/70 text-amber-800 text-[11px] font-bold cursor-pointer hover:bg-amber-200 transition-colors">
              🍜 Foodie Explorer
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats & Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Planned Budget 💰</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{formatPrice(totalPlannedSpending)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-sm">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Daily Travel Pace 🧭</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{formatPrice(avgPerDay)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Next Horizon 🌅</span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 line-clamp-1">
              {upcomingTrip ? upcomingTrip.name : 'Ready for your next trip'}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Saved Destinations 🗺️</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0)} Cities
            </h3>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/create-trip')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Build New Trip</h4>
          <p className="text-xs text-slate-500 mt-0.5">Step-by-step route wizard</p>
        </button>

        <button
          onClick={() => navigate('/explore')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-2xl bg-teal-100/70 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Explore 900+ Cities</h4>
          <p className="text-xs text-slate-500 mt-0.5">High-res photos & activities</p>
        </button>

        <button
          onClick={() => navigate('/timeline')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Visual Timeline</h4>
          <p className="text-xs text-slate-500 mt-0.5">Calendar & route map</p>
        </button>

        <button
          onClick={() => navigate('/budget')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <PieChart className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Wallet & Budget</h4>
          <p className="text-xs text-slate-500 mt-0.5">Interactive cost breakdown</p>
        </button>
      </div>

      {/* Upcoming & Active Trips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Upcoming Trips</h2>
            <p className="text-xs text-slate-500">Manage and customize your planned itineraries</p>
          </div>
          <Link to="/trips" className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700">
            <span>View all trips ({trips.length})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200/60 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-gradient-to-b from-emerald-50/60 to-teal-50/30 border border-emerald-200/80 rounded-3xl p-10 md:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-800">Your canvas is blank — let's paint a journey ✈️</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No active trips planned yet. Pick your dream destinations and let GlobeTrotter structure your dates, routes, and custom activities.
              </p>
            </div>
            <button
              onClick={() => navigate('/create-trip')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md hover:scale-105"
            >
              ✨ Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onShare={handleShareTrip}
                onDelete={(id) => setDeletingTripId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popular Destinations Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Popular Destinations</h2>
            <p className="text-xs text-slate-500">Explore trending cities to add to your next trip</p>
          </div>
          <Link to="/explore" className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700">
            <span>Explore all destinations</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCities.map((city) => (
            <div
              key={city.id}
              onClick={() => navigate(`/explore?search=${city.name}`)}
              className="group relative rounded-2xl overflow-hidden h-44 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-semibold tracking-wider uppercase block w-max mb-1">
                  {city.country}
                </span>
                <h4 className="font-bold text-sm">{city.name}</h4>
                <p className="text-[10px] text-slate-300 flex items-center justify-between mt-0.5">
                  <span>{city.costIndex}</span>
                  <span className="text-amber-400 font-bold">★ {city.popularity}%</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Delete Trip Modal */}
      <ConfirmModal
        isOpen={!!deletingTripId}
        title="Delete Trip"
        message="Are you sure you want to delete this trip itinerary? This action cannot be undone."
        confirmText="Delete Trip"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteTrip}
        onClose={() => setDeletingTripId(null)}
      />
    </div>
  );
};

export default Dashboard;

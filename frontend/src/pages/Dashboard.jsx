import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrips, getCities, createShareLink } from '../services/api';
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
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingTripId, setDeletingTripId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsData, citiesData] = await Promise.all([
        getTrips(),
        getCities()
      ]);
      setTrips(tripsData);
      setPopularCities(citiesData.slice(0, 6)); // Top 6 popular destinations
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
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

  // Financial Stats Calculation
  const totalPlannedSpending = trips.reduce((acc, t) => acc + (t.estimatedBudget || 0), 0);
  const totalDays = trips.reduce((acc, t) => acc + (t.totalDays || 1), 0);
  const avgPerDay = totalDays > 0 ? Math.round(totalPlannedSpending / totalDays) : 0;
  const upcomingTrip = trips.find(t => t.status === 'Upcoming') || trips[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400 via-teal-600 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Travel Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Good morning, {user?.name ? user.name.split(' ')[0] : 'Traveler'} 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
              Ready to plan your next adventure? Customize multi-city stops, activities, and budget estimates.
            </p>
          </div>

          <button
            onClick={() => navigate('/create-trip')}
            className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white font-bold rounded-2xl text-sm shadow-xl shadow-primary-900/50 flex items-center space-x-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* Quick Stats & Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Planned Spending</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">₹{totalPlannedSpending.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Average Spend / Day</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">₹{avgPerDay.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Next Upcoming Trip</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
              {upcomingTrip ? upcomingTrip.name : 'None Scheduled'}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Cities Planned</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0)} Cities
            </h3>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/create-trip')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Plan New Trip</h4>
          <p className="text-xs text-slate-500 mt-0.5">Multi-step wizard</p>
        </button>

        <button
          onClick={() => navigate('/explore')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Explore Cities</h4>
          <p className="text-xs text-slate-500 mt-0.5">Discover destinations</p>
        </button>

        <button
          onClick={() => navigate('/timeline')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Trip Calendar</h4>
          <p className="text-xs text-slate-500 mt-0.5">Visual timeline view</p>
        </button>

        <button
          onClick={() => navigate('/budget')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PieChart className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Budget Analytics</h4>
          <p className="text-xs text-slate-500 mt-0.5">Recharts insights</p>
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
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800">No trips planned yet</h3>
              <p className="text-xs text-slate-500">Create your first multi-city adventure and build an unforgettable itinerary.</p>
            </div>
            <button
              onClick={() => navigate('/create-trip')}
              className="px-5 py-2.5 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              + Create First Trip
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
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSharedTrip, copySharedTrip } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Globe, 
  Copy, 
  Share2, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const SharedTrip = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { formatPrice, t } = useLanguage();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchSharedItinerary();
  }, [shareId]);

  const fetchSharedItinerary = async () => {
    setLoading(true);
    try {
      const data = await getSharedTrip(shareId);
      setTrip(data);
    } catch (err) {
      console.error(err);
      showToast('Shared trip link expired or invalid', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in or create an account to copy this trip!', 'info');
      navigate('/login');
      return;
    }

    setCopying(true);
    try {
      const cloned = await copySharedTrip(shareId);
      showToast(`Copied "${cloned.name}" to your trips!`, 'success');
      navigate(`/itinerary-builder/${cloned.id}`);
    } catch (err) {
      showToast('Failed to copy trip', 'error');
    } finally {
      setCopying(false);
    }
  };

  const handleShareLinkCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Shared itinerary URL copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading Shared Travel Itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-4 max-w-md">
          <Globe className="w-12 h-12 text-primary-400 mx-auto" />
          <h2 className="text-2xl font-bold">Shared Trip Not Found</h2>
          <p className="text-xs text-slate-400">The share link might be private or deleted by its author.</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-primary-600 rounded-xl text-xs font-bold">
            Explore GlobeTrotter
          </Link>
        </div>
      </div>
    );
  }

  const citiesRoute = trip.stops?.map((s) => s.cityName).join(' → ') || 'Multi-City Route';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Top Public Brand Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center shadow-lg shadow-primary-950/40">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight">GlobeTrotter</span>
            <span className="block text-[9px] uppercase tracking-widest text-primary-400 font-semibold">Shared Travel Itinerary</span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          {!isAuthenticated ? (
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-950/50 transition-colors"
            >
              Sign Up Free
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
            >
              My Dashboard
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Public Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.name}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-primary-500/30 border border-primary-400/40 text-primary-300 text-xs font-bold backdrop-blur-md">
                Shared by {trip.createdUser || 'Traveler'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{trip.name}</h1>
            
            {/* Route Banner */}
            <div className="p-3.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-teal-300 inline-block">
              📍 {citiesRoute}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-3 border-t border-white/20">
              <span className="flex items-center font-semibold">
                <Calendar className="w-4 h-4 mr-1.5 text-primary-400" />
                {trip.startDate} – {trip.endDate} ({trip.totalDays} Days)
              </span>
              <span className="flex items-center font-bold text-amber-400 text-sm">
                {formatPrice(trip.estimatedBudget || 0)} Est. Budget
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={handleCopyTrip}
              disabled={copying}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white rounded-xl text-xs font-extrabold shadow-xl shadow-primary-950/50 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Trip to My Account</span>
            </button>

            <button
              onClick={handleShareLinkCopy}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Read-Only Itinerary Days */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Full Itinerary Breakdown</h2>

          {trip.stops?.map((stop, sIdx) => (
            <div key={stop.id || sIdx} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xs">
                    {sIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">📍 {stop.cityName}</h3>
                    <p className="text-xs text-slate-400">{stop.startDate} – {stop.endDate}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {stop.activities?.length || 0} Activities
                </span>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-primary-500/30">
                {stop.activities?.map((act) => (
                  <div key={act.id} className="relative pl-6 space-y-1">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary-500 ring-4 ring-slate-900" />
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-primary-400 bg-primary-950/80 border border-primary-900 px-2 py-0.5 rounded-md flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {act.time}
                      </span>
                      <span className="font-semibold text-slate-400">{act.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-100">{act.name}</h4>
                    <span className="text-xs font-bold text-slate-300 flex items-center">
                      {formatPrice(act.cost || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Created & Shared via GlobeTrotter — Multi-City Travel Planner
      </footer>
    </div>
  );
};

export default SharedTrip;

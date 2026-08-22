import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit3, 
  IndianRupee, 
  Share2, 
  Eye, 
  Layers, 
  Sparkles,
  Users,
  MoreVertical,
  Clock 
} from 'lucide-react';
import { createShareLink } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const TripCard = ({ trip, onDelete, onDeleteClick, isCompact = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { formatPrice } = useLanguage();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
      case 'Ongoing':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Upcoming':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Planning':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-primary-100 text-primary-700 border-primary-200';
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const { shareUrl } = await createShareLink(trip.id);
      navigator.clipboard.writeText(shareUrl);
      showToast('Public share link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to generate share link', 'error');
    }
  };

  const cityNames = trip.stops?.map((s) => s.cityName).join(', ') || 'Destinations';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Cover Photo Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3.5 left-3.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs backdrop-blur-md ${getStatusBadge(
                trip.status
              )}`}
            >
              {trip.status === 'In Progress' ? '🔵 In Progress' : trip.status === 'Completed' ? '🔘 Completed' : trip.status === 'Upcoming' ? '🟢 Upcoming' : '🟡 Planning'}
            </span>
          </div>

          {/* Total Days Pill */}
          <div className="absolute top-3.5 right-3.5 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-primary-400" />
            <span>{trip.totalDays || 1} Days</span>
          </div>

          {/* Title & Route inside image overlay */}
          <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
            <h3 className="font-extrabold text-lg tracking-tight line-clamp-1 group-hover:text-primary-300 transition-colors">
              {trip.name}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1 flex items-center mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-teal-400 mr-1 shrink-0" />
              {cityNames}
            </p>
          </div>
        </div>

        {/* Card Body Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2.5">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 text-primary-600 mr-1.5" />
              {trip.startDate} – {trip.endDate}
            </span>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              {trip.stops?.length || 0} Cities
            </span>
          </div>

          {/* Cities Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {trip.stops?.slice(0, 3).map((stop, sIdx) => (
              <span
                key={stop.id || sIdx}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
              >
                📍 {stop.cityName}
              </span>
            ))}
            {(trip.stops?.length || 0) > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">
                +{trip.stops.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Estimated Budget</span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center">
              {formatPrice(trip.estimatedBudget || 0)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => navigate(`/itinerary/${trip.id}`)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="View Clean Read-Only Itinerary"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              title="Share Public Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {(onDelete || onDeleteClick) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const fn = onDelete || onDeleteClick;
                  fn(trip.id);
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => navigate(`/itinerary-builder/${trip.id}`)}
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors ml-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Builder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;

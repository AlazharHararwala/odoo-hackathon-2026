import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, deleteTrip, createShareLink } from '../services/api';
import TripCard from '../components/TripCard';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Plus, 
  Filter, 
  LayoutGrid, 
  List, 
  Compass, 
  ArrowUpDown,
  Calendar,
  MapPin,
  IndianRupee,
  Edit3,
  Eye,
  Trash2
} from 'lucide-react';

const MyTrips = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name' | 'budget'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, [searchQuery, statusFilter]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips({
        search: searchQuery,
        status: statusFilter,
      });
      setTrips(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTrip(deletingId);
      setTrips(trips.filter((t) => t.id !== deletingId));
      showToast('Trip deleted successfully', 'info');
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    } finally {
      setDeletingId(null);
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

  // Sorting Logic
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'date') return new Date(a.startDate) - new Date(b.startDate);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'budget') return (b.estimatedBudget || 0) - (a.estimatedBudget || 0);
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Travel Itineraries</h1>
          <p className="text-xs text-slate-500 mt-0.5">Organize, customize, and manage all your multi-city journeys</p>
        </div>
        <button
          onClick={() => navigate('/create-trip')}
          className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-2 w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips by title or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Filters + Sorting + View Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {['All', 'Upcoming', 'Planning', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer font-semibold"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="budget">Sort by Budget</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-primary-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-primary-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trips Content Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-200/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : sortedTrips.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">No matching trips found</h3>
            <p className="text-xs text-slate-500">Try clearing your search query or changing status filters.</p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onShare={handleShareTrip}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <img
                  src={trip.coverImage}
                  alt={trip.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-slate-900">{trip.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center space-x-3">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {trip.startDate} – {trip.endDate} ({trip.totalDays} Days)
                    </span>
                  </p>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      {trip.stops?.map(s => s.cityName).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Est. Budget</span>
                  <span className="text-sm font-extrabold text-primary-700 flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {(trip.estimatedBudget || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/itinerary-builder/${trip.id}`)}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Builder</span>
                  </button>

                  <button
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingId(trip.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Travel Itinerary"
        message="Are you sure you want to permanently delete this trip? All city stops, activities, and budget data will be removed."
        confirmText="Yes, Delete Trip"
        isDanger={true}
      />
    </div>
  );
};

export default MyTrips;

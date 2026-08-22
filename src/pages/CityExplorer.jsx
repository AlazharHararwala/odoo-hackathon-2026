import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCities, getTrips, addTripStop } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  MapPin, 
  Plus, 
  Filter, 
  Sparkles, 
  X, 
  Globe, 
  CheckCircle2,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const CityExplorer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCostIndex, setSelectedCostIndex] = useState('All');

  // Modal State for "Add to Trip"
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [addingStop, setAddingStop] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedRegion, selectedCostIndex]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [citiesData, tripsData] = await Promise.all([
        getCities({
          search: searchQuery,
          region: selectedRegion,
          costIndex: selectedCostIndex,
        }),
        getTrips()
      ]);
      setCities(citiesData);
      setTrips(tripsData);
      if (tripsData.length > 0) {
        setSelectedTripId(tripsData[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading city catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedCityForTrip || !selectedTripId) return;

    setAddingStop(true);
    try {
      await addTripStop(selectedTripId, {
        cityId: selectedCityForTrip.id,
        cityName: selectedCityForTrip.name,
      });
      showToast(`Added ${selectedCityForTrip.name} to your trip itinerary!`, 'success');
      setSelectedCityForTrip(null);
      navigate(`/itinerary-builder/${selectedTripId}`);
    } catch (err) {
      showToast('Failed to add city to trip', 'error');
    } finally {
      setAddingStop(false);
    }
  };

  const regions = ['All', 'Asia', 'Europe', 'Middle East', 'North America', 'Africa', 'Oceania'];
  const costLevels = ['All', 'Budget', 'Moderate', 'Luxury'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Destinations</h1>
        <p className="text-xs text-slate-500 mt-0.5">Discover top travel destinations, attractions, and average costs worldwide</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations by name or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none md:col-span-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Region:</span>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === region
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Cost Index:</span>
          {costLevels.map((cost) => (
            <button
              key={cost}
              onClick={() => setSelectedCostIndex(cost)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCostIndex === cost
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cost}
            </button>
          ))}
        </div>
      </div>

      {/* City Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-200/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
          <Globe className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No destinations found</h3>
          <p className="text-xs text-slate-500">Try clearing search filters to see all available cities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-black/60 backdrop-blur-md text-white">
                  {city.region}
                </span>

                <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500/90 text-white backdrop-blur-md">
                  ★ {city.popularity}% Popularity
                </span>

                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-extrabold text-xl leading-tight">{city.name}</h3>
                  <p className="text-xs text-slate-300 flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-primary-400" />
                    {city.country}
                  </p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      city.costIndex === 'Budget' ? 'bg-emerald-100 text-emerald-800' :
                      city.costIndex === 'Moderate' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      Cost Index: {city.costIndex}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {city.description}
                  </p>

                  {city.attractions && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Top Attractions:</span>
                      <div className="flex flex-wrap gap-1">
                        {city.attractions.map((att, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                            {att}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedCityForTrip(city)}
                    className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add City to Trip Selector Modal */}
      {selectedCityForTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Add Destination to Trip</h3>
              <button onClick={() => setSelectedCityForTrip(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img src={selectedCityForTrip.image} alt={selectedCityForTrip.name} className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedCityForTrip.name}</h4>
                <p className="text-xs text-slate-500">{selectedCityForTrip.country}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Target Trip</label>
              {trips.length === 0 ? (
                <p className="text-xs text-rose-600">No active trips found. Create a trip first.</p>
              ) : (
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.startDate})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCityForTrip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addingStop || trips.length === 0}
                onClick={handleConfirmAddToTrip}
                className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityExplorer;

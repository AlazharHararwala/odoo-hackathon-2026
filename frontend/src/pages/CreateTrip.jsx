import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, getCities, getActivities } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles,
  Clock
} from 'lucide-react';

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Step 1 State: Details
  const [tripName, setTripName] = useState('Europe Adventure');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [description, setDescription] = useState('10-day European vacation discovering famous cities and culture.');
  const [coverImage, setCoverImage] = useState(COVER_IMAGES[1]);
  const [targetBudget, setTargetBudget] = useState('75000');

  // Step 2 State: Selected City Stops
  const [selectedStops, setSelectedStops] = useState([]);

  // Step 3 State: Activities per stop
  const [stopActivities, setStopActivities] = useState({});

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await getCities();
      setAllCities(data);
      // Pre-select 2 demo cities for smooth UX
      if (data.length >= 2) {
        setSelectedStops([
          { cityId: data[1].id, cityName: data[1].name, country: data[1].country, accommodationCost: 8000, transportCost: 3000 },
          { cityId: data[2].id, cityName: data[2].name, country: data[2].country, accommodationCost: 12000, transportCost: 5000 },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const diff = new Date(endDate) - new Date(startDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const handleAddStop = (city) => {
    if (selectedStops.some(s => s.cityId === city.id)) {
      showToast(`${city.name} is already added to your itinerary`, 'info');
      return;
    }
    setSelectedStops([
      ...selectedStops,
      {
        cityId: city.id,
        cityName: city.name,
        country: city.country,
        accommodationCost: 7000,
        transportCost: 3000,
      }
    ]);
  };

  const handleRemoveStop = (cityId) => {
    setSelectedStops(selectedStops.filter(s => s.cityId !== cityId));
  };

  const handleFinalSubmit = async () => {
    if (!tripName) {
      showToast('Please enter a trip name', 'error');
      return;
    }
    if (selectedStops.length === 0) {
      showToast('Please add at least one city destination stop', 'error');
      return;
    }

    setLoading(true);
    try {
      const totalDays = calculateDays();
      const formattedStops = selectedStops.map((stop, idx) => ({
        id: `stop_${Date.now()}_${idx}`,
        cityId: stop.cityId,
        cityName: stop.cityName,
        country: stop.country,
        startDate,
        endDate,
        order: idx + 1,
        accommodationCost: stop.accommodationCost,
        transportCost: stop.transportCost,
        activities: (stopActivities[stop.cityId] || []).map((act, aIdx) => ({
          id: `tac_${Date.now()}_${aIdx}`,
          activityId: act.id,
          name: act.name,
          time: '10:00',
          cost: act.cost,
          category: act.category,
          dayIndex: idx + 1,
        }))
      }));

      const newTrip = await createTrip({
        name: tripName,
        startDate,
        endDate,
        totalDays,
        description,
        coverImage,
        targetBudget: Number(targetBudget),
        stops: formattedStops,
      });

      showToast('Trip created successfully! Launching itinerary builder...', 'success');
      navigate(`/itinerary-builder/${newTrip.id}`);
    } catch (err) {
      showToast('Failed to create trip', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Wizard Header Progress */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Plan a New Trip</h1>
            <p className="text-xs text-slate-500 mt-0.5">Build your multi-city travel itinerary step by step</p>
          </div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full w-max">
            Step {step} of 4
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 gap-2 relative">
          {[
            { num: 1, title: '1 Details' },
            { num: 2, title: '2 Destinations' },
            { num: 3, title: '3 Activities' },
            { num: 4, title: '4 Review' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                step === s.num
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.num ? 'bg-white text-primary-600 font-bold' : step > s.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step > s.num ? <Check className="w-3 h-3" /> : s.num}
              </span>
              <span className="hidden sm:inline truncate">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: TRIP DETAILS */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">Step 1: Trip Overview & Dates</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trip Name</label>
              <input
                type="text"
                placeholder="e.g. Europe Adventure, Summer in Goa"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Budget (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Calculated Duration</label>
                <div className="px-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold text-primary-700 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{calculateDays()} Days Trip</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description & Notes</label>
              <textarea
                rows={3}
                placeholder="What is the goal or theme of this trip?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Cover Photo</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {COVER_IMAGES.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverImage(imgUrl)}
                    className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border-2 transition-all ${
                      coverImage === imgUrl ? 'border-primary-600 ring-2 ring-primary-500/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Cover" className="w-full h-full object-cover" />
                    {coverImage === imgUrl && (
                      <div className="absolute inset-0 bg-primary-600/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-2"
            >
              <span>Next: Select Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DESTINATIONS / CITIES */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Add City Destinations</h2>
              <p className="text-xs text-slate-500">Pick the cities you will visit on your route</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              {selectedStops.length} Cities Added
            </span>
          </div>

          {/* Selected Cities Pill Bar */}
          {selectedStops.length > 0 && (
            <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-200 space-y-2">
              <span className="text-xs font-bold text-primary-800 uppercase tracking-wider block">Your Selected Route:</span>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedStops.map((stop, i) => (
                  <React.Fragment key={stop.cityId}>
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-slate-800 rounded-xl border border-primary-300 text-xs font-bold shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      <span>{stop.cityName}</span>
                      <button
                        onClick={() => handleRemoveStop(stop.cityId)}
                        className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {i < selectedStops.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-primary-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Cities Picker Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
            {allCities.map((city) => {
              const isSelected = selectedStops.some(s => s.cityId === city.id);
              return (
                <div
                  key={city.id}
                  onClick={() => isSelected ? handleRemoveStop(city.id) : handleAddStop(city)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <img src={city.image} alt={city.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900">{city.name}</h4>
                    <p className="text-xs text-slate-500">{city.country}</p>
                    <span className="text-[10px] font-semibold text-amber-600 mt-1 block">
                      Cost: {city.costIndex}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={selectedStops.length === 0}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>Next: Recommend Activities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ACTIVITIES PREVIEW */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Initial Activity Ideas</h2>
              <p className="text-xs text-slate-500">Pick starting attractions for your cities (You can add more in the Builder later)</p>
            </div>
            <Sparkles className="w-5 h-5 text-primary-500" />
          </div>

          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
            {selectedStops.map((stop) => (
              <div key={stop.cityId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span>{stop.cityName}, {stop.country}</span>
                  </h3>
                </div>

                <p className="text-xs text-slate-500">
                  Default sightseeing & culinary experiences will be prepared for {stop.cityName}. You can customize times and costs in the interactive builder.
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-2"
            >
              <span>Next: Final Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CREATE */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Step 4: Review Trip Summary</h2>
            <p className="text-xs text-slate-500">Verify details before opening the Itinerary Builder</p>
          </div>

          {/* Cover & Title Preview Card */}
          <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-900 text-white p-6 flex flex-col justify-end">
            <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="relative z-10 space-y-1">
              <span className="px-2.5 py-0.5 rounded-md bg-primary-600 text-[10px] font-bold uppercase tracking-wider">
                {calculateDays()} Days Trip
              </span>
              <h3 className="text-2xl font-black">{tripName}</h3>
              <p className="text-xs text-slate-200">{startDate} to {endDate}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Destinations Route:</span>
              <p className="font-bold text-slate-900 text-sm">
                {selectedStops.map(s => s.cityName).join(' → ')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Target Budget:</span>
              <p className="font-bold text-primary-700 text-sm flex items-center">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(targetBudget).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            💡 <strong>Next Step:</strong> Clicking "Create & Open Builder" will construct your trip structure and take you directly to the interactive <strong>Itinerary Builder</strong> where you can reorder cities, schedule activity times, and manage your budget.
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleFinalSubmit}
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 text-white rounded-xl text-sm font-extrabold shadow-xl shadow-primary-600/30 flex items-center space-x-2"
            >
              <span>Create & Open Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;

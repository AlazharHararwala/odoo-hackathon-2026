import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, createTrip, getActivities } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  GLOBAL_CONTINENTS, 
  COUNTRY_CONTINENT_MAP, 
  COUNTRY_CITIES_CATALOG, 
  getCitiesForCountryCatalog 
} from '../data/globalCitiesDatabase';
import { 
  Calendar, 
  MapPin, 
  IndianRupee, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Check, 
  Sparkles, 
  Clock,
  Compass,
  Star,
  Globe,
  Filter,
  Search,
  RotateCcw,
  Building2
} from 'lucide-react';

const SPOT_PHOTOS = [
  'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80',
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { formatPrice, currencySymbol, t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Trip Details
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [targetBudget, setTargetBudget] = useState(75000);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
  );

  // Step 2: City Destinations & Global Filters
  const [allCities, setAllCities] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [citySearchQuery, setCitySearchQuery] = useState('');

  // Step 2 Add Custom City Modal State
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [customCityName, setCustomCityName] = useState('');
  const [customCountryName, setCustomCountryName] = useState('');
  const [customContinent, setCustomContinent] = useState('Europe');
  const [customCostIndex, setCustomCostIndex] = useState('Moderate');
  const [customAttractionsText, setCustomAttractionsText] = useState('');

  // Step 3: Specific City Activities Map & Add Custom Activity Modal State
  const [cityActivitiesMap, setCityActivitiesMap] = useState({});
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [targetCityForActivity, setTargetCityForActivity] = useState(null);
  const [customActivityName, setCustomActivityName] = useState('');
  const [customActivityCategory, setCustomActivityCategory] = useState('Sightseeing');
  const [customActivityCost, setCustomActivityCost] = useState(0);
  const [customActivityTime, setCustomActivityTime] = useState('10:00');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await getCities();
      setAllCities(data);
      const initialStops = data.filter((c) => ['c_mumbai', 'c_dubai', 'c_paris'].includes(c.id));
      setSelectedStops(
        initialStops.map((c, idx) => ({
          cityId: c.id,
          cityName: c.name,
          country: c.country,
          image: c.image,
          order: idx + 1,
          accommodationCost: c.costIndex === 'Luxury' ? 15000 : c.costIndex === 'Moderate' ? 8000 : 4000,
          transportCost: 3000,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 15+ Countries per Continent Filter Options
  const availableContinents = GLOBAL_CONTINENTS;

  const availableCountries = Object.keys(COUNTRY_CONTINENT_MAP).filter((ctry) => {
    if (selectedContinent === 'All') return true;
    return COUNTRY_CONTINENT_MAP[ctry] === selectedContinent;
  });

  const handleContinentChange = (continent) => {
    setSelectedContinent(continent);
    if (continent !== 'All' && selectedCountry !== 'All') {
      if (COUNTRY_CONTINENT_MAP[selectedCountry] !== continent) {
        setSelectedCountry('All');
      }
    }
  };

  // Selecting a Country AUTOMATICALLY selects its Continent!
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    if (country !== 'All') {
      const mappedContinent = COUNTRY_CONTINENT_MAP[country];
      if (mappedContinent) {
        setSelectedContinent(mappedContinent);
      }
    }
  };

  // Generate & Filter 20 Cities per Country selected
  const getFilteredCities = () => {
    let cities = [...allCities];

    if (selectedCountry !== 'All') {
      const catalog = COUNTRY_CITIES_CATALOG[selectedCountry] || getCitiesForCountryCatalog(selectedCountry, selectedContinent);

      catalog.forEach((catCity, cIdx) => {
        const existing = cities.find(
          (c) => c.name.toLowerCase() === catCity.name.toLowerCase() && c.country === selectedCountry
        );
        if (!existing) {
          cities.push({
            id: `c_${selectedCountry.toLowerCase().replace(/\s+/g, '_')}_${cIdx}`,
            name: catCity.name,
            country: selectedCountry,
            region: COUNTRY_CONTINENT_MAP[selectedCountry] || selectedContinent,
            image: SPOT_PHOTOS[cIdx % SPOT_PHOTOS.length],
            costIndex: catCity.cost || 'Moderate',
            popularity: 95 - (cIdx % 12),
            description: `Famous tourist destination in ${catCity.name}, ${selectedCountry}.`,
            attractions: catCity.attractions || [
              `${catCity.name} Landmark Tour`,
              `${catCity.name} Culture Experience`,
              `${catCity.name} Culinary Tasting`
            ],
          });
        }
      });
    }

    return cities.filter((city) => {
      const cityContinent = city.region || city.continent;
      const matchesContinent = selectedContinent === 'All' || cityContinent === selectedContinent;
      const matchesCountry = selectedCountry === 'All' || city.country === selectedCountry;
      const matchesSearch =
        !citySearchQuery ||
        city.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
        (city.attractions || []).some((a) => a.toLowerCase().includes(citySearchQuery.toLowerCase()));

      return matchesContinent && matchesCountry && matchesSearch;
    });
  };

  const filteredCities = getFilteredCities();

  // Handle Opening Custom City Modal
  const handleOpenAddCityModal = () => {
    setCustomCityName('');
    setCustomCountryName(selectedCountry !== 'All' ? selectedCountry : '');
    setCustomContinent(selectedContinent !== 'All' ? selectedContinent : 'Europe');
    setCustomCostIndex('Moderate');
    setCustomAttractionsText('');
    setShowAddCityModal(true);
  };

  // Handle Saving Custom City
  const handleSaveCustomCity = (e) => {
    e.preventDefault();
    if (!customCityName.trim()) {
      showToast('Please enter a city name', 'error');
      return;
    }

    const newCityId = `custom_c_${Date.now()}`;
    const country = customCountryName.trim() || (selectedCountry !== 'All' ? selectedCountry : 'Custom Location');
    const continent = customContinent || (selectedContinent !== 'All' ? selectedContinent : 'Europe');
    const attractions = customAttractionsText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const newCityObj = {
      id: newCityId,
      name: customCityName.trim(),
      country,
      region: continent,
      image: SPOT_PHOTOS[allCities.length % SPOT_PHOTOS.length],
      costIndex: customCostIndex,
      popularity: 99,
      description: `User added destination in ${country}.`,
      attractions: attractions.length > 0 ? attractions : [`${customCityName.trim()} Sightseeing Walk`, `${customCityName.trim()} Cultural Tour`],
      isCustom: true,
    };

    setAllCities((prev) => [newCityObj, ...prev]);

    const newStop = {
      cityId: newCityId,
      cityName: newCityObj.name,
      country: newCityObj.country,
      image: newCityObj.image,
      order: selectedStops.length + 1,
      accommodationCost: customCostIndex === 'Luxury' ? 15000 : customCostIndex === 'Moderate' ? 8000 : 4000,
      transportCost: 3000,
    };
    setSelectedStops((prev) => [...prev, newStop]);

    setShowAddCityModal(false);
    showToast(`Added "${newCityObj.name}" to your selected travel stops!`, 'success');
  };

  // Handle Opening Add Activity Modal for a City
  const handleOpenAddActivityModal = (stop) => {
    setTargetCityForActivity(stop);
    setCustomActivityName('');
    setCustomActivityCategory('Sightseeing');
    setCustomActivityCost(0);
    setCustomActivityTime('10:00');
    setShowAddActivityModal(true);
  };

  // Handle Saving Custom Activity to a City
  const handleSaveCustomActivity = (e) => {
    e.preventDefault();
    if (!customActivityName.trim()) {
      showToast('Please enter an activity name', 'error');
      return;
    }
    if (!targetCityForActivity) return;

    const cityId = targetCityForActivity.cityId;
    const newActObj = {
      id: `custom_act_${Date.now()}`,
      cityId,
      name: customActivityName.trim(),
      category: customActivityCategory,
      cost: Number(customActivityCost) || 0,
      time: customActivityTime || '10:00',
      selected: true,
      image: SPOT_PHOTOS[(cityActivitiesMap[cityId]?.length || 0) % SPOT_PHOTOS.length],
      isCustom: true,
    };

    setCityActivitiesMap((prev) => {
      const existing = prev[cityId] || [];
      return {
        ...prev,
        [cityId]: [...existing, newActObj],
      };
    });

    setShowAddActivityModal(false);
    showToast(`Added "${newActObj.name}" to ${targetCityForActivity.cityName}!`, 'success');
  };

  useEffect(() => {
    if (selectedStops.length > 0) {
      loadSpecificActivitiesForCities();
    }
  }, [selectedStops]);

  const loadSpecificActivitiesForCities = async () => {
    const map = { ...cityActivitiesMap };
    for (let sIdx = 0; sIdx < selectedStops.length; sIdx++) {
      const stop = selectedStops[sIdx];
      if (!map[stop.cityId]) {
        try {
          const acts = await getActivities({ cityId: stop.cityId });
          if (acts && acts.length > 0) {
            map[stop.cityId] = acts.slice(0, 3).map((a, idx) => ({ 
              ...a, 
              selected: true,
              image: a.image || SPOT_PHOTOS[(sIdx * 4 + idx) % SPOT_PHOTOS.length]
            }));
          } else {
            const cityObj = filteredCities.find((c) => c.id === stop.cityId || c.name === stop.cityName);
            const attractions = (cityObj?.attractions || ['City Sightseeing Walk', 'Local Cultural Tour', 'Traditional Culinary Tasting']).slice(0, 3);
            map[stop.cityId] = attractions.map((attr, idx) => ({
              id: `act_${stop.cityId}_${idx}`,
              cityId: stop.cityId,
              name: attr,
              category: idx === 0 ? 'Sightseeing' : idx === 1 ? 'Culture' : 'Food',
              cost: (idx + 1) * 600,
              time: idx === 0 ? '09:30' : idx === 1 ? '14:00' : '18:00',
              selected: true,
              image: SPOT_PHOTOS[(sIdx * 4 + idx) % SPOT_PHOTOS.length],
            }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    setCityActivitiesMap(map);
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const handleAddStop = (city) => {
    if (selectedStops.some((s) => s.cityId === city.id)) return;
    const newStop = {
      cityId: city.id,
      cityName: city.name,
      country: city.country,
      image: city.image,
      order: selectedStops.length + 1,
      accommodationCost: city.costIndex === 'Luxury' ? 15000 : city.costIndex === 'Moderate' ? 8000 : 4000,
      transportCost: 3000,
    };
    setSelectedStops([...selectedStops, newStop]);
  };

  const handleRemoveStop = (cityId) => {
    setSelectedStops(selectedStops.filter((s) => s.cityId !== cityId));
  };

  const toggleActivitySelection = (cityId, actId) => {
    setCityActivitiesMap((prev) => {
      const currentList = prev[cityId] || [];
      const updated = currentList.map((a) => (a.id === actId ? { ...a, selected: !a.selected } : a));
      return { ...prev, [cityId]: updated };
    });
  };

  const handleCreateTripSubmit = async () => {
    setLoading(true);

    const stopsData = selectedStops.map((stop) => {
      const cityActs = (cityActivitiesMap[stop.cityId] || [])
        .filter((a) => a.selected)
        .map((a, aIdx) => ({
          id: a.id || `tac_${Date.now()}_${aIdx}`,
          activityId: a.id,
          name: a.name,
          cost: a.cost || 0,
          category: a.category || 'Sightseeing',
          time: a.time || (aIdx === 0 ? '09:30' : aIdx === 1 ? '13:30' : '17:00'),
          image: a.image,
        }));

      return {
        ...stop,
        startDate,
        endDate,
        activities: cityActs,
      };
    });

    try {
      const newTrip = await createTrip({
        name: tripName || `Multi-City Journey to ${selectedStops.map((s) => s.cityName).join(', ')}`,
        description,
        startDate,
        endDate,
        totalDays: calculateDays(),
        targetBudget: Number(targetBudget),
        coverImage,
        stops: stopsData,
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
            <p className="text-xs text-slate-500 mt-0.5">Build your personalized multi-city travel itinerary step by step</p>
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
                placeholder="e.g. Europe Adventure, Summer in Asia"
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
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    if (endDate && newStart && endDate < newStart) {
                      setEndDate(newStart);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    if (startDate && newEnd && newEnd < startDate) {
                      setEndDate(startDate);
                    } else {
                      setEndDate(newEnd);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Budget ({currencySymbol})</label>
                <div className="relative">
                  <span className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs flex items-center justify-center">
                    {currencySymbol}
                  </span>
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
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-2"
            >
              <span>Next: Select Cities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DESTINATION CITIES WITH CONTINENT, COUNTRY & ADD CUSTOM CITY OPTIONS */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Select Travel Stop Cities</h2>
              <p className="text-xs text-slate-500">
                Filter by continent & country or add your own custom city ({selectedStops.length} selected)
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 w-max">
              Route: {selectedStops.map((s) => s.cityName).join(' → ') || 'No cities selected'}
            </span>
          </div>

          {/* Interactive Filter & Action Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-primary-600" />
                <span>Global Continent & Country Filter</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleOpenAddCityModal}
                  className="text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-xl shadow-xs flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom City</span>
                </button>

                {(selectedContinent !== 'All' || selectedCountry !== 'All' || citySearchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContinent('All');
                      setSelectedCountry('All');
                      setCitySearchQuery('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Continent Filter (15+ Countries) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Continent</label>
                <select
                  value={selectedContinent}
                  onChange={(e) => handleContinentChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="All">🌍 All Continents</option>
                  {availableContinents.map((cont) => (
                    <option key={cont} value={cont}>
                      {cont}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Country Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="All">🏳️ All Countries {selectedContinent !== 'All' ? `(${selectedContinent})` : ''}</option>
                  {availableCountries.map((ctry) => (
                    <option key={ctry} value={ctry}>
                      {ctry}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Search Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Search City</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Paris, Tokyo, Gotland..."
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  {citySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCitySearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Cities Badges Bar */}
          {selectedStops.length > 0 && (
            <div className="p-4 bg-primary-50/60 rounded-2xl border border-primary-200/80 space-y-2">
              <span className="text-xs font-bold text-primary-900 block">Selected Route Sequence ({selectedStops.length} stops):</span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedStops.map((stop, i) => (
                  <React.Fragment key={stop.cityId}>
                    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-primary-300 text-xs font-extrabold text-slate-900 shadow-2xs">
                      <span>📍 {stop.cityName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.cityId)}
                        className="text-slate-400 hover:text-rose-600 ml-1 font-black"
                      >
                        ×
                      </button>
                    </div>
                    {i < selectedStops.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-primary-500" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Cities Picker Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[440px] overflow-y-auto pr-1">
            {/* Always visible Add Custom City Card at start of grid */}
            <div
              onClick={handleOpenAddCityModal}
              className="p-3.5 rounded-2xl border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/40 hover:bg-primary-50 transition-all cursor-pointer flex items-center space-x-3 group min-h-[76px]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 group-hover:bg-primary-600 group-hover:text-white text-primary-700 flex items-center justify-center shrink-0 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-xs text-primary-900 group-hover:text-primary-700">Can't find your city?</h4>
                <p className="text-[11px] font-bold text-primary-600 mt-0.5">+ Add Custom City</p>
              </div>
            </div>

            {filteredCities.length === 0 ? (
              <div className="col-span-full py-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-sm font-bold text-slate-700">No pre-listed cities match your filter criteria.</p>
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={handleOpenAddCityModal}
                    className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom City Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContinent('All');
                      setSelectedCountry('All');
                      setCitySearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              filteredCities.map((city) => {
                const isSelected = selectedStops.some((s) => s.cityId === city.id || s.cityName === city.name);
                return (
                  <div
                    key={city.id}
                    onClick={() => (isSelected ? handleRemoveStop(city.id) : handleAddStop(city))}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between space-x-3 ${
                      isSelected
                        ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={city.image} alt={city.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <h4 className="font-black text-sm text-slate-900 truncate">{city.name}</h4>
                          {city.isCustom && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">Custom</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 truncate">{city.country} • <span className="text-primary-700 font-bold">{city.region || city.continent}</span></p>
                        <span className="text-[10px] font-bold text-amber-600 mt-0.5 block">
                          Cost: {city.costIndex}
                        </span>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })
            )}
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

      {/* STEP 3: SPECIFIC CITY ACTIVITIES PREVIEW & SELECTION WITH ADD ACTIVITY BUTTON PER CITY */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Top Attractions per City</h2>
              <p className="text-xs text-slate-500">
                Select from popular attractions or add your own custom activity for each city stop
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-primary-500" />
          </div>

          <div className="space-y-8 max-h-[500px] overflow-y-auto pr-1">
            {selectedStops.map((stop) => {
              const activities = cityActivitiesMap[stop.cityId] || [];

              return (
                <div key={stop.cityId} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  {/* City Header with Add Activity Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          {stop.cityName}, {stop.country}
                        </h3>
                        <span className="text-[11px] text-slate-500">Famous Tourist Spots & Custom Experiences</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAddActivityModal(stop)}
                        className="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Activity</span>
                      </button>

                      <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                        {activities.filter((a) => a.selected).length} Selected
                      </span>
                    </div>
                  </div>

                  {/* Specific City Activities Cards & Add Activity Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Add Activity Card in Grid */}
                    <div
                      onClick={() => handleOpenAddActivityModal(stop)}
                      className="p-3.5 rounded-2xl border-2 border-dashed border-primary-300 hover:border-primary-500 bg-white hover:bg-primary-50/50 transition-all cursor-pointer flex items-center justify-between space-x-3 group min-h-[72px]"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 group-hover:bg-primary-600 group-hover:text-white text-primary-700 flex items-center justify-center shrink-0 transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-primary-900 group-hover:text-primary-700">Add Custom Activity</h4>
                          <p className="text-[10px] font-bold text-primary-600 mt-0.5">+ Add event to {stop.cityName}</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {activities.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => toggleActivitySelection(stop.cityId, act.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between space-x-3 ${
                          act.selected
                            ? 'bg-white border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                            : 'bg-white/60 border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {act.image && (
                            <img src={act.image} alt={act.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{act.name}</h4>
                              {act.isCustom && (
                                <span className="text-[8px] font-extrabold bg-teal-100 text-teal-800 px-1 py-0.5 rounded-xs shrink-0">Custom</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                                {act.category || 'Sightseeing'}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                                {formatPrice(act.cost || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            act.selected ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {act.selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <span className="text-xs font-bold text-teal-400 block uppercase tracking-wider">
                {calculateDays()} Days Multi-City Trip
              </span>
              <h3 className="text-xl font-black">{tripName || `Trip to ${selectedStops.map((s) => s.cityName).join(', ')}`}</h3>
              <p className="text-xs text-slate-300">{description || 'Personalized travel itinerary.'}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-semibold">
                <span>Dates: {startDate} to {endDate}</span>
                <span className="text-amber-400 flex items-center font-bold">
                  {formatPrice(Number(targetBudget) || 50000)} Target Budget
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">City Route & Selected Attractions</h4>
              {selectedStops.map((stop, idx) => {
                const selectedActs = (cityActivitiesMap[stop.cityId] || []).filter((a) => a.selected);
                return (
                  <div key={stop.cityId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">📍 {stop.cityName}, {stop.country}</h5>
                        <p className="text-xs text-slate-500">
                          {selectedActs.length > 0 ? selectedActs.map((a) => a.name).join(' • ') : 'No initial activities selected'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-center">
                      {selectedActs.length} Activities
                    </span>
                  </div>
                );
              })}
            </div>
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
              onClick={handleCreateTripSubmit}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-primary-600/30 flex items-center space-x-2 disabled:opacity-50 transform hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <span>Creating Itinerary...</span>
              ) : (
                <>
                  <span>Create Trip & Open Builder</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ADD CUSTOM CITY MODAL */}
      {showAddCityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Add Custom Destination</h3>
                  <p className="text-xs text-slate-500">Can't find your city? Add it manually below!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCustomCity} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  City Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gotland, Lonavala, Santorini..."
                  value={customCityName}
                  onChange={(e) => setCustomCityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Sweden, India, Greece..."
                    value={customCountryName}
                    onChange={(e) => setCustomCountryName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Continent</label>
                  <select
                    value={customContinent}
                    onChange={(e) => setCustomContinent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    {GLOBAL_CONTINENTS.map((cont) => (
                      <option key={cont} value={cont}>
                        {cont}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Budget Level</label>
                <select
                  value={customCostIndex}
                  onChange={(e) => setCustomCostIndex(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="Budget">Budget (₹)</option>
                  <option value="Moderate">Moderate (₹₹)</option>
                  <option value="Luxury">Luxury (₹₹₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Top Spots / Attractions <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Old Town Walk, Beach Sunset, Historic Fort"
                  value={customAttractionsText}
                  onChange={(e) => setCustomAttractionsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add & Select City</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM ACTIVITY MODAL */}
      {showAddActivityModal && targetCityForActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Add Custom Activity</h3>
                  <p className="text-xs text-slate-500">Adding activity to 📍 {targetCityForActivity.cityName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddActivityModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCustomActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Activity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boat Cruise, Scuba Diving, Dinner..."
                  value={customActivityName}
                  onChange={(e) => setCustomActivityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={customActivityCategory}
                    onChange={(e) => setCustomActivityCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Culture">Culture</option>
                    <option value="Food">Food</option>
                    <option value="Nature">Nature</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Nightlife">Nightlife</option>
                    <option value="Relaxation">Relaxation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={customActivityTime}
                    onChange={(e) => setCustomActivityTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free"
                    value={customActivityCost}
                    onChange={(e) => setCustomActivityCost(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;

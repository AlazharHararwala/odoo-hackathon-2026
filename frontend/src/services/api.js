import axios from 'axios';
import { MOCK_TRIPS, MOCK_CITIES, MOCK_ACTIVITIES, INITIAL_USER } from '../data/mockData';

// Toggle between Mock Mode and Real Flask REST API Backend
const USE_MOCK = false;
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to attach JWT Auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('globetrotter_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to calculate automatic trip status based on current date vs duration
export const calculateTripStatus = (startDateStr, endDateStr, manualStatus = 'Planning') => {
  if (!startDateStr || !endDateStr) return manualStatus || 'Planning';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDateStr);
  end.setHours(23, 59, 59, 999);

  if (today > end) {
    return 'Completed';
  }
  if (today >= start && today <= end) {
    return 'In Progress';
  }

  // Calculate difference in days between start date and today
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If the trip starts within 2 days prior (e.g. 1 or 2 days away), mark as Upcoming
  if (diffDays <= 2 && diffDays > 0) {
    return 'Upcoming';
  }

  // If start date is more than 2 days in the future, it is in Planning stage
  return 'Planning';
};

// Local Storage Helper for Mock Data persistence
const getStoredTrips = () => {
  const data = localStorage.getItem('globetrotter_trips');
  let trips = MOCK_TRIPS;
  if (data) {
    try { trips = JSON.parse(data); } catch (e) { console.error(e); }
  } else {
    localStorage.setItem('globetrotter_trips', JSON.stringify(MOCK_TRIPS));
  }

  // Auto-update statuses & compute estimated budget & ensure unique IDs for stored stops
  const updatedTrips = trips.map((trip, tIdx) => {
    const fixedStops = (trip.stops || []).map((stop, sIdx) => ({
      ...stop,
      id: stop.id || `stop_${trip.id || tIdx}_${sIdx}_${stop.cityId || Math.random().toString(36).substring(2, 6)}`,
      activities: (stop.activities || []).map((act, aIdx) => ({
        ...act,
        id: act.id || `tac_${trip.id || tIdx}_${sIdx}_${aIdx}`,
      })),
    }));

    let calculatedEst = fixedStops.reduce((acc, stop) => {
      const actSum = (stop.activities || []).reduce((aSum, a) => aSum + (a.cost || 0), 0);
      return acc + actSum + (stop.accommodationCost || 0) + (stop.transportCost || 0);
    }, 0);

    const adults = Number(trip.adultsCount) || Number(trip.travelersCount) || 1;
    const children = Number(trip.childrenCount) || 0;
    return {
      ...trip,
      stops: fixedStops,
      adultsCount: adults,
      childrenCount: children,
      travelersCount: adults + children,
      estimatedBudget: calculatedEst > 0 ? calculatedEst : (trip.estimatedBudget || 45000),
      status: calculateTripStatus(trip.startDate, trip.endDate, trip.status),
    };
  });

  return updatedTrips;
};

const saveStoredTrips = (trips) => {
  localStorage.setItem('globetrotter_trips', JSON.stringify(trips));
};

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// =================== AUTHENTICATION SERVICES ===================

export const getStoredUser = () => {
  const stored = localStorage.getItem('globetrotter_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  return INITIAL_USER;
};

export const saveStoredUser = (user) => {
  localStorage.setItem('globetrotter_user', JSON.stringify(user));
};

export const login = async (credentials) => {
  if (!USE_MOCK) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }
  await delay();
  if (credentials.email && credentials.password) {
    const mockToken = 'mock_jwt_token_globetrotter_12345';
    localStorage.setItem('globetrotter_token', mockToken);
    const user = getStoredUser();
    return { token: mockToken, user };
  }
  throw new Error('Invalid email or password credentials');
};

export const signup = async (userData) => {
  if (!USE_MOCK) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }
  await delay();
  const newUser = {
    ...INITIAL_USER,
    id: `usr_${Date.now()}`,
    name: userData.fullName || userData.name || 'New Traveler',
    email: userData.email,
  };
  saveStoredUser(newUser);
  const mockToken = `mock_jwt_token_${Date.now()}`;
  localStorage.setItem('globetrotter_token', mockToken);
  return { token: mockToken, user: newUser };
};

export const getCurrentUser = async () => {
  if (!USE_MOCK) {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
  await delay(50);
  let token = localStorage.getItem('globetrotter_token');
  if (!token) {
    token = 'mock_jwt_token_globetrotter_12345';
    localStorage.setItem('globetrotter_token', token);
  }
  return getStoredUser();
};

// =================== TRIPS SERVICES ===================

export const getTrips = async (params = {}) => {
  if (!USE_MOCK) {
    const response = await apiClient.get('/trips', { params });
    return response.data.map((t) => ({
      ...t,
      status: calculateTripStatus(t.startDate, t.endDate, t.status),
    }));
  }
  await delay();
  let trips = getStoredTrips();
  if (params.search) {
    const query = params.search.toLowerCase();
    trips = trips.filter((t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
  }
  if (params.status && params.status !== 'All') {
    trips = trips.filter((t) => t.status === params.status);
  }
  return trips;
};

export const getTrip = async (tripId) => {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/trips/${tripId}`);
    const trip = response.data;
    return {
      ...trip,
      status: calculateTripStatus(trip.startDate, trip.endDate, trip.status),
    };
  }
  await delay();
  const trips = getStoredTrips();
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new Error(`Trip with ID ${tripId} not found`);
  return {
    ...trip,
    status: calculateTripStatus(trip.startDate, trip.endDate, trip.status),
  };
};

export const getTripById = getTrip;

export const createTrip = async (tripData) => {
  if (!USE_MOCK) {
    const response = await apiClient.post('/trips', tripData);
    return response.data;
  }
  await delay();
  const trips = getStoredTrips();
  const calculatedStatus = calculateTripStatus(tripData.startDate, tripData.endDate, 'Planning');
  let initialEstBudget = 0;
  (tripData.stops || []).forEach((stop) => {
    initialEstBudget += (Number(stop.accommodationCost) || 0) + (Number(stop.transportCost) || 0);
    (stop.activities || []).forEach((act) => {
      initialEstBudget += Number(act.cost) || 0;
    });
  });

  const formattedStops = (tripData.stops || []).map((stop, sIdx) => ({
    ...stop,
    id: stop.id || `stop_${Date.now()}_${sIdx}_${stop.cityId || Math.random().toString(36).substring(2, 6)}`,
    activities: (stop.activities || []).map((act, aIdx) => ({
      ...act,
      id: act.id || `tac_${Date.now()}_${sIdx}_${aIdx}`,
    })),
  }));

  const adults = Number(tripData.adultsCount) || Number(tripData.travelersCount) || 1;
  const children = Number(tripData.childrenCount) || 0;

  const newTrip = {
    id: `trip_${Date.now()}`,
    name: tripData.name || 'New Adventure',
    description: tripData.description || '',
    startDate: tripData.startDate || '2026-10-01',
    endDate: tripData.endDate || '2026-10-07',
    totalDays: tripData.totalDays || 7,
    status: calculatedStatus,
    coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    targetBudget: Number(tripData.targetBudget) || 50000,
    adultsCount: adults,
    childrenCount: children,
    travelersCount: adults + children,
    estimatedBudget: initialEstBudget,
    shareId: `sh_${Math.random().toString(36).substring(2, 9)}`,
    isPublic: true,
    createdUser: INITIAL_USER.name,
    stops: formattedStops,
  };
  trips.unshift(newTrip);
  saveStoredTrips(trips);
  return newTrip;
};

export const updateTrip = async (tripId, tripData) => {
  if (!USE_MOCK) {
    const response = await apiClient.put(`/trips/${tripId}`, tripData);
    return response.data;
  }
  await delay(50);
  const trips = getStoredTrips();
  const index = trips.findIndex((t) => String(t.id) === String(tripId));
  if (index === -1) {
    return { id: tripId, ...tripData };
  }
  
  const currentAdults = trips[index].adultsCount !== undefined ? trips[index].adultsCount : (trips[index].travelersCount || 1);
  const currentChildren = trips[index].childrenCount !== undefined ? trips[index].childrenCount : 0;

  const updatedAdults = tripData.adultsCount !== undefined ? Number(tripData.adultsCount) : currentAdults;
  const updatedChildren = tripData.childrenCount !== undefined ? Number(tripData.childrenCount) : currentChildren;

  trips[index] = { 
    ...trips[index], 
    ...tripData,
    adultsCount: updatedAdults,
    childrenCount: updatedChildren,
    travelersCount: updatedAdults + updatedChildren,
    status: calculateTripStatus(
      tripData.startDate || trips[index].startDate,
      tripData.endDate || trips[index].endDate,
      tripData.status || trips[index].status
    ),
  };
  saveStoredTrips(trips);
  return trips[index];
};

export const deleteTrip = async (tripId) => {
  if (!USE_MOCK) {
    const response = await apiClient.delete(`/trips/${tripId}`);
    return response.data;
  }
  await delay();
  let trips = getStoredTrips();
  trips = trips.filter((t) => t.id !== tripId);
  saveStoredTrips(trips);
  return { success: true, message: 'Trip deleted successfully' };
};

// =================== CITIES SERVICES ===================

export const getCities = async (params = {}) => {
  if (!USE_MOCK) {
    const response = await apiClient.get('/cities', { params });
    return response.data;
  }
  await delay();
  let cities = [...MOCK_CITIES];
  if (params.search) {
    const q = params.search.toLowerCase();
    cities = cities.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
  }
  if (params.region && params.region !== 'All') {
    cities = cities.filter(c => c.region === params.region);
  }
  if (params.costIndex && params.costIndex !== 'All') {
    cities = cities.filter(c => c.costIndex === params.costIndex);
  }
  return cities;
};

export const getCity = async (cityId) => {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/cities/${cityId}`);
    return response.data;
  }
  await delay();
  const city = MOCK_CITIES.find(c => c.id === cityId);
  if (!city) throw new Error('City not found');
  return city;
};

// =================== STOPS SERVICES ===================

export const addTripStop = async (tripId, stopData) => {
  if (!USE_MOCK) {
    const response = await apiClient.post(`/trips/${tripId}/stops`, stopData);
    return response.data;
  }
  await delay();
  const trips = getStoredTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');

  const targetCity = MOCK_CITIES.find(c => c.id === stopData.cityId) || { name: stopData.cityName || 'Destination', country: '' };

  const newStop = {
    id: `stop_${Date.now()}`,
    cityId: stopData.cityId,
    cityName: targetCity.name,
    country: targetCity.country,
    startDate: stopData.startDate || trip.startDate,
    endDate: stopData.endDate || trip.endDate,
    order: (trip.stops ? trip.stops.length : 0) + 1,
    accommodationCost: Number(stopData.accommodationCost) || 5000,
    transportCost: Number(stopData.transportCost) || 2000,
    activities: [],
  };

  trip.stops = trip.stops || [];
  trip.stops.push(newStop);
  saveStoredTrips(trips);
  return newStop;
};

export const updateTripStop = async (stopId, stopData) => {
  if (!USE_MOCK) {
    const response = await apiClient.put(`/stops/${stopId}`, stopData);
    return response.data;
  }
  await delay();
  const trips = getStoredTrips();
  for (const trip of trips) {
    const stopIndex = trip.stops?.findIndex(s => s.id === stopId);
    if (stopIndex !== undefined && stopIndex !== -1) {
      trip.stops[stopIndex] = { ...trip.stops[stopIndex], ...stopData };
      saveStoredTrips(trips);
      return trip.stops[stopIndex];
    }
  }
  throw new Error('Stop not found');
};

export const deleteTripStop = async (tripId, stopId) => {
  if (!USE_MOCK) {
    const sId = stopId || tripId;
    const response = await apiClient.delete(`/stops/${sId}`);
    return response.data;
  }
  await delay(50);
  const trips = getStoredTrips();
  const targetStopId = String(stopId || tripId);

  trips.forEach((t) => {
    if (t.stops) {
      t.stops = t.stops.filter((s) => String(s.id) !== targetStopId && String(s._id) !== targetStopId);
    }
  });

  saveStoredTrips(trips);
  return { success: true };
};

// =================== ACTIVITIES SERVICES ===================

export const getActivities = async (params = {}) => {
  if (!USE_MOCK) {
    const response = await apiClient.get('/activities', { params });
    return response.data;
  }
  await delay();
  let activities = [...MOCK_ACTIVITIES];
  if (params.cityId) {
    activities = activities.filter(a => a.cityId === params.cityId);
  }
  if (params.category && params.category !== 'All') {
    activities = activities.filter(a => a.category === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    activities = activities.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }
  if (params.maxCost) {
    activities = activities.filter(a => a.cost <= Number(params.maxCost));
  }
  return activities;
};

export const addTripActivity = async (tripId, stopId, activityData) => {
  if (!USE_MOCK) {
    const response = await apiClient.post(`/trips/${tripId}/activities`, { stopId, ...activityData });
    return response.data;
  }
  await delay(50);
  const trips = getStoredTrips();
  const trip = trips.find((t) => String(t.id) === String(tripId));
  if (!trip) throw new Error('Trip not found');

  const targetStopId = String(stopId);
  const stop = (trip.stops || []).find((s) => String(s.id) === targetStopId);
  if (!stop) throw new Error('Stop not found');

  const newActivity = {
    id: `tac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    activityId: activityData.activityId || `act_custom_${Date.now()}`,
    name: activityData.name,
    time: activityData.time || '10:00',
    cost: Number(activityData.cost) || 0,
    category: activityData.category || 'Sightseeing',
    dayIndex: activityData.dayIndex || 1,
  };

  stop.activities = stop.activities || [];
  stop.activities.push(newActivity);
  
  // Recalculate estimated trip budget
  let totalCost = 0;
  trip.stops.forEach((s) => {
    totalCost += (s.accommodationCost || 0) + (s.transportCost || 0);
    (s.activities || []).forEach((act) => { totalCost += (act.cost || 0); });
  });
  trip.estimatedBudget = totalCost;

  saveStoredTrips(trips);
  return newActivity;
};

export const updateTripActivity = async (tripId, activityId, activityData) => {
  if (!USE_MOCK) {
    const response = await apiClient.put(`/trip-activities/${activityId}`, activityData);
    return response.data;
  }
  await delay();
  const trips = getStoredTrips();
  const trip = trips.find(t => t.id === tripId);
  if (trip) {
    for (const stop of trip.stops || []) {
      const actIndex = stop.activities?.findIndex(a => a.id === activityId);
      if (actIndex !== undefined && actIndex !== -1) {
        stop.activities[actIndex] = { ...stop.activities[actIndex], ...activityData };
        saveStoredTrips(trips);
        return stop.activities[actIndex];
      }
    }
  }
  throw new Error('Activity not found');
};

export const deleteTripActivity = async (tripId, activityId) => {
  if (!USE_MOCK) {
    const response = await apiClient.delete(`/trip-activities/${activityId}`);
    return response.data;
  }
  await delay();
  const trips = getStoredTrips();
  const trip = trips.find(t => t.id === tripId);
  if (trip) {
    for (const stop of trip.stops || []) {
      if (stop.activities) {
        stop.activities = stop.activities.filter(a => a.id !== activityId);
      }
    }
    saveStoredTrips(trips);
    return { success: true };
  }
  throw new Error('Trip not found');
};

// =================== BUDGET & TIMELINE SERVICES ===================

export const getTripBudget = async (tripId) => {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/trips/${tripId}/budget`);
    return response.data;
  }
  await delay();
  const trip = await getTrip(tripId);
  
  let transport = 0;
  let accommodation = 0;
  let activitiesCost = 0;
  let meals = 0;
  
  const cityBreakdown = [];

  trip.stops?.forEach(stop => {
    const stopTransport = stop.transportCost || 0;
    const stopAccom = stop.accommodationCost || 0;
    let stopActivities = 0;
    let stopMeals = 0;

    stop.activities?.forEach(act => {
      if (act.category === 'Food') {
        meals += act.cost || 0;
        stopMeals += act.cost || 0;
      } else {
        activitiesCost += act.cost || 0;
        stopActivities += act.cost || 0;
      }
    });

    transport += stopTransport;
    accommodation += stopAccom;

    cityBreakdown.push({
      city: stop.cityName,
      transport: stopTransport,
      accommodation: stopAccom,
      activities: stopActivities,
      meals: stopMeals,
      total: stopTransport + stopAccom + stopActivities + stopMeals,
    });
  });

  const total = transport + accommodation + activitiesCost + meals;
  const avgPerDay = trip.totalDays > 0 ? Math.round(total / trip.totalDays) : total;

  return {
    total,
    targetBudget: trip.targetBudget || 50000,
    avgPerDay,
    remaining: (trip.targetBudget || 50000) - total,
    isOverBudget: total > (trip.targetBudget || 50000),
    breakdown: [
      { name: 'Transport', cost: transport, color: '#0d9488' },
      { name: 'Accommodation', cost: accommodation, color: '#0284c7' },
      { name: 'Activities', cost: activitiesCost, color: '#f59e0b' },
      { name: 'Meals', cost: meals, color: '#ea580c' },
    ],
    cityBreakdown,
  };
};

export const getTripTimeline = async (tripId) => {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/trips/${tripId}/timeline`);
    return response.data;
  }
  await delay();
  const trip = await getTrip(tripId);
  
  // Format timeline events chronologically
  const timelineDays = [];
  let currentDay = 1;

  trip.stops?.forEach((stop) => {
    timelineDays.push({
      dayNumber: currentDay,
      date: stop.startDate,
      cityName: stop.cityName,
      country: stop.country,
      stopId: stop.id,
      events: stop.activities || [],
    });
    currentDay += 1;
  });

  return { tripId: trip.id, tripName: trip.name, timelineDays };
};

// =================== PUBLIC SHARE & COPY SERVICES ===================

export const createShareLink = async (tripId) => {
  if (!USE_MOCK) {
    const response = await apiClient.post(`/trips/${tripId}/share`);
    return response.data;
  }
  await delay();
  const trip = await getTrip(tripId);
  const shareId = trip.shareId || `sh_${Math.random().toString(36).substring(2, 9)}`;
  await updateTrip(tripId, { isPublic: true, shareId });
  const shareUrl = `${window.location.origin}/shared/${shareId}`;
  return { shareId, shareUrl };
};

export const getSharedTrip = async (shareId) => {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/shared/${shareId}`);
    return response.data;
  }
  await delay();
  const trips = getStoredTrips();
  const trip = trips.find(t => t.shareId === shareId || t.id === shareId);
  if (!trip) throw new Error('Shared trip not found or link has expired');
  return {
    ...trip,
    status: calculateTripStatus(trip.startDate, trip.endDate, trip.status),
  };
};

export const copySharedTrip = async (shareId) => {
  if (!USE_MOCK) {
    const response = await apiClient.post(`/shared/${shareId}/copy`);
    return response.data;
  }
  await delay();
  const sourceTrip = await getSharedTrip(shareId);
  const clonedTrip = {
    ...sourceTrip,
    id: `trip_${Date.now()}`,
    name: `${sourceTrip.name} (Copy)`,
    shareId: `sh_${Math.random().toString(36).substring(2, 9)}`,
    createdUser: INITIAL_USER.name,
    status: 'Planning',
  };
  const trips = getStoredTrips();
  trips.unshift(clonedTrip);
  saveStoredTrips(trips);
  return clonedTrip;
};

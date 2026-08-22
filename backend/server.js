import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import { initDatabaseSchema } from './schema.js';
import { seedDatabaseData } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_secret_jwt_key_2026_odoo';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const formatIsoDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(d).split('T')[0];
};

// Helper: Hydrate Trip with stops & activities
const getFullTripDetails = async (tripId) => {
  const [tripRows] = await pool.query('SELECT * FROM trips WHERE id = ?', [tripId]);
  if (tripRows.length === 0) return null;
  const trip = tripRows[0];

  const [stops] = await pool.query('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC', [tripId]);

  const [activities] = await pool.query('SELECT * FROM trip_activities WHERE trip_id = ?', [tripId]);

  const stopsWithActivities = stops.map((stop) => {
    const stopActivities = activities
      .filter((a) => String(a.stop_id) === String(stop.id))
      .map((a) => ({
        id: a.id,
        activityId: a.activity_id,
        name: a.name,
        category: a.category,
        cost: Number(a.cost),
        participantCount: Number(a.participant_count || 1),
        time: a.time,
        selected: Boolean(a.selected),
        isCustom: Boolean(a.is_custom),
        image: a.image,
      }));

    return {
      id: stop.id,
      cityId: stop.city_id,
      cityName: stop.city_name,
      country: stop.country,
      order: stop.stop_order,
      startDate: formatIsoDate(stop.start_date),
      endDate: formatIsoDate(stop.end_date),
      accommodationCost: Number(stop.accommodationCost || stop.accommodation_cost || 0),
      transportCost: Number(stop.transportCost || stop.transport_cost || 0),
      activities: stopActivities,
    };
  });

  let calculatedEst = stopsWithActivities.reduce((acc, stop) => {
    const actSum = (stop.activities || []).reduce((aSum, a) => aSum + (Number(a.cost) || 0) * (Number(a.participantCount) || 1), 0);
    return acc + actSum + (Number(stop.accommodationCost) || 0) + (Number(stop.transportCost) || 0);
  }, 0);

  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    startDate: formatIsoDate(trip.start_date),
    endDate: formatIsoDate(trip.end_date),
    totalDays: trip.total_days,
    status: trip.status,
    coverImage: trip.cover_image,
    targetBudget: Number(trip.target_budget),
    estimatedBudget: calculatedEst > 0 ? calculatedEst : Number(trip.estimated_budget),
    adultsCount: Number(trip.adults_count || 1),
    childrenCount: Number(trip.children_count || 0),
    travelersCount: Number(trip.travelers_count || 1),
    shareId: trip.share_id,
    isPublic: Boolean(trip.is_public),
    createdUser: trip.created_user,
    stops: stopsWithActivities,
  };
};

// =================== AUTH ROUTES ===================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const id = `usr_${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = 'Traveler';

    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, name || email.split('@')[0], email, passwordHash, userRole]
    );

    const userObj = { id, name: name || email.split('@')[0], email, role: userRole };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userObj = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =================== TRIPS ROUTES ===================

app.get('/api/trips', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT id FROM trips WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)';
      queryParams.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    if (status && status !== 'All') {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [tripIds] = await pool.query(query, queryParams);
    const trips = await Promise.all(tripIds.map((t) => getFullTripDetails(t.id)));

    res.json(trips.filter(Boolean));
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
});

app.get('/api/trips/share/:shareId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM trips WHERE share_id = ?', [req.params.shareId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Shared trip not found' });
    const trip = await getFullTripDetails(rows[0].id);
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shared trip' });
  }
});

app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await getFullTripDetails(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
});

app.get('/api/trips/:id/timeline', async (req, res) => {
  try {
    const trip = await getFullTripDetails(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const timelineDays = (trip.stops || []).map((stop, idx) => ({
      dayNumber: idx + 1,
      date: stop.startDate || trip.startDate,
      cityName: stop.cityName,
      country: stop.country,
      stopId: stop.id,
      events: stop.activities || [],
    }));

    res.json({
      tripId: trip.id,
      tripName: trip.name,
      timelineDays,
    });
  } catch (error) {
    console.error('Timeline fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch trip timeline' });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const tripData = req.body;
    const tripId = `trip_${Date.now()}`;
    const shareId = `sh_${Math.random().toString(36).substring(2, 9)}`;

    await pool.query(
      `INSERT INTO trips (id, user_id, name, description, start_date, end_date, total_days, status, cover_image, target_budget, estimated_budget, adults_count, children_count, travelers_count, share_id, is_public, created_user)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        req.user?.id || null,
        tripData.name || 'New Adventure',
        tripData.description || '',
        tripData.startDate || '2026-10-01',
        tripData.endDate || '2026-10-07',
        tripData.totalDays || 7,
        tripData.status || 'Planning',
        tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        Number(tripData.targetBudget) || 50000,
        Number(tripData.estimatedBudget) || 0,
        Number(tripData.adultsCount || tripData.adults) || 1,
        Number(tripData.childrenCount || tripData.children) || 0,
        Number(tripData.travelersCount || tripData.travelers || (Number(tripData.adultsCount || 1) + Number(tripData.childrenCount || 0))),
        shareId,
        tripData.isPublic !== undefined ? (tripData.isPublic ? 1 : 0) : 1,
        tripData.createdUser || 'Traveler',
      ]
    );

    // Save Stops & Activities
    if (tripData.stops && Array.isArray(tripData.stops)) {
      for (let i = 0; i < tripData.stops.length; i++) {
        const stop = tripData.stops[i];
        const stopId = `stop_${Date.now()}_${i}`;
        await pool.query(
          `INSERT INTO trip_stops (id, trip_id, city_id, city_name, country, stop_order, start_date, end_date, accommodation_cost, transport_cost)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            stopId,
            tripId,
            stop.cityId || null,
            stop.cityName || 'City',
            stop.country || '',
            i + 1,
            stop.startDate || tripData.startDate || null,
            stop.endDate || tripData.endDate || null,
            Number(stop.accommodationCost) || 0,
            Number(stop.transportCost) || 0,
          ]
        );

        if (stop.activities && Array.isArray(stop.activities)) {
          for (let j = 0; j < stop.activities.length; j++) {
            const act = stop.activities[j];
            const actId = `tact_${Date.now()}_${i}_${j}`;
            await pool.query(
              `INSERT INTO trip_activities (id, trip_id, stop_id, activity_id, name, category, cost, time, selected, is_custom, image)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                actId,
                tripId,
                stopId,
                act.activityId || act.id || null,
                act.name,
                act.category || 'Sightseeing',
                Number(act.cost) || 0,
                act.time || '10:00',
                act.selected !== false ? 1 : 0,
                act.isCustom ? 1 : 0,
                act.image || null,
              ]
            );
          }
        }
      }
    }

    const createdTrip = await getFullTripDetails(tripId);
    res.status(201).json(createdTrip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Failed to create trip' });
  }
});

app.put('/api/trips/:id', async (req, res) => {
  try {
    const tripId = req.params.id;
    const tripData = req.body;

    const [existing] = await pool.query('SELECT id FROM trips WHERE id = ?', [tripId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Trip not found' });

    await pool.query(
      `UPDATE trips 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date),
           total_days = COALESCE(?, total_days),
           status = COALESCE(?, status),
           target_budget = COALESCE(?, target_budget),
           estimated_budget = COALESCE(?, estimated_budget),
           adults_count = COALESCE(?, adults_count),
           children_count = COALESCE(?, children_count),
           travelers_count = COALESCE(?, travelers_count)
       WHERE id = ?`,
      [
        tripData.name,
        tripData.description,
        tripData.startDate,
        tripData.endDate,
        tripData.totalDays,
        tripData.status,
        tripData.targetBudget,
        tripData.estimatedBudget,
        tripData.adultsCount || tripData.adults,
        tripData.childrenCount || tripData.children,
        tripData.travelersCount || tripData.travelers,
        tripId,
      ]
    );

    if (tripData.stops && Array.isArray(tripData.stops)) {
      for (let i = 0; i < tripData.stops.length; i++) {
        const s = tripData.stops[i];
        if (s.id) {
          await pool.query('UPDATE trip_stops SET stop_order = ? WHERE id = ?', [i + 1, s.id]);
        }
      }
    }

    const updatedTrip = await getFullTripDetails(tripId);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Failed to update trip' });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    const tripId = req.params.id;
    await pool.query('DELETE FROM trips WHERE id = ?', [tripId]);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
});

// =================== CITIES ROUTES ===================

app.get('/api/cities', async (req, res) => {
  try {
    const { search, region, costIndex } = req.query;
    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(country) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    if (region && region !== 'All') {
      query += ' AND region = ?';
      params.push(region);
    }

    if (costIndex && costIndex !== 'All') {
      query += ' AND cost_index = ?';
      params.push(costIndex);
    }

    query += ' ORDER BY popularity DESC';

    const [rows] = await pool.query(query, params);
    const cities = rows.map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      costIndex: c.cost_index,
      popularity: c.popularity,
      description: c.description,
      image: c.image,
      attractions: typeof c.attractions_json === 'string' ? JSON.parse(c.attractions_json) : (c.attractions_json || []),
    }));

    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Failed to fetch cities' });
  }
});

app.get('/api/cities/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'City not found' });
    const c = rows[0];
    res.json({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      costIndex: c.cost_index,
      popularity: c.popularity,
      description: c.description,
      image: c.image,
      attractions: typeof c.attractions_json === 'string' ? JSON.parse(c.attractions_json) : (c.attractions_json || []),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch city' });
  }
});

// =================== STOPS & ACTIVITIES ROUTES ===================

app.post('/api/trips/:id/stops', async (req, res) => {
  try {
    const tripId = req.params.id;
    const stopData = req.body;
    const stopId = `stop_${Date.now()}`;

    const [orderRow] = await pool.query('SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = ?', [tripId]);
    const stopOrder = (orderRow[0]?.count || 0) + 1;

    await pool.query(
      `INSERT INTO trip_stops (id, trip_id, city_id, city_name, country, stop_order, start_date, end_date, accommodation_cost, transport_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stopId,
        tripId,
        stopData.cityId || null,
        stopData.cityName || 'Destination',
        stopData.country || '',
        stopOrder,
        stopData.startDate || null,
        stopData.endDate || null,
        Number(stopData.accommodationCost) || 5000,
        Number(stopData.transportCost) || 2000,
      ]
    );

    res.status(201).json({ id: stopId, tripId, ...stopData, order: stopOrder });
  } catch (error) {
    console.error('Add stop error:', error);
    res.status(500).json({ message: 'Failed to add stop' });
  }
});

app.put('/api/stops/:id', async (req, res) => {
  try {
    const stopId = req.params.id;
    const stopData = req.body;

    await pool.query(
      `UPDATE trip_stops
       SET accommodation_cost = COALESCE(?, accommodation_cost),
           transport_cost = COALESCE(?, transport_cost),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date)
       WHERE id = ?`,
      [stopData.accommodationCost, stopData.transportCost, stopData.startDate, stopData.endDate, stopId]
    );

    res.json({ id: stopId, ...stopData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stop' });
  }
});

app.delete('/api/stops/:id', async (req, res) => {
  try {
    const stopId = req.params.id;
    await pool.query('DELETE FROM trip_stops WHERE id = ?', [stopId]);
    res.json({ success: true, message: 'Stop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete stop' });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const { cityId, category, search, maxCost } = req.query;
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];

    if (cityId) {
      query += ' AND city_id = ?';
      params.push(cityId);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND LOWER(name) LIKE ?';
      params.push(`%${search.toLowerCase()}%`);
    }

    if (maxCost) {
      query += ' AND cost <= ?';
      params.push(Number(maxCost));
    }

    const [rows] = await pool.query(query, params);
    const activities = rows.map((a) => ({
      id: a.id,
      cityId: a.city_id,
      name: a.name,
      category: a.category,
      cost: Number(a.cost),
      time: a.default_time,
      image: a.image,
    }));

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

app.post('/api/trips/:id/activities', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { stopId, activityId, name, category, cost, participantCount, time, isCustom, image } = req.body;
    const actId = `tact_${Date.now()}`;

    await pool.query(
      `INSERT INTO trip_activities (id, trip_id, stop_id, activity_id, name, category, cost, participant_count, time, selected, is_custom, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actId,
        tripId,
        stopId,
        activityId || null,
        name,
        category || 'Sightseeing',
        Number(cost) || 0,
        Number(participantCount) || 1,
        time || '10:00',
        1,
        isCustom ? 1 : 0,
        image || null,
      ]
    );

    res.status(201).json({ id: actId, tripId, stopId, name, category, cost, participantCount: Number(participantCount) || 1, time, selected: true, isCustom: Boolean(isCustom) });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Failed to add activity' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const actId = req.params.id;
    const { cost, participantCount, time, selected, name, category } = req.body;

    await pool.query(
      `UPDATE trip_activities
       SET cost = COALESCE(?, cost),
           participant_count = COALESCE(?, participant_count),
           time = COALESCE(?, time),
           selected = COALESCE(?, selected),
           name = COALESCE(?, name),
           category = COALESCE(?, category)
       WHERE id = ?`,
      [
        cost !== undefined ? Number(cost) : null,
        participantCount !== undefined ? Number(participantCount) : null,
        time,
        selected !== undefined ? (selected ? 1 : 0) : null,
        name,
        category,
        actId,
      ]
    );

    res.json({ id: actId, ...req.body });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Failed to update activity' });
  }
});

// Start Server & Init DB
const startServer = async () => {
  try {
    await initDatabaseSchema();
    await seedDatabaseData();

    app.listen(PORT, () => {
      console.log(`🚀 Globetrotter Express MySQL Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};

startServer();

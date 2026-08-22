import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { COUNTRY_CITIES_CATALOG, COUNTRY_CONTINENT_MAP, getCitiesForCountryCatalog } from '../src/data/globalCitiesDatabase.js';

export const seedDatabaseData = async () => {
  try {
    // 1. Seed Initial User if none exists
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      const passwordHash = await bcrypt.hash('123456789', 10);
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, avatar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          '101',
          'Alazhar',
          'az@gmail.com',
          passwordHash,
          'Lead Explorer',
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        ]
      );
      console.log('✅ Seeded user az@gmail.com into users table.');
    }

const CITY_PHOTOS = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80',
];

    // 2. Seed Destinations & Activities if none exist
    const [destRows] = await pool.query('SELECT COUNT(*) as count FROM destinations');
    if (destRows[0].count === 0) {
      console.log('🌱 Seeding authentic tourist destinations database into MySQL...');
      let totalDest = 0;
      let totalAct = 0;

      const countries = Object.keys(COUNTRY_CONTINENT_MAP);

      for (const ctry of countries) {
        const continent = COUNTRY_CONTINENT_MAP[ctry] || 'Europe';
        const catalog = COUNTRY_CITIES_CATALOG[ctry] || getCitiesForCountryCatalog(ctry, continent);

        for (let idx = 0; idx < catalog.length; idx++) {
          const catCity = catalog[idx];
          const cityId = `c_${ctry.toLowerCase().replace(/\s+/g, '_')}_${idx}`;
          const attractionsJson = JSON.stringify(
            catCity.attractions || [`${catCity.name} Landmark Tour`, `${catCity.name} Culture Walk`, `${catCity.name} Food Tasting`]
          );
          const cityPhoto = CITY_PHOTOS[totalDest % CITY_PHOTOS.length];

          await pool.query(
            `INSERT INTO destinations (id, name, country, region, cost_index, popularity, description, image, attractions_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cityId,
              catCity.name,
              ctry,
              continent,
              catCity.cost || 'Moderate',
              95 - (idx % 12),
              `Famous tourist destination in ${catCity.name}, ${ctry}.`,
              cityPhoto,
              attractionsJson,
            ]
          );
          totalDest++;

          // Insert Activities for this city
          const attractions = catCity.attractions || [`${catCity.name} Landmark Tour`, `${catCity.name} Culture Walk`, `${catCity.name} Food Tasting`];
          for (let aIdx = 0; aIdx < Math.min(3, attractions.length); aIdx++) {
            const attrName = attractions[aIdx];
            const actId = `act_${cityId}_${aIdx}`;
            const actPhoto = CITY_PHOTOS[(totalAct + aIdx) % CITY_PHOTOS.length];
            await pool.query(
              `INSERT INTO activities (id, city_id, name, category, cost, default_time, image)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                actId,
                cityId,
                attrName,
                aIdx === 0 ? 'Sightseeing' : aIdx === 1 ? 'Culture' : 'Food',
                (aIdx + 1) * 1200,
                aIdx === 0 ? '09:30' : aIdx === 1 ? '14:00' : '18:00',
                actPhoto,
              ]
            );
            totalAct++;
          }
        }
      }
      console.log(`✅ Seeded ${totalDest} destinations and ${totalAct} activities into MySQL.`);
    }

    // 3. Seed Initial Trips if none exist
    const [tripRows] = await pool.query('SELECT COUNT(*) as count FROM trips');
    if (tripRows[0].count === 0) {
      console.log('🌱 Seeding initial trips into MySQL...');
      const tripId = 'trip_101';
      await pool.query(
        `INSERT INTO trips (id, user_id, name, description, start_date, end_date, total_days, status, cover_image, target_budget, estimated_budget, share_id, is_public, created_user)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tripId,
          '101',
          'European Dream Tour',
          'Exploring Paris, Zurich & Rome',
          '2026-10-01',
          '2026-10-10',
          10,
          'Planning',
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
          80000.00,
          65000.00,
          'euro_tour_2026',
          1,
          'Alazhar',
        ]
      );

      // Seed Stop for Paris
      const stopId = 'stop_101_paris';
      await pool.query(
        `INSERT INTO trip_stops (id, trip_id, city_id, city_name, country, stop_order, accommodation_cost, transport_cost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [stopId, tripId, 'c_france_0', 'Paris', 'France', 1, 15000.00, 3000.00]
      );

      // Seed Trip Activities for Paris
      await pool.query(
        `INSERT INTO trip_activities (id, trip_id, stop_id, activity_id, name, category, cost, time, selected, is_custom)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['tact_1', tripId, stopId, 'act_c_france_0_0', 'Eiffel Tower Summit Access', 'Sightseeing', 4500.00, '09:30', 1, 0]
      );
      await pool.query(
        `INSERT INTO trip_activities (id, trip_id, stop_id, activity_id, name, category, cost, time, selected, is_custom)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['tact_2', tripId, stopId, 'act_c_france_0_1', 'Louvre Museum Timed Entry', 'Culture', 2800.00, '14:00', 1, 0]
      );
      console.log('✅ Seeded demo trip into MySQL.');
    }
  } catch (error) {
    console.error('❌ Error seeding database data:', error);
  }
};

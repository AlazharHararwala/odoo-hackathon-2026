import { pool } from './db.js';

const dropAllTrips = async () => {
  try {
    console.log('🗑️ Dropping all trip plans across all users in MySQL database "odoo_hackathon"...');
    await pool.query('DELETE FROM trip_activities');
    await pool.query('DELETE FROM trip_stops');
    await pool.query('DELETE FROM trips');
    console.log('✅ All trip plans, route stops, and activities have been successfully cleared from database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to drop trips:', error);
    process.exit(1);
  }
};

dropAllTrips();

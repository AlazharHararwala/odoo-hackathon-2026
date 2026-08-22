import { pool } from './db.js';

async function addParticipantCountColumn() {
  try {
    console.log('Adding participant_count column to trip_activities table...');
    await pool.query(`
      ALTER TABLE trip_activities 
      ADD COLUMN participant_count INT DEFAULT 1;
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Column participant_count already exists.');
      } else {
        throw err;
      }
    });
    console.log('✅ participant_count column verified/added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding participant_count column:', error);
    process.exit(1);
  }
}

addParticipantCountColumn();

import { pool } from './db.js';

const addTravelersColumns = async () => {
  try {
    console.log('🛠️ Updating MySQL "trips" table schema with adults_count, children_count, travelers_count columns...');
    
    // Check existing columns
    const [columns] = await pool.query('SHOW COLUMNS FROM trips');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('adults_count')) {
      await pool.query('ALTER TABLE trips ADD COLUMN adults_count INT DEFAULT 1');
      console.log('✅ Added adults_count column.');
    }

    if (!columnNames.includes('children_count')) {
      await pool.query('ALTER TABLE trips ADD COLUMN children_count INT DEFAULT 0');
      console.log('✅ Added children_count column.');
    }

    if (!columnNames.includes('travelers_count')) {
      await pool.query('ALTER TABLE trips ADD COLUMN travelers_count INT DEFAULT 1');
      console.log('✅ Added travelers_count column.');
    }

    console.log('🎉 MySQL "trips" table successfully updated with adults & children group composition columns!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update trips table schema:', error);
    process.exit(1);
  }
};

addTravelersColumns();

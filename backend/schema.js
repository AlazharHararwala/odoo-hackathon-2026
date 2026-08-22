import { rootPool, pool } from './db.js';

export const initDatabaseSchema = async () => {
  try {
    const dbName = process.env.DB_NAME || 'odoo_hackathon';
    // 1. Create database if not exists
    await rootPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database "${dbName}" checked/created successfully.`);

    // 2. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Traveler',
        avatar TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Destinations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        cost_index VARCHAR(50) NOT NULL,
        popularity INT DEFAULT 90,
        description TEXT NULL,
        image TEXT NULL,
        attractions_json JSON NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Trips Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days INT NOT NULL,
        status VARCHAR(50) DEFAULT 'Planning',
        cover_image TEXT NULL,
        target_budget DECIMAL(12,2) DEFAULT 0.00,
        estimated_budget DECIMAL(12,2) DEFAULT 0.00,
        adults_count INT DEFAULT 1,
        children_count INT DEFAULT 0,
        travelers_count INT DEFAULT 1,
        share_id VARCHAR(50) NOT NULL UNIQUE,
        is_public TINYINT(1) DEFAULT 1,
        created_user VARCHAR(100) DEFAULT 'Traveler',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create TripStops Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trip_stops (
        id VARCHAR(36) PRIMARY KEY,
        trip_id VARCHAR(36) NOT NULL,
        city_id VARCHAR(100) NULL,
        city_name VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        stop_order INT NOT NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        accommodation_cost DECIMAL(12,2) DEFAULT 0.00,
        transport_cost DECIMAL(12,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create Activities Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(36) PRIMARY KEY,
        city_id VARCHAR(100) NOT NULL,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        cost DECIMAL(12,2) DEFAULT 0.00,
        default_time VARCHAR(10) DEFAULT '10:00',
        image TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create TripActivities Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trip_activities (
        id VARCHAR(36) PRIMARY KEY,
        trip_id VARCHAR(36) NOT NULL,
        stop_id VARCHAR(36) NOT NULL,
        activity_id VARCHAR(100) NULL,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        cost DECIMAL(12,2) DEFAULT 0.00,
        participant_count INT DEFAULT 1,
        time VARCHAR(10) DEFAULT '10:00',
        selected TINYINT(1) DEFAULT 1,
        is_custom TINYINT(1) DEFAULT 0,
        image TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`✅ All database tables verified/created in "${dbName}".`);
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
};

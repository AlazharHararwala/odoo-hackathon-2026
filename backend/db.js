import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Root connection pool to check/create database
export const rootPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// App database connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'odoo_hackathon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

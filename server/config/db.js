import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Migration transferred to database/migrate.js
const pool = mysql.createPool({
  host:              process.env.DB_HOST,
  user:              process.env.DB_USER,
  password:          process.env.DB_PASSWORD,
  database:          process.env.DB_NAME,
  port:               process.env.DB_PORT || 3306, //3306 as default
  waitForConnections: true,
  connectionLimit:   10,
});

export default pool;
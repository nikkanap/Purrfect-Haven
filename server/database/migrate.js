import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL migration script for db
async function runMigration() {
  let connection;

  try {
    console.log('Connecting to MySQL...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
    });

    console.log('Connected. Running schema migration...\n');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(sql);

    console.log('Migration complete. Tables created:');
    console.log('  - Species');
    console.log('  - Users');
    console.log('  - Pets');
    console.log('  - pet_photos');
    console.log('  - Adoptions');
    console.log('  - Rescue_Reports');
    console.log('\nDatabase is ready.');

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
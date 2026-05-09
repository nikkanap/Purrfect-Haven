import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  let connection;

  try {
    console.log('Connecting to MySQL...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
    });

    console.log('Connected. Running seed...\n');

    const seedPath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    await connection.query(sql);

    console.log('Seed complete. Inserted:');
    console.log('  - 5 Species  (Dog, Cat, Rabbit, Bird, Guinea Pig)');
    console.log('  - 7 Pets     (5 available, 2 adopted)');
    console.log('\nYou can now test all pet listing endpoints.');

  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSeed();
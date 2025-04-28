import express from 'express';
import http from 'http';
import { Pool } from 'pg';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);


app.use(cors({ origin: 'https://waterfront-frontend.onrender.com' }));

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

// Middleware to parse JSON
app.use(express.json());

// Explicitly test the DB connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully!');
    client.release();

    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_usage (
        id SERIAL PRIMARY KEY,
        room VARCHAR(10) NOT NULL,
        type VARCHAR(10) NOT NULL,
        amount NUMERIC NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "water_usage" is ready.');
  } catch (err) {
    console.error('❌ Error connecting to the database or creating table:', err);
    process.exit(1); // Stop the server if the database connection fails
  }
})();

// REST API to handle water usage data
app.post('/api/water-flow', async (req, res) => {
  const { room, type, amount } = req.body;

  if (room && type && amount) {
    try {
      await pool.query(
        'INSERT INTO water_usage (room, type, amount) VALUES ($1, $2, $3)',
        [room, type, amount]
      );
      console.log(`✅ Inserted ${type} water usage in ${room}: ${amount}`);
      res.status(201).send('Water usage data inserted successfully');
    } catch (err) {
      console.error('❌ Error inserting data:', err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    console.error('❌ Invalid data received:', req.body);
    res.status(400).send('Invalid data');
  }
});

// REST API to get aggregate water usage
app.get('/api/water-usage', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT type, SUM(amount) AS total_usage
      FROM water_usage
      GROUP BY type
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// (Optional) Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1'); // simple quick query
    res.send('Database connection is healthy!');
  } catch (err) {
    res.status(500).send('Database connection failed');
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

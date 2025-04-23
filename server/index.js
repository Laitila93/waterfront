import express from 'express';
import http from 'http';
import { Pool } from 'pg';
import cors from 'cors';
import fs from 'fs';

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
// Allow connections from localhost:5173
app.use(cors({ origin: 'http://localhost:5173' }));

// Read database configuration from a JSON file
const dbConfig = JSON.parse(fs.readFileSync('./dbConfig.json', 'utf-8'));

// PostgreSQL connection pool
const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port
});

// Middleware to parse JSON
app.use(express.json());

// Create table if it doesn't exist
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS water_usage (
      id SERIAL PRIMARY KEY,
      room VARCHAR(10) NOT NULL,
      type VARCHAR(10) NOT NULL,
      amount NUMERIC NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
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
      console.log(`Inserted ${type} water usage in ${room}: ${amount}`);
      res.status(201).send('Water usage data inserted successfully');
    } catch (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    console.error('Invalid data received:', req.body);
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
    console.error('Error fetching data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

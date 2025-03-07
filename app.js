const express = require('express');
require('dotenv').config()
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer'); // Middleware for handling form-data
const { check, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handles application/x-www-form-urlencoded

// Debug Middleware
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  next();
});

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Create schools table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating schools table:', err);
      return;
    }
    console.log('Schools table ready');
  });
});

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Route 1: Add School API (Supports x-www-form-urlencoded & form-data)
app.post('/addSchool', multer().none(), [
  check('name').notEmpty().withMessage('School name is required'),
  check('address').notEmpty().withMessage('School address is required'),
  check('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required (-90 to 90)'),
  check('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required (-180 to 180)')
], (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get data from request body
  const { name, address, latitude, longitude } = req.body;

  // Convert latitude & longitude to float (since form-data sends them as strings)
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // Insert school into database
  const insertQuery = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(insertQuery, [name, address, lat, lon], (err, result) => {
    if (err) {
      console.error('Error adding school:', err);
      return res.status(500).json({ error: 'Failed to add school' });
    }

    return res.status(201).json({
      message: 'School added successfully',
      schoolId: result.insertId
    });
  });
});

// Route 2: List Schools API
app.get('/listSchools', [
  check('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required (-90 to 90)'),
  check('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required (-180 to 180)')
], (req, res) => {
  // Log the request data to debug
  console.log('Received query params:', req.query);
  console.log('Received body params:', req.body);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  // Retrieve latitude and longitude correctly
  const userLat = parseFloat(req.query.latitude || req.body.latitude);
  const userLon = parseFloat(req.query.longitude || req.body.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude format' });
  }

  console.log('Parsed Latitude:', userLat);
  console.log('Parsed Longitude:', userLon);

  // Fetch all schools from the database
  const query = 'SELECT * FROM schools';
  db.query(query, (err, schools) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).json({ error: 'Failed to fetch schools' });
    }

    if (!schools.length) {
      return res.status(404).json({ message: 'No schools found' });
    }

    // Calculate the distance for each school and add it as a property
    const schoolsWithDistance = schools.map(school => ({
      id: school.id,
      name: school.name,
      address: school.address,
      latitude: school.latitude,
      longitude: school.longitude,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
    }));

    // Sort schools by distance
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      count: schoolsWithDistance.length,
      schools: schoolsWithDistance
    });
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

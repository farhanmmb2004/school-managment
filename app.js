// File: app.js - Main application file

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // replace with your MySQL username
  password: 'password', // replace with your MySQL password
  database: 'school_management'
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

// Helper function to calculate distance between two coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

// Route 1: Add School API
app.post('/addSchool', [
  // Validation middleware
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
  
  // Insert school into database
  const insertQuery = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(insertQuery, [name, address, latitude, longitude], (err, result) => {
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
  // Validation middleware
  check('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required (-90 to 90)'),
  check('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required (-180 to 180)')
], (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Get user's location from query parameters
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);
  
  // Get all schools from database
  const query = 'SELECT * FROM schools';
  db.query(query, (err, schools) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).json({ error: 'Failed to fetch schools' });
    }
    
    // Calculate distance for each school and add it as a property
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
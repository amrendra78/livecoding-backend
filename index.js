const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'https://livecoding-gamma.vercel.app'],
  credentials: true
}));
app.use(express.json());

// SIMPLE FILE DATABASE (NO EXTERNAL DEPENDENCIES)
const DB_FILE = path.join(__dirname, 'database.json');

const initializeFileDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    console.log('📁 Created file database');
  }
};

const readFileDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

const writeFileDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const addUserToFileDB = (user) => {
  const db = readFileDB();
  user.id = Date.now().toString();
  user.createdAt = new Date().toISOString();
  db.users.push(user);
  writeFileDB(db);
  return user;
};

const findUserInFileDB = (email) => {
  const db = readFileDB();
  return db.users.find(user => user.email === email.toLowerCase());
};

const getAllUsersFromFileDB = () => {
  return readFileDB().users;
};

// Initialize file database
initializeFileDB();

// SIGNUP ROUTE - WORKING VERSION
app.post('/api/signup', async (req, res) => {
  console.log('📝 Signup request:', req.body);
  
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = findUserInFileDB(email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = addUserToFileDB({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password // Storing as plain text for now
    });

    console.log('✅ User saved to File Database');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      database: 'File Database'
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message
    });
  }
});

// GET USERS ROUTE
app.get('/api/users', (req, res) => {
  try {
    const users = getAllUsersFromFileDB().map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// TEST ROUTE
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    database: 'File Database'
  });
});

// GET route for /api/signup (for testing)
app.get('/api/signup', (req, res) => {
  res.json({
    success: true,
    message: 'Signup endpoint is working! Use POST method to register.',
    example: {
      method: 'POST',
      url: '/api/signup',
      body: {
        name: 'Your Name',
        email: 'your@email.com',
        password: 'yourpassword'
      }
    }
  });
});

// ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running!',
    endpoints: [
      'GET  /',
      'GET  /api/test',
      'POST /api/signup',
      'GET  /api/users'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: File Database`);
  console.log(`👥 Users: ${getAllUsersFromFileDB().length}`);
});
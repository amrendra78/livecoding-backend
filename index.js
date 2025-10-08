const express = require('express');
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

// SIMPLE FILE DATABASE (NO MONGODB, NO BCRYPT)
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize file database
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

// Initialize database
initializeFileDB();

// SIGNUP ROUTE - SIMPLE AND WORKING
app.post('/api/signup', (req, res) => {
  console.log('📝 Signup request received:', req.body);
  
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
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
      password: password
    });

    console.log('✅ User registered successfully:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
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
      message: 'Internal server error during signup'
    });
  }
});

// GET ALL USERS
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
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working perfectly! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// HEALTH CHECK
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /': 'Health check',
      'GET /api/test': 'Test endpoint', 
      'POST /api/signup': 'User registration',
      'GET /api/users': 'Get all users'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`📊 Using: File Database`);
  console.log(`👥 Total users: ${getAllUsersFromFileDB().length}`);
  console.log('✅ Ready to accept requests!');
});
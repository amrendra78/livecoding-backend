// index.js - SIMPLIFIED VERSION (NO EXTERNAL FILES)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// SIMPLE FILE DATABASE (BUILT-IN)
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

let useMongoDB = false;

// MONGODB CONNECTION WITH BETTER ERROR HANDLING
const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    
    // Try different password variations
    const passwordOptions = [
      'Akumar4078',  // Without URL encoding
      'Akumar%4078', // With URL encoding
      'Akumar@78'    // Actual password
    ];

    let connected = false;
    
    for (let password of passwordOptions) {
      try {
        const MONGODB_URI = `mongodb+srv://helloworlds078:${password}@cluster0.vbtdpkq.mongodb.net/mydatabase?retryWrites=true&w=majority`;
        
        console.log(`🔑 Trying password: ${password.replace(/./g, '*')}`);
        
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
        });
        
        connected = true;
        useMongoDB = true;
        console.log('✅ MongoDB Connected Successfully!');
        break;
        
      } catch (err) {
        console.log(`❌ Failed with password: ${password.replace(/./g, '*')}`);
      }
    }

    if (!connected) {
      console.log('💡 Using File Database (MongoDB authentication failed)');
      console.log('💡 Please check your MongoDB Atlas password in .env file');
    }

  } catch (error) {
    console.log('❌ MongoDB Connection Failed. Using File Database.');
    console.log('🔧 Error:', error.message);
  }
};

connectDB();

// SIGNUP ROUTE
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

    let user;
    let dbType = 'File Database';
    
    if (useMongoDB && mongoose.connection.readyState === 1) {
      // Try MongoDB first
      try {
        // Define User model if not already defined
        if (!mongoose.models.User) {
          const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String
          }, { timestamps: true });
          mongoose.model('User', userSchema);
        }

        const User = mongoose.model('User');
        
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
          return res.status(409).json({ 
            success: false,
            message: 'User already exists' 
          });
        }

        const newUser = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password
        });

        user = await newUser.save();
        dbType = 'MongoDB';
        console.log('✅ User saved to MongoDB');
        
      } catch (mongoError) {
        console.log('❌ MongoDB save failed, using file database:', mongoError.message);
        useMongoDB = false;
      }
    }

    // If MongoDB failed or not available, use file database
    if (!user) {
      const existingUser = findUserInFileDB(email);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'User already exists' 
        });
      }

      user = addUserToFileDB({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password
      });
      console.log('✅ User saved to File Database');
    }

    console.log('🎉 Signup successful:', { email: user.email, database: dbType });

    res.status(201).json({
      success: true,
      message: `User registered successfully (${dbType})`,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email
      },
      database: dbType
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
app.get('/api/users', async (req, res) => {
  try {
    let users = [];
    let dbType = 'File Database';
    
    if (useMongoDB && mongoose.connection.readyState === 1) {
      try {
        const User = mongoose.model('User');
        users = await User.find({}, { password: 0 });
        dbType = 'MongoDB';
      } catch (mongoError) {
        console.log('MongoDB fetch failed, using file database');
        users = getAllUsersFromFileDB();
      }
    } else {
      users = getAllUsersFromFileDB();
    }

    console.log(`📊 Found ${users.length} users in ${dbType}`);
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })),
      database: dbType
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// DATABASE STATUS
app.get('/api/db-status', (req, res) => {
  const fileUsers = getAllUsersFromFileDB();
  
  res.json({
    success: true,
    databases: {
      mongodb: {
        status: useMongoDB ? 'Connected' : 'Disconnected',
        readyState: mongoose.connection.readyState
      },
      file: {
        status: 'Active',
        usersCount: fileUsers.length
      }
    },
    currentDatabase: useMongoDB ? 'MongoDB' : 'File Database'
  });
});

// TEST ROUTE
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    database: useMongoDB ? 'MongoDB' : 'File Database'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Primary Database: ${useMongoDB ? 'MongoDB Atlas' : 'File Database'}`);
  console.log(`👥 File Database Users: ${getAllUsersFromFileDB().length}`);
});
// server.cjs
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ ADD THIS ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "🚀 Welcome to Backend API Server",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /api/health",
      test: "GET /api/test",
      signup: "POST /api/auth/signup", 
      login: "POST /api/auth/login"
    },
    instructions: {
      test_get: "Use browser for GET endpoints",
      test_post: "Use Postman/curl for POST endpoints"
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 EXPRESS SERVER WORKING!",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: "✅ TEST ENDPOINT WORKING!",
    endpoints: [
      "GET /api/health",
      "POST /api/auth/signup", 
      "POST /api/auth/login"
    ]
  });
});

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'All fields required'
    });
  }

  res.json({
    success: true,
    message: "Signup successful!",
    user: { 
      id: Date.now(), 
      name, 
      email 
    },
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password required'
    });
  }

  res.json({
    success: true,
    message: "Login successful!",
    token: "jwt-token-here",
    user: { 
      id: '123', 
      name: 'Test User', 
      email: email 
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Root: http://localhost:${PORT}/`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ Test: http://localhost:${PORT}/api/test`);
  console.log(`📝 Signup: POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
});
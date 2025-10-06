// server.cjs
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 EXPRESS SERVER WORKING!",
    timestamp: new Date().toISOString()
  });
});

// Test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: "✅ TEST ENDPOINT WORKING!"
  });
});

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  res.json({
    success: true,
    message: "Signup successful!",
    user: { name, email, id: Date.now() }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    success: true,
    message: "Login successful!",
    token: "jwt-token",
    user: { name: "Test User", email, id: 123 }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
import clientPromise from '../../lib/mongodb.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // ✅ CORS HEADERS - ADD AT VERY TOP
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // ✅ HANDLE OPTIONS REQUEST
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const client = await clientPromise;
      const db = client.db('mydatabase');
      
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      res.status(200).json({ 
        success: true, 
        message: "Login successful!",
        user: { 
          id: user._id,
          name: user.name,
          email: user.email
        },
        token: "jwt-token-here",
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
import clientPromise from '../../lib/mongodb.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // ✅ CORS FIX - Add at the VERY TOP
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // ✅ OPTIONS request handle karo
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // ✅ REAL DATABASE CONNECTION
      const client = await clientPromise;
      const db = client.db('mydatabase');
      
      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = {
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('users').insertOne(newUser);

      res.status(201).json({ 
        success: true, 
        message: "User registered successfully!",
        user: { 
          id: result.insertedId,
          name: newUser.name,
          email: newUser.email
        },
        token: "jwt-token-will-be-added",
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
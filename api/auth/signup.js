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
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // MongoDB connection
      const client = await clientPromise;
      const db = client.db('mydatabase');
      
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

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
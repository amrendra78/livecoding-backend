import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock database (replace with real MongoDB later)
let users = [];

export default async function handler(req, res) {
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

      // Check if user exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      users.push(user);

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      // Return response (without password)
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userResponse
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
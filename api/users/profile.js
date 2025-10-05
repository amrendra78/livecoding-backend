import jwt from 'jsonwebtoken';

// Mock database
let users = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Find user
      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Return user profile (without password)
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(200).json({
        success: true,
        user: userResponse
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-2024');

      // Mock user data
      res.status(200).json({
        success: true,
        user: {
          id: decoded.userId,
          name: 'John Doe',
          email: decoded.email,
          profileCompleted: true
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    success: true,
    message: "✅ TEST API WORKING!",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /api/health",
      signup: "POST /api/auth/signup",
      login: "POST /api/auth/login",
      profile: "GET /api/users/profile"
    }
  });
}
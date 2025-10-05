export default async function handler(req, res) {
  // ✅ PRODUCTION CORS - Multiple origins allow karo
  const allowedOrigins = [
    'http://localhost:4200',
    'https://livecoding-ny2n.vercel.app',
    'https://livecoding-4booqec6w-amrendra7624-gmailcoms-projects.vercel.app',
    'https://livecoding.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS request (preflight)
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

      res.status(200).json({ 
        success: true, 
        message: "User registered successfully!",
        user: { name, email, id: Date.now() },
        token: "mock-jwt-token",
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
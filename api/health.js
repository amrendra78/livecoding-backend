// api/health.js - SIMPLE TEST
export default function handler(req, res) {
  console.log('✅ Health route called');
  res.status(200).json({ 
    status: "healthy",
    route: "health",
    timestamp: new Date().toISOString()
  });
}
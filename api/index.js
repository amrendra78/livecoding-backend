// api/index.js - SIMPLE TEST
export default function handler(req, res) {
  console.log('✅ API Index route called');
  res.status(200).json({ 
    message: "🚀 MAIN ROUTE WORKING!",
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
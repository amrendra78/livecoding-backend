export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      success: true, 
      message: "API is working perfectly!",
      data: {
        user: "Test User",
        id: 12345
      },
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
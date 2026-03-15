// api/test.js
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Return diagnostic information
    res.status(200).json({ 
        status: 'ok', 
        message: 'API is working!',
        method: req.method,
        timestamp: new Date().toISOString(),
        environment: {
            vercel: !!process.env.VERCEL,
            vercel_env: process.env.VERCEL_ENV || 'not set',
            hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
            node_version: process.version
        },
        endpoints: {
            devotional: '/api/daily-verse (POST)',
            test: '/api/test (GET)'
        }
    });
}
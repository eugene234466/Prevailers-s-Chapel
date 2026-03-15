export default function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Simple test response
    return res.status(200).json({
        title: "God's Daily Word",
        message: [
            "This is a test message to verify the API is working.",
            "Your API is now connected successfully!",
            "You can now add the Anthropic API key to generate real devotionals."
        ],
        reflections: [
            "How has God spoken to you today?",
            "What step of faith will you take?",
            "Who can you encourage today?"
        ],
        prayer: "Lord, thank You for Your faithfulness. Guide us today. Amen."
    });
}
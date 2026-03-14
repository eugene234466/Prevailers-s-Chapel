// api/devotional.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle GET request for testing
    if (req.method === 'GET') {
        return res.status(200).json({
            message: 'Devotional API is ready',
            instructions: 'Send a POST request with verseText and verseRef'
        });
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { verseText, verseRef } = req.body;

        if (!verseText || !verseRef) {
            return res.status(400).json({ 
                error: 'Missing verseText or verseRef' 
            });
        }

        const API_KEY = process.env.ANTHROPIC_API_KEY;
        
        // Simple prompt
        const prompt = `Write a devotional for ${verseRef}: "${verseText}"

Return ONLY this JSON format (no other text):
{
  "title": "A short title",
  "message": ["Paragraph 1", "Paragraph 2", "Paragraph 3"],
  "reflections": ["Question 1", "Question 2", "Question 3"],
  "prayer": "A prayer"
}`;

        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1024,
                temperature: 0.7,
                system: "You are a pastor. Respond with valid JSON only.",
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic error:', response.status, errorText);
            return res.status(500).json({ 
                error: 'Anthropic API error',
                status: response.status 
            });
        }

        const data = await response.json();
        let text = data.content[0].text;
        
        // Clean the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse JSON
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]);
            } else {
                throw new Error('Could not parse AI response');
            }
        }

        // Return the devotional
        return res.status(200).json(parsed);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate devotional',
            message: error.message 
        });
    }
}
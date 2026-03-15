// api/daily-verse.js
export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle GET request for testing
    if (req.method === 'GET') {
        return res.status(200).json({
            message: 'Devotional API is ready',
            instructions: 'Send a POST request with verseText and verseRef',
            status: 'online'
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
        
        // If no API key, return thoughtful fallback
        if (!API_KEY) {
            console.log('No API key, using fallback');
            return res.status(200).json({
                title: `Meditation on ${verseRef}`,
                message: [
                    `"${verseText}"`,
                    "Take time to meditate on this scripture today.",
                    "Let God's Word guide your thoughts and actions.",
                    "His promises are true and His love endures forever."
                ],
                reflections: [
                    `How does ${verseRef} speak to your current situation?`,
                    "What is one way you can apply this verse today?",
                    "Who in your life needs to hear this message?"
                ],
                prayer: `Heavenly Father, thank You for Your Word in ${verseRef}. Help me to hide it in my heart and live it out today. In Jesus' name, Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // Call Anthropic API
        const prompt = `You are a Christian pastor. Write a devotional for ${verseRef}: "${verseText}"

Return ONLY this JSON format (no other text):
{
  "title": "A short, meaningful title (5-8 words)",
  "message": [
    "First paragraph explaining the verse (2-3 sentences)",
    "Second paragraph with practical application (2-3 sentences)",
    "Third paragraph with encouragement (2-3 sentences)"
  ],
  "reflections": [
    "First reflection question",
    "Second reflection question", 
    "Third reflection question"
  ],
  "prayer": "A heartfelt prayer (3-4 sentences)"
}`;

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
                system: "You are a helpful pastor. Always respond with valid JSON only.",
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', response.status, errorText);
            throw new Error('Anthropic API error');
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
            console.log('Failed direct parse, trying to extract JSON...');
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]);
            } else {
                throw new Error('Could not parse AI response');
            }
        }

        // Ensure all fields exist
        const result = {
            title: parsed.title || `Word for Today`,
            message: Array.isArray(parsed.message) ? parsed.message : [
                `Today's verse: ${verseRef}`,
                "Meditate on God's Word.",
                "Let it guide your steps."
            ],
            reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [
                "How does this apply to your life?",
                "What is God teaching you?",
                "How will you respond?"
            ],
            prayer: parsed.prayer || `Lord, thank You for ${verseRef}. Amen.`
        };

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error:', error);
        // Always return something useful
        const { verseText, verseRef } = req.body;
        return res.status(200).json({
            title: `God's Word for Today`,
            message: [
                `"${verseText || 'God is love'}"`,
                "Take time to reflect on this scripture.",
                "Let God's truth encourage your heart today.",
                "His promises are true and His love never fails."
            ],
            reflections: [
                "What does this verse teach you about God?",
                "How does it apply to your life right now?",
                "Who can you share this encouragement with?"
            ],
            prayer: `Heavenly Father, thank You for Your Word in ${verseRef || 'Scripture'}. Help me to live in Your truth and share Your love with others today. In Jesus' name, Amen.`
        });
    }
}
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

        // IMPROVED PROMPT - More pastoral and specific
        const prompt = `You are a loving, experienced Christian pastor writing a daily devotional for your congregation. Write a warm, encouraging, and practical devotional based on this verse:

VERSE: ${verseRef} - "${verseText}"

INSTRUCTIONS:
- Write like a caring pastor speaking directly to one person
- Be warm, personal, and encouraging
- Make it practical for daily life
- Stay faithful to Scripture
- Use simple, clear language

Return ONLY a JSON object with this exact structure:
{
  "title": "A warm, engaging title (5-8 words that capture the essence)",
  "message": [
    "Start with a gentle introduction that connects the verse to everyday life. Make it personal and relatable. (2-3 sentences)",
    "Explain the verse's meaning in simple terms. Share a brief insight about God's character or His promises. Include a short, relatable example or illustration. (3-4 sentences)",
    "Give practical application for today. Help the reader take one step of faith. End with hope and encouragement. (2-3 sentences)"
  ],
  "reflections": [
    "A personal question that helps the reader examine their heart (make it gentle and thoughtful)",
    "A question about applying this truth in their relationships or daily activities",
    "A question that points them to take action or share with someone today"
  ],
  "prayer": "Write a heartfelt, conversational prayer that flows from the devotional. Address God warmly, thank Him for the truth in this verse, and ask for help to live it out. End with 'In Jesus' name, Amen.' (4-5 sentences)"
}

EXAMPLE OF GOOD TONE:
Instead of "One must consider the theological implications..."
Write: "Friend, have you ever felt like God was far away? This verse reminds us that..."

Make every word feel like a gentle, caring conversation.`
;

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
                temperature: 0.8, // Slightly higher for more warmth
                system: "You are a kind, experienced pastor who writes warm, personal devotionals. You speak directly to one person with love and encouragement. Your writing is simple, heartfelt, and practical.",
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
            title: parsed.title || `Reflections on ${verseRef}`,
            message: Array.isArray(parsed.message) ? parsed.message : [
                `Today, let's reflect on ${verseRef}.`,
                `"${verseText}"`,
                "Take a moment to let these words sink into your heart.",
                "God's Word has a way of meeting us right where we are."
            ],
            reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [
                "What is God speaking to you through this verse?",
                "How can you live this out today?",
                "Who can you share this encouragement with?"
            ],
            prayer: parsed.prayer || `Dear Lord, thank You for ${verseRef}. Help me to carry this truth in my heart today. In Jesus' name, Amen.`
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
                "Friend, take a moment to read that verse again slowly.",
                "Let it sink into your heart. God is speaking to you through these words.",
                "Whatever you're facing today, He is with you."
            ],
            reflections: [
                "What word or phrase stood out to you in this verse?",
                "How does this truth apply to your life right now?",
                "What would it look like to trust God with this today?"
            ],
            prayer: `Lord Jesus, thank You for Your living Word. Speak to my heart through this scripture. Help me not just to read it, but to live it. I trust You with whatever I'm facing today. In Your name, Amen.`
        });
    }
}
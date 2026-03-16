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
                title: `Understanding ${verseRef}`,
                message: [
                    `${verseRef} tells us: "${verseText}"`,
                    `This verse reveals something important about God's character and His relationship with us.`,
                    `Take time to reflect on what God is saying to you through these words today.`,
                    `Let this scripture guide your thoughts and actions.`
                ],
                reflections: [
                    `What does this verse teach you about God?`,
                    `How does it apply to your life right now?`
                ],
                prayer: `Lord, thank You for Your Word. Help me to understand and live out this truth today. Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // DYNAMIC PROMPT - Let Claude explain based on what the verse actually says
        const prompt = `You are a pastor writing a daily devotional. Write a warm, practical explanation of this verse:

VERSE: ${verseRef} - "${verseText}"

INSTRUCTIONS:
- EXPLAIN what this verse actually means (context, key words, what it's teaching)
- Make it practical for everyday life
- Be warm and personal, like a pastor talking to their congregation
- Let the content be GUIDED BY THE VERSE ITSELF - if it's about faith, explain faith; if it's about love, explain love; if it's about suffering, explain suffering
- Don't force the same structure every time - be dynamic

Return a JSON object with this structure:
{
  "title": "A title that captures the main point of THIS specific verse",
  "message": [
    "First paragraph: Explain what the verse means. What's the context? What's the key message?",
    "Second paragraph: Go deeper. What does this teach us about God? About ourselves?",
    "Third paragraph: Practical application. How do we live this out today?"
  ],
  "reflections": [
    "A thoughtful question that flows from this specific verse",
    "Another question that helps apply it personally"
  ],
  "prayer": "A prayer that responds to the truth of THIS verse"
}

Remember: Be dynamic! If the verse is about grace, talk about grace. If it's about forgiveness, talk about forgiveness. Let the scripture guide you.`
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
                max_tokens: 1000,
                temperature: 0.7,
                system: "You are a warm, practical pastor who explains scripture clearly. You let the Bible itself guide what you say - every verse gets treated according to what it's actually about.",
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

        return res.status(200).json(parsed);

    } catch (error) {
        console.error('Error:', error);
        // Always return something useful
        const { verseText, verseRef } = req.body;
        
        return res.status(200).json({
            title: `Reflections on ${verseRef}`,
            message: [
                `Today's scripture: ${verseRef} - "${verseText}"`,
                `This verse speaks directly to our lives. Take time to let it sink in.`,
                `God's Word has a way of meeting us right where we are.`,
                `Whatever you're facing today, this truth is for you.`
            ],
            reflections: [
                `What stands out to you most in this verse?`,
                `How can you live this out today?`
            ],
            prayer: `Lord, thank You for speaking to me through Your Word. Help me to walk in this truth today. Amen.`
        });
    }
}
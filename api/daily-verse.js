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
                title: `Living Out ${verseRef}`,
                message: [
                    `${verseRef} tells us: "${verseText}"`,
                    `Here's what this looks like in real life...`,
                    `When you're tempted to get even with someone who hurt you, this verse calls you to a different path.`,
                    `It's not easy, but God gives you the strength to do good even when others do you wrong.`
                ],
                reflections: [
                    `Who comes to mind when you read this verse? Is there someone you need to forgive?`,
                    `What's one small way you can "do good" to someone today, even if they don't deserve it?`
                ],
                prayer: `Lord, this is hard. My first instinct is to strike back when I'm hurt. Give me Your heart and Your strength to do good instead. Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // PROMPT - Practical life application style
        const prompt = `You are a pastor writing a daily devotional for your congregation. Write something practical that helps people APPLY God's Word to their everyday lives. Keep it warm, personal, and down-to-earth.

VERSE: ${verseRef} - "${verseText}"

IMPORTANT GUIDELINES:
- NOT a theology lecture - this is for regular people with jobs, kids, bills, and struggles
- Use everyday language, not churchy jargon
- Start with a real-life situation people can relate to
- Explain the verse briefly, but focus on WHAT TO DO WITH IT TODAY
- End with practical application they can actually do

STYLE EXAMPLE (study this tone):
"When someone cuts you off in traffic, what's your first instinct? Honk? Shout? Speed up and get back in front of them? 1 Thessalonians 5:15 speaks right into that moment. Paul says don't pay back wrong for wrong. Instead, do good. Even to that driver. Even when you're running late. That's not natural - that's supernatural. But that's exactly what following Jesus looks like in rush hour traffic."

Return ONLY a JSON object with this structure:
{
  "title": "A short, catchy title that connects to real life (3-6 words)",
  "message": [
    "First paragraph: Start with a relatable scenario or question that draws people in. Make them think 'that's me!' (2-3 sentences)",
    "Second paragraph: Bring in the verse and explain it simply. What does it actually mean? No Greek or Hebrew unless it's super simple. (2-3 sentences)",
    "Third paragraph: Give practical application. What does obeying this look like today? At work? At home? With your family? (3-4 sentences)",
    "Fourth paragraph: Encouragement and hope. Remind them God provides the strength to do this. (1-2 sentences)"
  ],
  "reflections": [
    "A question that helps them examine their heart honestly",
    "A question that moves them to action today"
  ],
  "prayer": "A simple, honest prayer someone could pray right now - not fancy, just real"
}

Remember: Make it feel like a caring friend giving advice, not a professor teaching a class.`
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
                temperature: 0.8,
                system: "You are a warm, practical pastor who helps people apply God's Word to their everyday lives. You use simple language, real-life examples, and always point to what the reader can DO today.",
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
            title: `Real Life with ${verseRef}`,
            message: [
                `You know that moment when someone really gets under your skin? Maybe it's a coworker who takes credit for your work, or a family member who knows exactly which buttons to push.`,
                `${verseRef} speaks right into that moment: "${verseText}"`,
                `Here's what this looks like practically: Before you fire off that angry text, pause. Before you give them the silent treatment, pause. Before you tell your side of the story to anyone who'll listen, pause. In that pause, ask God to show you what "doing good" could look like. Maybe it's a kind word. Maybe it's setting a boundary with grace. Maybe it's just praying for them instead of plotting against them.`,
                `You can't do this in your own strength - and God knows that. He's not asking you to try harder. He's asking you to rely on Him more. His Spirit inside you can produce responses you never could on your own.`
            ],
            reflections: [
                `Who is the hardest person for you to be kind to right now?`,
                `What's one specific good thing you could do for them this week?`
            ],
            prayer: `God, I admit there are people I'd rather avoid than bless. Change my heart. Show me one practical way to do good today, and give me the strength to actually do it. Amen.`
        });
    }
}
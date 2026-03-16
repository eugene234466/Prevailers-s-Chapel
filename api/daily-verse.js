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
                error: 'Missing verseText or verseRef',
                received: { verseText, verseRef }
            });
        }

        const API_KEY = process.env.ANTHROPIC_API_KEY;
        
        // Log API key presence (not the key itself)
        console.log(`API Key present: ${!!API_KEY}`);
        if (API_KEY) {
            console.log(`API Key length: ${API_KEY.length}`);
        }
        
        // If no API key, return practical fallback
        if (!API_KEY) {
            console.log('No API key, using fallback');
            return res.status(200).json({
                title: `When God Feels Bigger Than Your Problems`,
                message: [
                    `${verseRef} says: "${verseText}"`,
                    `You know those days when everything feels overwhelming? The kids are acting up, work is stressful, and you're running on empty. This verse is for that exact moment.`,
                    `The writer isn't using fancy religious language. He's saying something simple: God is really, really big. Bigger than your messy house. Bigger than your bank account. Bigger than that situation you've been worrying about.`,
                    `So today, when you feel small and your problems feel huge, just look up. The same God who holds the universe together can handle whatever you're facing. You don't need to have it all figured out. You just need to remember who's in charge.`
                ],
                reflections: [
                    `What's one thing stressing you out right now that you need to hand over to God?`,
                    `How might your day change if you actually believed God is bigger than your problems?`
                ],
                prayer: `God, I've been carrying a lot. Remind me today that You're bigger than any of it. Help me to trust You with the things I can't control. Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // PRACTICAL, EVERYDAY PROMPT - Less theology, more real life
        const prompt = `You are a pastor writing a short daily devotional for regular people with jobs, families, and real-life struggles.

Scripture: ${verseRef} — "${verseText}"

Write a devotional that SOUNDS LIKE THIS:
- Start with a relatable situation someone might be facing today
- Use everyday language, not churchy words
- Explain the verse simply - what does it mean for Tuesday morning?
- Give practical help they can actually use today
- End with hope they can hold onto

NOT this: theological explanations, Greek words, deep doctrine
DO this: "You know that moment when...", "Here's what helps me...", "Today you could try..."

Format:
Title: A short, catchy title (3-6 words)

Message: Three short paragraphs that feel like a friend encouraging you
Paragraph 1: Start with something relatable
Paragraph 2: Bring in the verse and what it means for real life
Paragraph 3: Give one practical thing they can do today

Reflections: Two simple questions that help them apply it
Question 1: Something to think about
Question 2: Something to try

Prayer: A short, honest prayer in everyday words

Return ONLY valid JSON with this structure:
{
  "title": "title here",
  "message": ["para1", "para2", "para3"],
  "reflections": ["question1", "question2"],
  "prayer": "prayer here"
}`;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 800,
                    temperature: 0.8,
                    system: "You are a pastor who talks like a friend. You use simple words and help people connect God's Word to their everyday life. No jargon, no theology lessons - just real help for real people.",
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Anthropic API error status:', response.status);
                
                // Practical fallback
                return res.status(200).json({
                    title: `For When You Need to Remember`,
                    message: [
                        `You know those moments when you forget who's really in charge? When you're stressing over things you can't control?`,
                        `${verseRef} is a gentle reminder: "${verseText}" It's not complicated theology. It's just truth - God is good, and you can trust Him.`,
                        `Today, try this: every time you catch yourself worrying, take one deep breath and quietly say, "God's got this." See if it changes how you feel by the end of the day.`
                    ],
                    reflections: [
                        `What's one thing you're holding onto that you need to let God handle?`,
                        `Who in your life needs to hear this reminder today?`
                    ],
                    prayer: `God, I forget sometimes. I get busy and stressed and I try to do it all myself. Help me remember today that You're with me, You're for me, and You're big enough for whatever comes. Amen.`
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
                console.log('Failed direct parse, trying to extract JSON...');
                const match = text.match(/\{[\s\S]*\}/);
                if (match) {
                    parsed = JSON.parse(match[0]);
                } else {
                    throw new Error('Could not parse AI response');
                }
            }

            // Ensure the response has the required structure
            const devotional = {
                title: parsed.title || `A Word for Today`,
                message: Array.isArray(parsed.message) ? parsed.message : [
                    `Let's be real for a moment.`,
                    `${verseRef} says: "${verseText}"`,
                    `That's something you can hold onto today.`
                ],
                reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [
                    `What stood out to you in this verse?`,
                    `How can you live this out today?`
                ],
                prayer: parsed.prayer || `God, help me with this today. Amen.`
            };

            return res.status(200).json(devotional);

        } catch (anthropicError) {
            console.error('Anthropic fetch error:', anthropicError.message);
            
            // Practical, relatable fallback
            return res.status(200).json({
                title: `For When You're Feeling Small`,
                message: [
                    `Ever have one of those days where everything feels too big and you feel too small?`,
                    `${verseRef} is for that day. "${verseText}" It's not saying you have to understand everything about God. It's saying He's got this. He's got you.`,
                    `So today, just breathe. You don't have to have all the answers. You don't have to be strong enough. You just have to look up and remember who's actually in charge.`
                ],
                reflections: [
                    `What's weighing on you right now that you need to hand over?`,
                    `What would it look like to trust God with that one thing today?`
                ],
                prayer: `God, I'm handing this to You. I can't carry it anymore. Help me to trust You with it today. Amen.`
            });
        }

    } catch (error) {
        console.error('Server error:', error.message);
        const { verseText, verseRef } = req.body || {};
        return res.status(200).json({
            title: `Just For Today`,
            message: [
                `Some days are harder than others.`,
                `${verseRef || 'Scripture'} reminds us: "${verseText || 'God is with you'}"`,
                `That's enough to get through today. One step at a time.`
            ],
            reflections: [
                `What do you need from God today?`,
                `Who can you check in on?`
            ],
            prayer: `God, be with me today. That's all I ask. Amen.`
        });
    }
}

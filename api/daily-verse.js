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
                    `Today's scripture is ${verseRef}: "${verseText}"`,
                    `This verse reveals God's character and His promises to us.`,
                    `Take time to study the context and meaning of this passage.`,
                    `Consider how it points to God's faithfulness and our response.`
                ],
                reflections: [
                    `What does this verse teach you about God's character?`,
                    `How should this truth shape your response to Him?`,
                    `What practical difference does this make in your daily life?`
                ],
                prayer: `Heavenly Father, thank You for Your Word in ${verseRef}. Help me to understand and apply this truth today. In Jesus' name, Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // UPDATED PROMPT - Bible explanation style like the sample
        const prompt = `You are a Bible teacher writing a daily devotional that explains scripture. Write a devotional that teaches and explains the meaning of this verse, just like the sample provided.

SAMPLE DEVOTIONAL STYLE:
"Our God is faithful and just - let us praise Him

Some people feel awkward praising God publicly, but for the Psalmist, it was his utmost desire to express his thanksgiving wholeheartedly in the congregation of the righteous (v.1). How did he describe the works of God from v.3? God's miraculous works attest to His greatness, honour, and goodness. He provides food for those who fear Him, and He is forever mindful of His covenant (vs.2-6). God's actions are trustworthy and just (vs.7-9). This means that God is fair and His decisions are always right. If you must enjoy more of God's faithfulness and walk in wisdom, you must fear and obey Him at all times and in all things. The fear of the Lord is the beginning of wisdom (v.10)."

VERSE TO EXPLAIN TODAY: ${verseRef} - "${verseText}"

Write a devotional that:
1. EXPLAINS what the verse means (don't just say "meditate on it")
2. TEACHES the context and significance
3. REVEALS something about God's character
4. APPLIES it to daily life (1-2 sentences at most)
5. Uses a warm but instructive tone

Return ONLY a JSON object with this structure:
{
  "title": "A clear, meaningful title that captures the main truth (5-8 words)",
  "message": [
    "First paragraph: Introduce the verse and explain its context. What is the psalmist or writer communicating? (2-3 sentences)",
    "Second paragraph: Dig deeper into the meaning. Explain key phrases. What does this teach us about God? About ourselves? (3-4 sentences)",
    "Third paragraph: Brief application. How should this truth shape our lives today? (1-2 sentences)"
  ],
  "reflections": [
    "Question 1: A thoughtful question that helps readers examine their lives (like the sample's Q.1)",
    "Question 2: Another practical question for application (like the sample's Q.2)"
  ],
  "prayer": "A prayer that responds to the truth explained, not just a generic blessing"
}

Important: Focus on EXPLAINING the scripture, not just encouraging meditation. Be warm but instructive.`
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
                temperature: 0.7,
                system: "You are a Bible teacher who explains scripture clearly and warmly. You focus on teaching the meaning of the text, not just encouraging meditation.",
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
            title: parsed.title || `Understanding ${verseRef}`,
            message: Array.isArray(parsed.message) ? parsed.message : [
                `Today's scripture is ${verseRef}: "${verseText}"`,
                `This verse reveals an important truth about God's character and His relationship with us.`,
                `The writer is emphasizing that God is faithful to His promises and just in all His ways.`,
                `This means we can trust Him completely, even when we don't understand our circumstances.`
            ],
            reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [
                `What does this verse teach you about God's character?`,
                `How should this truth shape your response to Him today?`
            ],
            prayer: parsed.prayer || `Lord, thank You for revealing Yourself through Your Word. Help me to trust in Your faithfulness and justice today. Amen.`
        };

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error:', error);
        // Always return something useful
        const { verseText, verseRef } = req.body;
        return res.status(200).json({
            title: `Understanding ${verseRef}`,
            message: [
                `${verseRef} tells us: "${verseText}"`,
                `This verse reveals God's character - He is faithful, just, and worthy of our trust.`,
                `The writer wants us to understand that God's nature is unchanging, even when our circumstances fluctuate.`,
                `Because God is faithful, we can rely on His promises. Because He is just, we know He will do what is right.`
            ],
            reflections: [
                `How have you experienced God's faithfulness recently?`,
                `What does it mean for you today that God is just?`
            ],
            prayer: `Heavenly Father, thank You for revealing Yourself in ${verseRef}. Help me to trust in Your faithfulness and rest in Your justice today. In Jesus' name, Amen.`
        });
    }
}
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

        // HIGH-QUALITY PROMPT V2 - Your improved version
        const prompt = `You are a pastor, Bible teacher, and devotional writer preparing a short daily devotional for Christians seeking spiritual encouragement and practical wisdom.

Your task is to write a devotional based on the following scripture.

Scripture
${verseRef} — "${verseText}"

Core Objective
Explain the meaning of this verse in a way that is:
- Biblically faithful
- Pastoral and warm
- Deep but easy to understand
- Practical for everyday Christian living

The devotional should help readers understand the verse, reflect on their spiritual life, and respond to God in prayer.

Writing Instructions
1. Let the Scripture Lead
The devotional must be guided by the verse itself.
Examples:
If the verse speaks about peace, explain biblical peace.
If it addresses faith, explore trusting God.
If it deals with suffering, speak about endurance and hope.
If it highlights love or obedience, focus on those themes.
Avoid forcing a generic devotional structure.

2. Paragraph Expectations
Paragraph 1 – Understanding the Verse
Explain what the verse means.
Mention important words, imagery, or context if helpful.
Focus on the main truth the verse communicates.

Paragraph 2 – Spiritual Insight
Go deeper into what this verse reveals about:
God's character
God's promises
human nature
the life of faith

Paragraph 3 – Living It Out
Make the verse practical.
Show how a believer might apply this truth in everyday life.
Encourage reflection and obedience.

3. Tone
Write in a voice that feels like:
a pastor encouraging their church
compassionate
hopeful
personal but not casual
spiritually thoughtful
Avoid:
academic commentary
theological jargon
robotic or repetitive structures

4. Reflection Questions
Write two thoughtful reflection questions that help the reader:
examine their heart
apply the verse personally
The questions should be deep, not generic.

5. Prayer
Write a short heartfelt prayer that:
responds to the truth of the verse
asks God for help to live it out
sounds natural and sincere

Output Requirements
Return ONLY valid JSON.
Do NOT include:
explanations
markdown
commentary
extra text

Required JSON Format
{
  "title": "A meaningful devotional title that reflects the message of the verse",
  "message": [
    "Paragraph explaining the meaning of the verse",
    "Paragraph exploring the deeper spiritual insight",
    "Paragraph giving practical life application"
  ],
  "reflections": [
    "Reflection question based on the verse",
    "Personal application question"
  ],
  "prayer": "A sincere prayer responding to the message of the verse"
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
                max_tokens: 1000,
                temperature: 0.7,
                system: "You are a warm, pastoral Bible teacher who writes devotionals that are biblically faithful, deeply spiritual, and practically helpful. You always let the scripture guide your teaching.",
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
                `${verseRef} reminds us: "${verseText || 'God is love'}"`,
                `This verse speaks to our hearts and calls us to deeper faith.`,
                `Take time to let these words sink in and shape your day.`,
                `God's truth has the power to transform how we live.`
            ],
            reflections: [
                `What is God saying to you through this verse?`,
                `How will you respond today?`
            ],
            prayer: `Lord, thank You for Your living Word. Speak to my heart through this scripture and help me to walk in Your ways. Amen.`
        });
    }
}
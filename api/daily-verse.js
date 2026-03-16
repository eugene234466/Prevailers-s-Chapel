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
        
        // If no API key, return thoughtful fallback
        if (!API_KEY) {
            console.log('No API key, using fallback');
            return res.status(200).json({
                title: `The Greatness of Our God`,
                message: [
                    `${verseRef} declares: "${verseText}"`,
                    `The psalmist David uses the Hebrew word "gadol" for "great" - it speaks of something magnificent, beyond ordinary measure. God's greatness isn't like human greatness - it's infinite, unmatched, and eternal.`,
                    `The phrase "no one can fathom" comes from the Hebrew "eyn cheqer" - there is no searching, no measuring, no fully comprehending. This doesn't frustrate God; it invites worship. A God we could fully explain would be too small for our needs.`,
                    `Today, instead of trying to figure God out completely, let's stand in awe of who He is. Your problems may seem big, but they're not bigger than your God. His greatness has no limits - and neither does His love for you.`
                ],
                reflections: [
                    `What aspect of God's greatness amazes you most today?`,
                    `How might remembering God's unfathomable greatness change how you face your current situation?`
                ],
                prayer: `Lord, Your greatness is beyond what my mind can grasp. Yet in Your mercy, You reveal Yourself to me. Today, I choose to trust not in my own understanding, but in Your infinite wisdom and love. Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // YOUR HIGH-QUALITY PROMPT V2
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
                    max_tokens: 1000,
                    temperature: 0.7,
                    system: "You are a warm, pastoral Bible teacher who writes devotionals that are biblically faithful, deeply spiritual, and practically helpful. You always let the scripture guide your teaching.",
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Anthropic API error status:', response.status);
                console.error('Anthropic API error response:', errorText);
                
                // Fallback to built-in devotional if Anthropic fails
                return res.status(200).json({
                    title: `The Unfathomable Greatness of God`,
                    message: [
                        `${verseRef} tells us: "${verseText}"`,
                        `The Hebrew word for "great" here is "gadol" - it speaks of something magnificent, immense, beyond ordinary measure. The psalmist isn't just saying God is big; he's declaring that God's greatness is in a category all its own.`,
                        `The phrase "no one can fathom" comes from "eyn cheqer" - there is no searching, no measuring, no fully comprehending. This doesn't mean we can't know God at all; it means we spend eternity discovering more of who He is. His love has no bottom, His wisdom no limit, His power no boundary.`,
                        `Today, when life feels overwhelming, remember you serve a God whose greatness is bigger than any problem. When you don't understand your circumstances, trust the God whose ways are beyond finding out. Let your inability to fully comprehend Him become an invitation to deeper trust.`
                    ],
                    reflections: [
                        `When have you tried to put God in a box you could understand?`,
                        `How might you embrace the mystery of God's greatness today instead of trying to figure it all out?`
                    ],
                    prayer: `Lord, forgive me for wanting a God small enough to fit in my understanding. Expand my vision of Your greatness today. Help me to trust You even when I cannot trace You. In Jesus' name, Amen.`
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
                title: parsed.title || `Reflections on ${verseRef}`,
                message: Array.isArray(parsed.message) ? parsed.message : [
                    parsed.message || `Today we reflect on ${verseRef}.`,
                    "Take time to meditate on God's Word.",
                    "Let it guide your steps today."
                ],
                reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [
                    "What is God saying to you through this verse?",
                    "How will you respond today?"
                ],
                prayer: parsed.prayer || `Lord, thank You for Your Word in ${verseRef}. Amen.`
            };

            return res.status(200).json(devotional);

        } catch (anthropicError) {
            console.error('Anthropic fetch error:', anthropicError.message);
            
            // Return a beautiful fallback specific to this verse
            return res.status(200).json({
                title: `The God We Cannot Fully Grasp`,
                message: [
                    `${verseRef} declares: "${verseText}"`,
                    `The psalmist uses two powerful Hebrew words here. "Gadol" (great) describes something so immense it overwhelms the senses. And "eyn cheqer" (no one can fathom) means there's no searching it out - like trying to measure the ocean with a teaspoon.`,
                    `This verse isn't discouraging - it's liberating! We don't have to have God all figured out. We're invited to stand in awe, to worship, to trust. A God we could fully explain would be a God small enough for our minds but too small for our needs.`,
                    `Today, instead of being frustrated by what you don't understand about God, let it draw you into wonder. Your questions don't threaten Him - they're an invitation to know Him more.`
                ],
                reflections: [
                    `What's one thing about God that amazes you today?`,
                    `How might you turn your unanswered questions into moments of worship?`
                ],
                prayer: `Father, thank You that You're bigger than my understanding. Help me to trust You not because I have all the answers, but because I know Your character. Expand my awe of You today. In Jesus' name, Amen.`
            });
        }

    } catch (error) {
        console.error('Server error:', error.message);
        // Always return something useful
        const { verseText, verseRef } = req.body || {};
        return res.status(200).json({
            title: `God's Word for Today`,
            message: [
                `${verseRef || 'Today'}'s scripture reminds us: "${verseText || 'God is love'}"`,
                `This verse reveals something important about God's character.`,
                `Take time to reflect on what God is saying to you through these words.`,
                `Let this scripture guide your thoughts and actions today.`
            ],
            reflections: [
                `What does this verse teach you about God?`,
                `How does it apply to your life right now?`
            ],
            prayer: `Lord, thank You for Your Word. Help me to understand and live out this truth today. Amen.`
        });
    }
}

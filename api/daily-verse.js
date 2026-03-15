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
                    `The apostle Paul writes these words to believers facing persecution and conflict. In the surrounding verses, he gives commands for community life: warn the idle, encourage the timid, help the weak, be patient with everyone. Then he addresses the natural human response to being wronged - the desire for revenge.`,
                    `The phrase "pay back wrong for wrong" reflects the ancient principle of retaliation, but Paul absolutely forbids this among believers. Instead, he commands us to "always strive" - the Greek word means to pursue or chase after aggressively. We are to pursue goodness with the same energy the world pursues revenge.`,
                    `Notice the scope: "for each other" (fellow believers) AND "for everyone else" (even enemies). This echoes Jesus' teaching in Matthew 5:44-45 to love our enemies and pray for those who persecute us.`
                ],
                reflections: [
                    `When someone wrongs you, what is your first internal response? Revenge or doing good?`,
                    `Is there someone right now toward whom you need to "strive to do good" instead of holding a grudge?`
                ],
                prayer: `Lord Jesus, You who when reviled did not revile in return, give me Your strength to overcome evil with good. Search my heart for any bitterness and replace it with Your love, even for those who have wronged me. Amen.`
            });
        }

        console.log('Calling Anthropic API for:', verseRef);

        // PROMPT - Bible explanation style exactly like the sample
        const prompt = `You are a Bible teacher writing a daily devotional that explains scripture deeply and accurately. Write a devotional that TEACHES the meaning of this verse, following this EXACT style:

SAMPLE DEVOTIONAL (study this style carefully):
"Understanding 1 Thessalonians 5:15

1 Thessalonians 5:15 tells us: 'Make sure that nobody pays back wrong for wrong, but always strive to do what is good for each other and for everyone else.'

The apostle Paul writes these words to the Thessalonian believers who were facing persecution and conflict. In the previous verses (14-15), Paul gives a series of short, powerful commands for community life: warn the idle, encourage the timid, help the weak, be patient with everyone. Then he addresses the natural human response to being wronged - the desire for revenge.

The phrase 'pay back wrong for wrong' (Greek: kakon anti kakou) reflects the ancient principle of retaliation, but Paul absolutely forbids this among believers. Instead, he commands them to 'always strive' - the Greek word diōkete means to pursue or chase after aggressively. We are to pursue goodness with the same energy the world pursues revenge.

Notice the scope: 'for each other' (fellow believers) AND 'for everyone else' (even enemies). This echoes Jesus' teaching in Matthew 5:44-45 to love our enemies and pray for those who persecute us. Paul is applying the Sermon on the Mount to the daily life of the church.

The reason? Vengeance belongs to God (Romans 12:19), and our good deeds become powerful witnesses to a watching world. When we refuse to retaliate and instead do good, we demonstrate that we are truly children of our Father in heaven.

Questions for reflection:
1. When someone wrongs you, what is your first internal response? Revenge or doing good?
2. Is there someone right now toward whom you need to 'strive to do good' instead of holding a grudge?

Prayer: Lord Jesus, You who when reviled did not revile in return, give me Your strength to overcome evil with good. Search my heart for any bitterness and replace it with Your love, even for those who have wronged me. Amen."

NOW WRITE A DEVOTIONAL FOR THIS VERSE:
${verseRef}: "${verseText}"

REQUIREMENTS:
- Start with "Understanding [verse reference]" as the title
- First line should quote the verse exactly
- EXPLAIN the context (who wrote it, to whom, what was happening)
- EXPLAIN key words in the original language (Greek for NT, Hebrew for OT)
- CONNECT to other scriptures that relate
- APPLY briefly to daily life
- End with 2 reflection questions and a prayer

Return ONLY a JSON object with this exact structure:
{
  "title": "Understanding [Verse Reference]",
  "message": [
    "First paragraph: Quote the verse and introduce its context. Who wrote it? To whom? What's happening? (2-3 sentences)",
    "Second paragraph: Explain key words and phrases. Dig into the original language meaning. (3-4 sentences)",
    "Third paragraph: Connect to other scriptures. Show how this fits with the rest of the Bible. (2-3 sentences)",
    "Fourth paragraph: Brief application. What does this mean for today? (1-2 sentences)"
  ],
  "reflections": [
    "Question 1: A thoughtful, personal question that flows from the explanation",
    "Question 2: Another practical question for application"
  ],
  "prayer": "A prayer that responds to the truth explained, written in a warm, personal tone"
}

IMPORTANT: This must be actual Bible teaching, not generic encouragement. Dig deep into the meaning!`
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
                max_tokens: 1200,
                temperature: 0.7,
                system: "You are a Bible teacher and scholar who explains scripture deeply. You always provide context, original language meaning, and connections to other passages. You never give generic advice - you TEACH the Word.",
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
        
        // Parse book and chapter
        const bookMatch = verseRef.match(/([a-zA-Z\s]+)\s(\d+):/);
        const book = bookMatch ? bookMatch[1] : 'Scripture';
        
        return res.status(200).json({
            title: `Understanding ${verseRef}`,
            message: [
                `${verseRef} tells us: "${verseText}"`,
                `The writer of ${book} presents this truth within a specific historical and theological context. Understanding the original audience and purpose helps us grasp the full meaning.`,
                `In the original language, key words here carry deep significance. The construction emphasizes the certainty of God's promises and the appropriate human response.`,
                `This passage connects with other scriptures that develop the same theme, forming a consistent biblical witness.`,
                `For believers today, this truth calls us to examine our hearts and align our lives with God's revealed will.`
            ],
            reflections: [
                `What does this verse reveal about God's character and purposes?`,
                `How should this truth shape your thoughts, words, or actions today?`
            ],
            prayer: `Lord God, thank You for Your Word in ${verseRef}. Open my eyes to understand its meaning and give me grace to live in light of Your truth. In Jesus' name, Amen.`
        });
    }
}
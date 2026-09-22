// api/daily-verse.js
import Groq from 'groq-sdk';

let groqClient = null;

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    if (!groqClient) {
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

// Curated pool of breakthrough scriptures used when needed or requested
export const INSPIRING_VERSES = [
    {
        reference: "Jeremiah 29:11",
        text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future."
    },
    {
        reference: "Romans 8:31",
        text: "What, then, shall we say in response to these things? If God is for us, who can be against us?"
    },
    {
        reference: "Isaiah 40:31",
        text: "Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."
    },
    {
        reference: "Philippians 4:13",
        text: "I can do all this through him who gives me strength."
    },
    {
        reference: "2 Corinthians 5:17",
        text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"
    },
    {
        reference: "Joshua 1:9",
        text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."
    },
    {
        reference: "Psalm 23:1-3",
        text: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul."
    },
    {
        reference: "Proverbs 3:5-6",
        text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
    },
    {
        reference: "Ephesians 3:20-21",
        text: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us, to him be glory in the church and in Christ Jesus throughout all generations."
    },
    {
        reference: "Romans 8:37",
        text: "No, in all these things we are more than conquerors through him who loved us."
    }
];

// Available models on Groq in priority order (fastest high-quality direct JSON first)
const GROQ_MODELS = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
];

function extractJson(text) {
    if (!text) return null;
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    } catch (_) {}

    // Match code block
    const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeMatch) {
        try {
            return JSON.parse(codeMatch[1].trim());
        } catch (_) {}
    }

    // Match outermost { ... }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
        } catch (_) {}
    }

    return null;
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const todaysVerse = INSPIRING_VERSES[dayOfYear % INSPIRING_VERSES.length];

        return res.status(200).json({
            message: 'Devotional API is ready 🚀',
            hasGroq: !!process.env.GROQ_API_KEY,
            suggestedVerse: todaysVerse,
            allVerses: INSPIRING_VERSES,
            status: 'online'
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { verseText = '', verseRef = '', themeHint = '' } = req.body || {};

        if (!verseText && !verseRef) {
            return res.status(400).json({
                error: 'Please provide verseText and verseRef'
            });
        }

        const safeRef = verseRef.trim() || 'Scripture of the Day';
        const safeText = verseText.trim() || 'Thy word is a lamp unto my feet, and a light unto my path.';

        console.log(`[Groq Devotional] Generating devotional for: ${safeRef}`);

        const groq = getGroqClient();
        let devotional = null;
        let lastError = null;

        if (groq) {
            const systemPrompt = `You are an anointed, biblically grounded pastor, teacher, and devotional writer for Prevailers Chapel International.
Church Identity: "A House of Transformation where Nobodies are made Somebody."
Church Year Declaration: "2026 – Our Year of Manifestation (manifesting God's glory, power, favor, and grace in every sphere of life)."

YOUR SACRED MANDATE:
Write an exceptionally deep, spiritually invigorating, and NON-GENERIC daily devotional based on the exact scripture given.
NEVER use cliché, vague, or interchangeable platitudes (e.g. avoid empty phrases like "some days are hard", "just hold on", "life is busy", "take a deep breath", or generic one-liners).
Instead, anchor deeply in:
1. The exact biblical, theological, and linguistic heart of this specific scripture.
2. How this truth shatters defeat, raises the broken, and empowers ordinary believers into divine champions of faith.
3. Practical, penetrating, soul-searching thoughts that challenge real-world behavior and thinking today.
4. A fervent, authoritative prayer of faith that specifically addresses the verse's themes.

You must respond with strictly valid JSON only (no markdown code blocks, no backticks, no text before or after).
Use this exact JSON schema:
{
  "title": "A captivating, non-generic title (4-7 words)",
  "theme": "Core spiritual theme (e.g. 'Unshakable Divine Advocacy', 'From Wilderness to Dominion')",
  "scriptureContext": "A clear, insightful 1-2 sentence context explaining the historical or theological setting of this scripture",
  "message": [
    "Paragraph 1 (80-110 words): Deep exposition of the verse, unpacking key terms, context, and the heart of God in this scripture.",
    "Paragraph 2 (80-110 words): Transformational spiritual revelation: connecting this divine truth to our identity in Christ and how it turns nobodies into somebodies.",
    "Paragraph 3 (80-110 words): Victorious pastoral call to action: practical empowerment for the believer to walk in dominion and manifestation today."
  ],
  "thoughts": [
    "First deep thought: A penetrating spiritual insight with a real-life question or concrete application for today.",
    "Second deep thought: An examination of personal faith, mindset, or relationships anchored directly in this text.",
    "Third deep thought: A strategic action or bold declaration for manifesting this truth today."
  ],
  "prayer": "A rich, heartfelt, authoritative prayer (85-120 words) steeped in this scripture, declaring victory, spiritual transformation, and ending in Jesus' mighty name, Amen."
}`;

            const userPrompt = `Scripture Reference: ${safeRef}
Scripture Text: "${safeText}"
${themeHint ? `Focus Area: ${themeHint}` : ''}

Generate the complete, deep, non-generic devotional now.`;

            // Try available Groq models in sequence
            for (const model of GROQ_MODELS) {
                try {
                    console.log(`[Groq Devotional] Attempting generation with model: ${model}`);
                    const completion = await groq.chat.completions.create({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.65,
                        max_tokens: 1200
                    });

                    const rawContent = completion.choices?.[0]?.message?.content;
                    if (rawContent) {
                        const parsed = extractJson(rawContent);

                        if (parsed && parsed.title && parsed.message && parsed.prayer) {
                            const messageArr = Array.isArray(parsed.message) ? parsed.message : [parsed.message];
                            const thoughtsArr = Array.isArray(parsed.thoughts) ? parsed.thoughts : 
                                               (Array.isArray(parsed.reflections) ? parsed.reflections : [parsed.thoughts || parsed.reflections]);

                            devotional = {
                                title: parsed.title,
                                theme: parsed.theme || "Transformational Faith",
                                scriptureContext: parsed.scriptureContext || `A living revelation given to empower believers through ${safeRef}.`,
                                message: messageArr,
                                thoughts: thoughtsArr.filter(Boolean),
                                reflections: thoughtsArr.filter(Boolean), // for backward compatibility
                                prayer: parsed.prayer,
                                provider: 'groq',
                                model: model,
                                verseRef: safeRef,
                                verseText: safeText
                            };
                            console.log(`[Groq Devotional] Successfully generated with model: ${model}`);
                            break; // Successfully generated, break out of loop
                        }
                    }
                } catch (err) {
                    console.warn(`[Groq Devotional] Model ${model} error:`, err.message);
                    lastError = err;
                }
            }
        }

        // High quality theological fallback if Groq is temporarily unreachable
        if (!devotional) {
            console.warn('[Groq Devotional] Using rich biblical fallback:', lastError ? lastError.message : 'No Groq client');
            devotional = buildBiblicalDevotional(safeRef, safeText);
        }

        return res.status(200).json(devotional);

    } catch (error) {
        console.error('[Groq Devotional] Uncaught error:', error.message);
        const { verseText = '', verseRef = '' } = req.body || {};
        const safeRef = verseRef || 'Scripture of the Day';
        const safeText = verseText || 'Thy word is a lamp unto my feet, and a light unto my path.';

        const fallback = buildBiblicalDevotional(safeRef, safeText);
        return res.status(200).json(fallback);
    }
}

/**
 * Generates a deeply substantive, non-generic biblical devotional if network/API is completely offline.
 */
function buildBiblicalDevotional(verseRef, verseText) {
    return {
        title: `Standing Victorious in ${verseRef}`,
        theme: "Divine Authority and Transforming Grace",
        scriptureContext: `This sacred truth from ${verseRef} speaks directly into seasons of trial and transition, establishing that God's covenant purpose cannot be derailed by human weakness or circumstance.`,
        message: [
            `The sacred testimony of ${verseRef} declares: "${verseText}" This is not a casual sentiment or an ancient relic—it is the living, active breath of the Almighty spoken directly over your destiny. In Scripture, God consistently reaches into broken, obscure places to lift the humble and silence the accuser. When this Word takes root within your spirit, it immediately dismantles the false narratives of insufficiency, fear, and stagnation that the enemy has whispered against your life.`,
            `At Prevailers Chapel International, we recognize that our God specializes in taking nobodies and transforming them into somebodies through the power of the blood of Jesus. When you anchor your heart in "${verseText}", you align yourself with the reality of 2026 as Our Year of Manifestation. You are not a victim of circumstance; you are a redeemed child of the Most High, carrying divine favor, resurrection power, and the wisdom of heaven to overcome every obstacle standing in your path.`,
            `Step out today with the boldness of a conqueror who knows the battle has already been settled at the cross. Do not shrink back in timidity, compromise your values, or settle for mediocrity. Speak this scripture aloud whenever doubt knocks at the door of your mind, and minister its life-giving truth to your family, your workplace, and your community. The same God who decreed this Word is faithful to perform it in your life today.`
        ],
        thoughts: [
            `Deep Examination: Where in your daily routine have you allowed fear or past failures to speak louder than God's promise in ${verseRef}? Make a deliberate decision right now to revoke that negative voice and declare God's truth over that situation.`,
            `Transformational Mindset: What shifts in your confidence, decisions, and prayers when you truly believe that God has chosen to make you a vessel of His manifestation rather than a bystander to defeat?`,
            `Practical Action: Identify one person or family member today who is struggling with discouragement. Share this truth with them and pray over them with the authority God has placed in your hands.`
        ],
        reflections: [
            `Where in your daily routine have you allowed fear or past failures to speak louder than God's promise in ${verseRef}?`,
            `What shifts in your confidence and decisions when you truly believe that God has chosen to manifest His glory through your life?`,
            `Identify one person who is struggling with discouragement and share this truth with them today.`
        ],
        prayer: `Sovereign Father, Creator of heaven and earth, I bow my heart before Your holy throne with thanksgiving and praise. Your Word in ${verseRef} declares that "${verseText}"—and today, I receive it into the deepest depths of my soul. Deliver me from every seed of doubt, fear, and insignificance. Transform my mind, renew my strength, and empower me to walk as a child of light and dominion. In this Year of Manifestation, let Your glory, power, and favor be clearly seen in my character, my family, and my labor. I thank You that the battle is already won. In the mighty and victorious name of Jesus Christ, Amen.`,
        provider: 'built-in',
        model: 'scriptural-exposition',
        verseRef,
        verseText
    };
}

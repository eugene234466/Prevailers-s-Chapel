// api/daily-verse.js

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            message: 'Dynamic Devotional API is ready 🚀',
            instructions: 'Send POST with verseText and verseRef',
            status: 'online'
        });
    }

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

        console.log('Generating devotional for:', verseRef);

        const devotional = generateDevotional(verseRef, verseText);

        return res.status(200).json(devotional);

    } catch (error) {
        console.error('Error:', error.message);

        const { verseText, verseRef } = req.body || {};

        return res.status(200).json({
            title: `A Word for Today`,
            message: [
                `Sometimes you just need something simple to hold onto.`,
                `${verseRef || 'Scripture'} reminds us: "${verseText || 'God is with you'}"`,
                `That's enough. You're not alone today.`
            ],
            reflections: [
                `What do you need from God right now?`,
                `Who around you might need encouragement today?`
            ],
            prayer: `God, be with me. That's all. Amen.`
        });
    }
}

/* =========================
   MAIN GENERATOR
========================= */

function generateDevotional(verseRef, verseText) {
    const text = verseText.toLowerCase();
    const ref = verseRef.toLowerCase();

    // 🔥 SPECIAL CASE (kept from your original)
    if (
        ref.includes('ephesians 1:13') ||
        ref.includes('ephesians 1:14') ||
        text.includes('sealed') ||
        text.includes('inheritance') ||
        text.includes('guarantee')
    ) {
        return {
            title: "For When You Doubt You Belong",
            message: [
                `Ever feel like you don't quite fit?`,
                `${verseRef} says: "${verseText}"`,
                `You've been sealed. Marked as His. Not because you earned it—but because you trusted Him.`,
                `You don't have to prove anything today. Just rest in what is already true.`
            ],
            reflections: [
                `What makes you feel like you don't belong?`,
                `What changes if you believe you are already chosen?`
            ],
            prayer: `God, remind me that I am Yours. Help me rest in that today. Amen.`
        };
    }

    // 🔥 DYNAMIC FLOW
    return generateDynamicDevotional(verseRef, verseText);
}

/* =========================
   THEME DETECTION
========================= */

function detectThemes(text) {
    const themes = {
        fear: ['fear', 'afraid', 'anxious', 'worry'],
        love: ['love', 'loved'],
        waiting: ['wait', 'patient', 'patience'],
        strength: ['strength', 'strong', 'weak'],
        hope: ['hope'],
        peace: ['peace', 'calm'],
        forgiveness: ['forgive', 'forgiveness'],
        grace: ['grace', 'mercy'],
        service: ['serve', 'help', 'give']
    };

    let scores = {};

    for (let theme in themes) {
        scores[theme] = 0;

        themes[theme].forEach(word => {
            if (text.includes(word)) scores[theme]++;
        });
    }

    return Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([theme]) => theme);
}

/* =========================
   CONTENT LIBRARY
========================= */

const openings = {
    fear: [
        "Your mind won't slow down, will it?",
        "The anxiety keeps creeping in.",
        "You're carrying too much right now."
    ],
    waiting: [
        "You're tired of waiting.",
        "Nothing seems to be moving.",
        "You're stuck in the in-between."
    ],
    love: [
        "Love isn't always easy.",
        "Some people are hard to love.",
        "Your heart feels stretched."
    ],
    strength: [
        "You're running on empty.",
        "You've got nothing left.",
        "You're tired of being strong."
    ],
    hope: [
        "Hope feels far away.",
        "It's been a long road.",
        "You're trying not to give up."
    ],
    peace: [
        "Everything feels loud.",
        "Life is chaotic right now.",
        "Your mind is all over the place."
    ]
};

const insights = {
    fear: [
        "You don't have to carry everything—God is with you in this.",
        "Fear gets loud, but it doesn't get the final say."
    ],
    waiting: [
        "Waiting isn't wasted—something is being formed in you.",
        "Growth often happens in silence."
    ],
    love: [
        "Love isn't about perfection—it's about showing up.",
        "You reflect God most in how you love others."
    ],
    strength: [
        "You don't need strength—you need surrender.",
        "God meets you best in your weakness."
    ],
    hope: [
        "Hope doesn't mean everything is fixed—it means you're not alone.",
        "Even now, something good can still grow."
    ],
    peace: [
        "Peace isn't the absence of noise—it's God's presence in it.",
        "You can be still even when life isn't."
    ]
};

const actions = {
    fear: [
        "Give one worry to God right now.",
        "Take a deep breath and release what you can't control."
    ],
    waiting: [
        "Notice one small thing to be grateful for today.",
        "Focus on today—not the whole future."
    ],
    love: [
        "Do one small act of kindness.",
        "Reach out to someone today."
    ],
    strength: [
        "Admit you're tired—then rest.",
        "Let today be lighter than yesterday."
    ],
    hope: [
        "Hold on for just today.",
        "Take one small step forward."
    ],
    peace: [
        "Find one quiet minute today.",
        "Pause. Breathe. Reset."
    ]
};

/* =========================
   GENERATOR ENGINE
========================= */

function generateDynamicDevotional(verseRef, verseText) {
    const text = verseText.toLowerCase();
    const themes = detectThemes(text);

    const mainTheme = themes[0] || 'hope';
    const secondaryTheme = themes[1];

    return {
        title: pickRandom([
            "For This Moment",
            "Just for Today",
            "A Word for You",
            "Right Where You Are"
        ]),

        message: [
            pickRandom(openings[mainTheme] || ["Some days are heavy."]),
            `${verseRef} says: "${verseText}"`,
            pickRandom(insights[mainTheme]),
            secondaryTheme ? pickRandom(insights[secondaryTheme] || []) : null,
            "You don't have to figure everything out today. Just take the next step."
        ].filter(Boolean),

        reflections: [
            "What is weighing on you most right now?",
            "What would trusting God with that look like today?"
        ],

        prayer: `God, meet me where I am. Help me take one step with You today. Amen.`
    };
}

/* =========================
   UTIL
========================= */

function pickRandom(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
}

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
        const { verseText = '', verseRef = '' } = req.body || {};

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

        const { verseText = '', verseRef = '' } = req.body || {};

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

    // 🔥 SPECIAL CASE (kept)
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
                `You've been sealed. Marked as His.`,
                `You don't have to prove anything today. Just rest in that truth.`
            ],
            reflections: [
                `What makes you feel like you don't belong?`,
                `What changes if you believe you are already His?`
            ],
            prayer: `God, remind me that I am Yours. Help me rest in that today. Amen.`
        };
    }

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
        service: ['serve', 'help', 'give'],

        // 🔥 GOD-CENTERED THEMES
        sovereignty: ['almighty', 'king', 'lord', 'reign', 'throne'],
        eternity: ['forever', 'eternal', 'beginning', 'end', 'alpha', 'omega'],
        presence: ['with you', 'always', 'never leave', 'who is', 'who was', 'to come'],
        power: ['power', 'mighty', 'authority'],
        holiness: ['holy', 'righteous'],
        faithfulness: ['faithful', 'promise', 'covenant']
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
        "The anxiety keeps creeping in."
    ],
    waiting: [
        "You're tired of waiting.",
        "Nothing seems to be changing."
    ],
    love: [
        "Love isn't always easy.",
        "Your heart feels stretched."
    ],
    strength: [
        "You're running on empty.",
        "You've got nothing left."
    ],
    hope: [
        "Hope feels far away.",
        "You're trying to hold on."
    ],
    peace: [
        "Everything feels loud right now.",
        "Life is chaotic."
    ],
    sovereignty: [
        "God is bigger than everything you're facing.",
        "Nothing is outside His control."
    ],
    eternity: [
        "Before anything existed—He was.",
        "God isn't bound by time like you are."
    ],
    presence: [
        "You're not alone in this.",
        "God is right here with you."
    ]
};

const insights = {
    fear: [
        "Fear gets loud, but it doesn't get the final say."
    ],
    waiting: [
        "Waiting seasons are not wasted."
    ],
    love: [
        "Love is about showing up, not perfection."
    ],
    strength: [
        "God meets you best in your weakness."
    ],
    hope: [
        "Hope means you're not alone."
    ],
    peace: [
        "Peace exists even in chaos."
    ],
    sovereignty: [
        "If He is Almighty, your situation is not."
    ],
    eternity: [
        "The One who holds the beginning holds your future."
    ],
    presence: [
        "Even when you don't feel it, He is there."
    ]
};

/* =========================
   GENERATOR
========================= */

function generateDynamicDevotional(verseRef, verseText) {
    const text = verseText.toLowerCase();
    let themes = detectThemes(text);

    // 🚨 HARD FALLBACK FIX (never empty)
    if (themes.length === 0) {
        themes = ['eternity', 'sovereignty', 'hope'];
    }

    const mainTheme = themes[0];
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
            pickRandom(insights[mainTheme] || ["God is present with you."]),
            secondaryTheme ? pickRandom(insights[secondaryTheme] || []) : null,
            "Take this with you today. You don't have to carry everything at once."
        ].filter(Boolean),

        reflections: [
            "What stands out to you in this verse?",
            "Where do you need this truth today?"
        ],

        prayer: `God, help me hold onto Your truth today. Amen.`
    };
}

/* =========================
   UTIL
========================= */

function pickRandom(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
}

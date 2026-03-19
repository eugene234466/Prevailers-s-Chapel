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

        console.log('Generating devotional for:', verseRef);
        
        // Generate devotional dynamically based on the verse
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

function generateDevotional(verseRef, verseText) {
    // Common life situations people face
    const situations = [
        { 
            keywords: ['fear', 'afraid', 'anxious', 'terror', 'dread', 'scared', 'worry'], 
            theme: 'fear',
            title: "For When Fear Feels Loud",
            opening: "That tightness in your chest? The thoughts that spiral at 3am? Fear has a way of making everything feel bigger than it is.",
            application: "Today, when fear whispers, talk back. Not with complicated prayers. Just say, 'I hear you, but I'm choosing to trust anyway.' One moment at a time."
        },
        { 
            keywords: ['love', 'loved', 'beloved', 'charity', 'kind'], 
            theme: 'love',
            title: "When Love Is Complicated",
            opening: "Loving people is messy. They disappoint you. They don't love you back the way you hoped. Some days you wonder if it's worth it.",
            application: "Today, try loving someone without expecting anything back. Not because they deserve it, but because of who you're becoming."
        },
        { 
            keywords: ['wait', 'patient', 'patience', 'waiting', 'delay', 'slow'], 
            theme: 'waiting',
            title: "When You're Tired of Waiting",
            opening: "Waiting is the worst. For a call back. For healing. For something to finally change. Every day feels the same.",
            application: "While you wait, don't just hold your breath. Notice one small thing today you'd miss if everything changed too fast."
        },
        { 
            keywords: ['strong', 'strength', 'mighty', 'power', 'powerful', 'fortress', 'rock'], 
            theme: 'strength',
            title: "When You've Got Nothing Left",
            opening: "You're running on empty. You've given everything you have and there's nothing left in the tank.",
            application: "Stop trying to muster up strength you don't have. Just admit it: 'I've got nothing.' Let that be your prayer."
        },
        { 
            keywords: ['hope', 'hopeful', 'hope', 'future', 'expect'], 
            theme: 'hope',
            title: "When Hope Feels Far Away",
            opening: "You've been disappointed too many times. Prayers went unanswered. Life didn't turn out the way you expected.",
            application: "Hope today isn't about fixing everything. It's just about getting through this one day and trusting you're not alone."
        },
        { 
            keywords: ['peace', 'peaceful', 'shalom', 'rest', 'quiet', 'calm'], 
            theme: 'peace',
            title: "When Life Won't Slow Down",
            opening: "The noise never stops. Your phone buzzes, your mind races, there's always more to do. Peace feels like a luxury you can't afford.",
            application: "Find one minute today. Just one. Breathe slowly and imagine handing the chaos to God. See if that minute changes the next hour."
        },
        { 
            keywords: ['forgive', 'forgiven', 'forgiveness', 'pardon', 'mercy'], 
            theme: 'forgiveness',
            title: "When Letting Go Hurts",
            opening: "Someone hurt you. Every time you think about them, the wound opens again. Forgiving feels like saying it didn't matter.",
            application: "Forgiveness today might just be: 'I'm not going to rehearse this again.' That's a start. That's enough."
        },
        { 
            keywords: ['joy', 'rejoice', 'glad', 'happy', 'delight'], 
            theme: 'joy',
            title: "When You're Not Feeling It",
            opening: "Joy feels like something other people have. You're just trying to get through. 'Rejoicing' feels out of reach.",
            application: "Today, don't try to manufacture joy. Just notice one small good thing. The coffee. A text from a friend. Sunlight. Let that be enough."
        },
        { 
            keywords: ['grace', 'mercy', 'favor', 'compassion', 'pity'], 
            theme: 'grace',
            title: "For When You've Messed Up",
            opening: "You did it again. The thing you promised you wouldn't. Now shame is whispering that you're a failure.",
            application: "Grace isn't for people who have it together. Receive it like a gift you don't deserve. Say 'thank you' and move forward."
        },
        { 
            keywords: ['trust', 'trusting', 'believe', 'faith', 'confidence'], 
            theme: 'trust',
            title: "When You Don't Understand",
            opening: "Life doesn't make sense right now. You can't see the path forward. Every step feels uncertain.",
            application: "Trust isn't about having all the answers. It's about taking the next step even when you can't see the whole staircase."
        },
        { 
            keywords: ['comfort', 'comforted', 'comfort', 'console', 'carry'], 
            theme: 'comfort',
            title: "When You Need to Know You're Not Alone",
            opening: "Some days are just heavy. You can't explain why. You just feel it in your bones.",
            application: "You don't need to say the right words today. Just sit with the knowledge that you're not alone. Breathe. That's enough."
        },
        { 
            keywords: ['guide', 'direct', 'lead', 'path', 'way', 'show'], 
            theme: 'guidance',
            title: "When You Don't Know Which Way to Go",
            opening: "Every direction feels uncertain. You're afraid of making the wrong choice. So you stay stuck.",
            application: "You don't need to see the whole road. Just ask for help with the next step. That's all. Just the next one."
        }
    ];
    
    // Find which theme matches the verse
    let matchedTheme = null;
    for (const s of situations) {
        if (s.keywords.some(keyword => verseText.toLowerCase().includes(keyword))) {
            matchedTheme = s;
            break;
        }
    }
    
    // If no theme matches, use a general one
    if (!matchedTheme) {
        return {
            title: `A Word from ${verseRef}`,
            message: [
                `You know those moments when you need something solid to hold onto? When the day feels heavy and you're not sure how you'll get through?`,
                `${verseRef} says: "${verseText}"`,
                `Write this verse down. Put it where you'll see it. When hard moments come today, read it again. Let it be the thing you hold onto. You don't have to figure it all out. You just have to hold on.`
            ],
            reflections: [
                `What's one word or phrase in this verse that stands out to you?`,
                `What would it look like to live this out today?`
            ],
            prayer: `God, meet me where I am today. Help me hold onto this. Amen.`
        };
    }
    
    // Return the matched theme devotional
    return {
        title: matchedTheme.title,
        message: [
            matchedTheme.opening,
            `${verseRef} says: "${verseText}"`,
            matchedTheme.application
        ],
        reflections: [
            `What's one thing in your life right now that connects with this?`,
            `What's one small step you can take today?`
        ],
        prayer: matchedTheme.theme === 'fear' ? `God, my mind won't shut up. Take these worries. I can't carry them anymore. Help me rest. Amen.` :
                matchedTheme.theme === 'love' ? `God, some people are hard to love. Change my heart toward them, even if they don't change. Amen.` :
                matchedTheme.theme === 'waiting' ? `God, waiting is hard. I want answers now. Help me trust You in the in-between. Amen.` :
                matchedTheme.theme === 'strength' ? `God, I've got nothing. I'm done pretending. Be my strength today. Amen.` :
                matchedTheme.theme === 'hope' ? `God, I've been hurt. I've been disappointed. Help me hope again, even if it's just a little. Amen.` :
                matchedTheme.theme === 'peace' ? `God, my life is loud. Help me find one moment of quiet with You today. Amen.` :
                matchedTheme.theme === 'forgiveness' ? `God, this person hurt me. I don't feel like forgiving them. Help me take one small step toward freedom today. Amen.` :
                matchedTheme.theme === 'joy' ? `God, I'm not feeling joyful today. But thank You for one small good thing. Help me notice more. Amen.` :
                matchedTheme.theme === 'grace' ? `God, I messed up again. But I'm done hiding. Thank You that Your grace is bigger than my failure. Amen.` :
                matchedTheme.theme === 'trust' ? `God, I don't understand what's happening. Help me trust You with what I can't see. Amen.` :
                matchedTheme.theme === 'comfort' ? `God, this day is heavy. Just sit with me. That's all I need. Amen.` :
                matchedTheme.theme === 'guidance' ? `God, I don't know which way to go. Help me with the next step. Just the next one. Amen.` :
                `God, speak to me through this today. Amen.`
    };
}

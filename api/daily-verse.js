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

        // I AM THE DEVOTIONAL GENERATOR! No API key needed.
        console.log('Generating devotional for:', verseRef);
        
        // Generate devotional based on the verse content
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

// I generate devotionals based on what the verse is actually about
function generateDevotional(verseRef, verseText) {
    const text = verseText.toLowerCase();
    const ref = verseRef.toLowerCase();
    
    // Check what the verse is about and write accordingly
    
    if (text.includes('fear') || text.includes('afraid') || text.includes('anxious')) {
        return {
            title: "For When You Can't Sleep",
            message: [
                `It's 2am and your mind won't shut off. The same worries circling over and over. You've replayed the conversation, calculated the worst-case scenario, imagined everything falling apart.`,
                `Right into that darkness, ${verseRef} speaks: "${verseText}" These words weren't written for people who have it all together. They were written for people exactly where you are right now.`,
                `Here's what helps me on nights like this: I take one slow breath and whisper, "I'm giving You this one, God." Then the next worry, "And this one." By the time I'm done, I've handed over what I was never meant to carry alone. Try it tonight.`
            ],
            reflections: [
                `What's the one worry you keep circling back to?`,
                `What would it feel like to hand that to God right now?`
            ],
            prayer: `God, my mind won't shut up. Take these worries. I can't carry them anymore. Help me rest. Amen.`
        };
    }
    
    if (text.includes('love') || text.includes('loved')) {
        return {
            title: "When Love Is Complicated",
            message: [
                `Some people are easy to love. Others? Not so much. The relative who pushes your buttons. The coworker who takes credit for your work. The friend who let you down.`,
                `${verseRef} doesn't pretend loving is easy: "${verseText}" It's honest about how hard it can be, but it also shows us a different way.`,
                `Today, try this: pick one person who's difficult to love and do one small thing for them. Not because they deserve it, but because of who you're becoming. A coffee, a kind text, a prayer. See what happens in your own heart.`
            ],
            reflections: [
                `Who's the hardest person for you to love right now?`,
                `What's one tiny thing you could do for them today?`
            ],
            prayer: `God, some people are hard to love. Change my heart toward them, even if they don't change. Amen.`
        };
    }
    
    if (text.includes('wait') || text.includes('patient') || text.includes('patience')) {
        return {
            title: "When You're Tired of Waiting",
            message: [
                `Waiting is the worst. For a call back about the job. For a relationship to heal. For a prayer to be answered. For the test results. For something to finally change.`,
                `${verseRef} gets it: "${verseText}" The people who wrote this knew what it felt like to wait longer than they wanted.`,
                `While you wait, don't just hold your breath. Notice what's happening right now. Maybe there's something in this waiting season you'd miss if everything changed too fast. Today, find one small thing to be grateful for in the middle of the wait.`
            ],
            reflections: [
                `What are you waiting for right now?`,
                `What might God be doing in you while you wait?`
            ],
            prayer: `God, waiting is hard. I want answers now. Help me trust You in the in-between. Amen.`
        };
    }
    
    if (text.includes('strong') || text.includes('strength') || text.includes('mighty')) {
        return {
            title: "When You Have Nothing Left",
            message: [
                `You know that feeling when you're running on empty? When you've given everything you have and there's nothing left in the tank?`,
                `${verseRef} was written for that exact moment: "${verseText}" It's not saying you have to be strong. It's saying where you're weak, God isn't.`,
                `Today, stop trying to muster up strength you don't have. Just admit it: "I've got nothing." Let that be your prayer. You might find that's exactly when something shifts.`
            ],
            reflections: [
                `Where are you trying to be strong when you're actually running on empty?`,
                `What would it look like to admit that to God today?`
            ],
            prayer: `God, I've got nothing. I'm done pretending. Be my strength today. Amen.`
        };
    }
    
    if (text.includes('hope') || text.includes('hope')) {
        return {
            title: "When Hope Feels Lost",
            message: [
                `Sometimes hope feels like a thing other people have. You've been disappointed too many times. Prayers went unanswered. People let you down. Life didn't turn out the way you expected.`,
                `${verseRef} doesn't offer cheap optimism: "${verseText}" It's something deeper. Hope that doesn't depend on everything working out.`,
                `Today, hope isn't about fixing everything. It's just about getting through this one day and trusting you're not alone in it. That's enough. One day.`
            ],
            reflections: [
                `What's one area where you've stopped hoping?`,
                `What would it look like to hope just for today?`
            ],
            prayer: `God, I've been hurt. I've been disappointed. Help me hope again, even if it's just a little. Amen.`
        };
    }
    
    if (text.includes('peace') || text.includes('peace')) {
        return {
            title: "When Life Is Chaotic",
            message: [
                `The house is a mess. The kids are fighting. Your phone won't stop buzzing. Your mind is running in a million directions. Peace feels like a distant memory.`,
                `${verseRef} speaks into the chaos: "${verseText}" Not peace that depends on everything being calm around you, but peace that exists in the middle of the storm.`,
                `Today, try this: find one minute. Just one. Close your eyes, breathe slowly, and imagine handing the chaos to God. You can pick it back up if you want, but for one minute, let it go. See if that minute changes the next hour.`
            ],
            reflections: [
                `What's the loudest source of chaos in your life right now?`,
                `Where could you find one minute of quiet today?`
            ],
            prayer: `God, my life is loud. Help me find one moment of peace with You today. Amen.`
        };
    }
    
    if (text.includes('forgive') || text.includes('forgiveness')) {
        return {
            title: "When Letting Go Hurts",
            message: [
                `Someone hurt you. Really hurt you. And now every time you think about them, the wound opens again. Forgiving feels like letting them off the hook, like what they did doesn't matter.`,
                `${verseRef} understands how hard this is: "${verseText}" Forgiveness isn't saying it didn't hurt. It's saying you won't let the hurt own you anymore.`,
                `Today, forgiveness might not be a feeling. It might just be a choice: "I'm not going to rehearse this again today." That's a start. That's enough for now.`
            ],
            reflections: [
                `Who do you need to forgive - even if you're not ready yet?`,
                `What would it look like to take one small step toward letting go today?`
            ],
            prayer: `God, this person hurt me. I don't feel like forgiving them. Help me take one small step toward freedom today. Amen.`
        };
    }
    
    if (text.includes('joy') || text.includes('rejoice') || text.includes('glad')) {
        return {
            title: "When You're Not Feeling It",
            message: [
                `Maybe you woke up today and joy feels like something other people have. You're just trying to get through. The idea of "rejoicing" feels out of reach.`,
                `${verseRef} says: "${verseText}" But here's the thing - joy in the Bible isn't about feelings. It's deeper. It's knowing that even on hard days, God is still God and you are still loved.`,
                `Today, don't try to manufacture joy you don't feel. Just notice one small good thing. The way the coffee tastes. A text from a friend. Sunlight through the window. Let that be enough.`
            ],
            reflections: [
                `What's one small good thing you can notice today?`,
                `Who can you share that with?`
            ],
            prayer: `God, I'm not feeling joyful today. But thank You for one small good thing. Help me notice more. Amen.`
        };
    }
    
    if (text.includes('grace') || text.includes('mercy')) {
        return {
            title: "For When You've Messed Up",
            message: [
                `You did it again. The thing you promised you wouldn't. The sharp word, the bad choice, the moment of weakness. Now shame is whispering that you're a failure.`,
                `${verseRef} has something to say about that: "${verseText}" Grace isn't for people who have it together. It's for people exactly where you are.`,
                `Today, instead of beating yourself up, try this: receive grace like you'd receive a gift you don't deserve. Say "thank you" and move forward. Not because you're perfect, but because you're forgiven.`
            ],
            reflections: [
                `What's the thing you're still beating yourself up about?`,
                `What would it feel like to accept grace for that today?`
            ],
            prayer: `God, I messed up again. But I'm done hiding. Thank You that Your grace is bigger than my failure. Amen.`
        };
    }
    
    // NEW THEME: For Galatians 6:10 and verses about doing good, helping others, serving
    if (text.includes('good') || text.includes('do good') || text.includes('help') || 
        text.includes('serve') || text.includes('serving') || text.includes('others') ||
        text.includes('everyone') || text.includes('especially') || text.includes('family of believers')) {
        return {
            title: "When You're Too Tired to Help Anyone Else",
            message: [
                `You've given and given. Made meals, sent texts, shown up, listened, prayed. And now you're running on fumes. But there's always one more person who needs something.`,
                `${verseRef} catches you right here: "${verseText}" It's not guilt-tripping you. It's reminding you that helping others is part of who you've become. But here's the thing - you can't pour from an empty cup.`,
                `Today, doing good might look different. Maybe it's just one small thing. A two-minute text. A quick prayer. And then giving yourself permission to rest. You're not the savior - you're just someone pointing to Him. So do what you can, then let Him handle the rest.`
            ],
            reflections: [
                `Who's one person you could encourage today without exhausting yourself?`,
                `What would it look like to do good without burning out?`
            ],
            prayer: `God, I want to help people but I'm tired. Show me one small way to do good today, and give me the wisdom to know when to rest. Amen.`
        };
    }
    
    // Default - for any other verse
    return {
        title: `Just for Today`,
        message: [
            `You know those moments when you need something solid to hold onto? When the day feels heavy and you're not sure how you're going to get through?`,
            `${verseRef} is for that moment: "${verseText}" These words have been carried by people for thousands of years. People just like you, on days just like today.`,
            `So here's what I want you to do: write this verse down. Put it on your phone, your mirror, your dashboard. When the hard moments come today, read it again. Let it be the thing you hold onto. You don't have to figure it all out. You just have to hold on.`
        ],
        reflections: [
            `What word or phrase in this verse stands out to you most?`,
            `Where in your life today do you need to hear this?`
        ],
        prayer: `God, I need this today. Help me hold onto it when things get hard. Amen.`
    };
}

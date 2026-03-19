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
        
        // I determine the theme and generate the devotional
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

// I determine the theme based on the verse content
function generateDevotional(verseRef, verseText) {
    const text = verseText.toLowerCase();
    
    // First, I figure out what this verse is REALLY about
    const theme = determineTheme(text);
    
    // Then I write a devotional specifically for that theme
    return writeDevotional(theme, verseRef, verseText);
}

// I analyze the verse to find its true theme
function determineTheme(text) {
    // Parenting & Family
    if (text.includes('child') || text.includes('children') || text.includes('son') || 
        text.includes('daughter') || text.includes('father') || text.includes('mother') ||
        text.includes('parent') || text.includes('train up')) {
        return 'parenting';
    }
    
    // Work & Career
    if (text.includes('work') || text.includes('labor') || text.includes('business') ||
        text.includes('hands') || text.includes('diligent') || text.includes('slothful') ||
        text.includes('vocation')) {
        return 'work';
    }
    
    // Money & Finances
    if (text.includes('money') || text.includes('wealth') || text.includes('rich') ||
        text.includes('poor') || text.includes('poverty') || text.includes('gold') ||
        text.includes('silver') || text.includes('treasure') || text.includes('possessions')) {
        return 'money';
    }
    
    // Wisdom & Decision Making
    if (text.includes('wise') || text.includes('wisdom') || text.includes('understanding') ||
        text.includes('knowledge') || text.includes('discernment') || text.includes('folly') ||
        text.includes('fool') || text.includes('prudent')) {
        return 'wisdom';
    }
    
    // Speech & Words
    if (text.includes('tongue') || text.includes('mouth') || text.includes('words') ||
        text.includes('speak') || text.includes('talk') || text.includes('gossip') ||
        text.includes('slander') || text.includes('lie') || text.includes('truth')) {
        return 'speech';
    }
    
    // Relationships
    if (text.includes('friend') || text.includes('neighbor') || text.includes('brother') ||
        text.includes('sister') || text.includes('marriage') || text.includes('husband') ||
        text.includes('wife') || text.includes('spouse') || text.includes('companion')) {
        return 'relationships';
    }
    
    // Anger & Conflict
    if (text.includes('anger') || text.includes('angry') || text.includes('wrath') ||
        text.includes('fury') || text.includes('quarrel') || text.includes('strife') ||
        text.includes('contention') || text.includes('fight')) {
        return 'anger';
    }
    
    // Fear & Anxiety
    if (text.includes('fear') || text.includes('afraid') || text.includes('anxious') ||
        text.includes('worry') || text.includes('dread') || text.includes('terror') ||
        text.includes('alarmed')) {
        return 'fear';
    }
    
    // Hope & Encouragement
    if (text.includes('hope') || text.includes('encourage') || text.includes('strength') ||
        text.includes('courage') || text.includes('bold') || text.includes('confidence')) {
        return 'hope';
    }
    
    // Forgiveness & Grace
    if (text.includes('forgive') || text.includes('forgiveness') || text.includes('grace') ||
        text.includes('mercy') || text.includes('pardon') || text.includes('compassion')) {
        return 'forgiveness';
    }
    
    // Love
    if (text.includes('love') || text.includes('loved') || text.includes('beloved')) {
        return 'love';
    }
    
    // Peace
    if (text.includes('peace') || text.includes('rest') || text.includes('calm') ||
        text.includes('quiet') || text.includes('still')) {
        return 'peace';
    }
    
    // Joy
    if (text.includes('joy') || text.includes('rejoice') || text.includes('glad') ||
        text.includes('happy') || text.includes('delight')) {
        return 'joy';
    }
    
    // Patience & Waiting
    if (text.includes('wait') || text.includes('patient') || text.includes('patience') ||
        text.includes('endurance') || text.includes('perseverance')) {
        return 'patience';
    }
    
    // Faith & Trust
    if (text.includes('faith') || text.includes('trust') || text.includes('believe') ||
        text.includes('confidence') || text.includes('rely')) {
        return 'faith';
    }
    
    // Pride & Humility
    if (text.includes('pride') || text.includes('proud') || text.includes('humble') ||
        text.includes('humility') || text.includes('arrogant')) {
        return 'humility';
    }
    
    // If no specific theme is found, return 'general'
    return 'general';
}

// I write the devotional based on the theme I determined
function writeDevotional(theme, verseRef, verseText) {
    
    // PARENTING
    if (theme === 'parenting') {
        return {
            title: "For When You're Not Sure You're Doing This Right",
            message: [
                `Every parent has those moments. The kids are screaming, you've lost your patience for the fifth time today, and you're lying in bed at night wondering if you're messing them up completely.`,
                `${verseRef} was written for exactly those nights: "${verseText}" It's not about perfection. It's about direction. The little moments of kindness, the times you apologized when you got it wrong, the consistency of showing up day after day - that's the training.`,
                `Tonight, instead of listing all the ways you failed today, name one small thing you did right. One moment you were patient. One time you listened. One prayer you prayed over them. That's the path you're putting them on.`
            ],
            reflections: [
                `What's one small win you had as a parent today?`,
                `What would it look like to trust God with the parts you can't control?`
            ],
            prayer: `God, I don't always get this right. But thank You for trusting me with these kids. Help me show up tomorrow and love them well. Amen.`
        };
    }
    
    // WORK
    if (theme === 'work') {
        return {
            title: "For When Work Feels Meaningless",
            message: [
                `Another Monday. Same desk, same tasks, same routine. You wonder if any of it matters. If anyone notices. If you're just going through the motions.`,
                `${verseRef} speaks into your ordinary Tuesday: "${verseText}" Your work matters more than you know. Not because of the paycheck, but because of who you're becoming and who you're serving.`,
                `Today, do one thing with excellence. Not for recognition, but as an offering. See if doing it differently changes how you feel about being there.`
            ],
            reflections: [
                `What part of your work feels most meaningless right now?`,
                `How might doing that with excellence change things?`
            ],
            prayer: `God, help me see my work differently. Let me serve You in the small things today. Amen.`
        };
    }
    
    // MONEY
    if (theme === 'money') {
        return {
            title: "For When Money Is Tight",
            message: [
                `You checked your bank account again. Hoping the numbers would somehow be different. Bills are due, groceries are needed, and there's never quite enough.`,
                `${verseRef} doesn't promise riches: "${verseText}" But it does promise something better - perspective. Your worth isn't in your wallet. Your security isn't in your savings.`,
                `Today, instead of stressing about what you don't have, notice what you do have. One good meal. A place to sleep. Someone who loves you. Let that be enough for today.`
            ],
            reflections: [
                `What's one thing you have today that money can't buy?`,
                `Who do you know that needs help, even if you can't give money?`
            ],
            prayer: `God, the numbers scare me sometimes. Help me trust You with what I have and who I'm becoming. Amen.`
        };
    }
    
    // WISDOM
    if (theme === 'wisdom') {
        return {
            title: "When You Don't Know What to Do",
            message: [
                `You're at a crossroads. A big decision. Which job to take. Whether to stay or go. How to handle a situation with no clear right answer.`,
                `${verseRef} offers something better than a magic answer: "${verseText}" Wisdom isn't about never messing up. It's about learning, growing, and trusting God in the process.`,
                `Today, instead of paralysis, take one small step. Ask one question. Call one person. Read one chapter. Wisdom comes one step at a time.`
            ],
            reflections: [
                `What decision is weighing on you right now?`,
                `What's one small step you could take toward clarity today?`
            ],
            prayer: `God, I don't know what to do. Give me wisdom one step at a time. And help me trust You with the rest. Amen.`
        };
    }
    
    // SPEECH
    if (theme === 'speech') {
        return {
            title: "For Before You Speak",
            message: [
                `You said it before you could stop yourself. The sharp word, the gossip, the complaint. Now you wish you could take it back, but you can't.`,
                `${verseRef} reminds us why words matter: "${verseText}" They carry weight. They build up or tear down. They reveal what's really in our hearts.`,
                `Today, try this: before you speak, pause. Ask yourself: Is it true? Is it kind? Is it necessary? If not, let the silence do its work.`
            ],
            reflections: [
                `When did words hurt you? When did words heal you?`,
                `Who needs a kind word from you today?`
            ],
            prayer: `God, set a guard over my mouth today. Help my words bring life, not regret. Amen.`
        };
    }
    
    // RELATIONSHIPS
    if (theme === 'relationships') {
        return {
            title: "When Relationships Are Hard",
            message: [
                `People are complicated. They disappoint you. They don't show up the way you hoped. Sometimes the ones closest to you hurt you the most.`,
                `${verseRef} speaks into the mess: "${verseText}" Not by pretending relationships are easy, but by showing us a better way to be with each other.`,
                `Today, instead of waiting for someone else to change, change one thing about how you show up. One text. One apology. One moment of patience. See what happens.`
            ],
            reflections: [
                `What relationship feels hardest right now?`,
                `What's one small thing you could do to improve it?`
            ],
            prayer: `God, relationships are messy. Help me love people anyway, the way You love me. Amen.`
        };
    }
    
    // ANGER
    if (theme === 'anger') {
        return {
            title: "When You're About to Explode",
            message: [
                `You can feel it building. The heat in your chest. The words forming on your tongue. The thing you'll regret saying but want to say anyway.`,
                `${verseRef} doesn't shame you for being angry: "${verseText}" It just asks you to do something different with it.`,
                `Before you speak, walk away. Take five minutes. Text a friend instead of confronting. Let the fire cool before you do damage you can't undo.`
            ],
            reflections: [
                `What's triggering your anger right now?`,
                `What would help you pause before reacting?`
            ],
            prayer: `God, I'm angry. Help me not to sin in my anger. Give me self-control when I want to explode. Amen.`
        };
    }
    
    // FEAR (existing)
    if (theme === 'fear') {
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
    
    // HOPE
    if (theme === 'hope') {
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
    
    // FORGIVENESS
    if (theme === 'forgiveness') {
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
    
    // LOVE
    if (theme === 'love') {
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
    
    // PEACE
    if (theme === 'peace') {
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
    
    // JOY
    if (theme === 'joy') {
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
    
    // PATIENCE
    if (theme === 'patience') {
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
    
    // FAITH
    if (theme === 'faith') {
        return {
            title: "When You're Not Sure Anymore",
            message: [
                `You used to be so sure. About God, about prayer, about everything. Now doubts creep in. Questions without answers. Faith doesn't feel as solid as it once did.`,
                `${verseRef} doesn't shame you for doubting: "${verseText}" Faith isn't the absence of questions. It's trusting God in the middle of them.`,
                `Today, faith might be small. As small as a mustard seed. That's okay. You don't need huge faith. You just need enough to take the next step.`
            ],
            reflections: [
                `What questions are you wrestling with right now?`,
                `What would it look like to take one small step toward God anyway?`
            ],
            prayer: `God, I have doubts. I have questions. Help me with my unbelief. I want to trust You anyway. Amen.`
        };
    }
    
    // HUMILITY
    if (theme === 'humility') {
        return {
            title: "When You Need to Get Over Yourself",
            message: [
                `It's hard to admit when you're wrong. To say "I'm sorry." To realize maybe you're not as right as you thought you were.`,
                `${verseRef} invites us to something different: "${verseText}" Humility isn't thinking less of yourself. It's thinking of yourself less.`,
                `Today, try this: listen more than you speak. Assume you might be wrong. Apologize first. See how it changes your relationships.`
            ],
            reflections: [
                `Where have you been too proud to admit you were wrong?`,
                `What would it look like to humble yourself in that situation?`
            ],
            prayer: `God, pride sneaks up on me. Help me have a humble heart, even when I want to be right. Amen.`
        };
    }
    
    // GENERAL - for everything else
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


# ═══════════════════════════════════════════════════════════════════════════════
# FILE 6: config/mongodb-epg.js (TV Program Guide)
# ═══════════════════════════════════════════════════════════════════════════════

epg_js = '''// ═══════════════════════════════════════════════════════════════════════════════
// FANTAZMA NETWORK — EPG (ELECTRONIC PROGRAM GUIDE) COLLECTION
// TV schedule data with program listings
// Run: node config/mongodb-epg.js
// ═══════════════════════════════════════════════════════════════════════════════

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const dbName = 'fantazma_network';

const programTypes = [
    "live", "news", "sports", "movie", "series", "documentary", 
    "music", "talk", "religious", "educational", "children", "special"
];

const programs = [
    // Faith & Spirituality (CH-003)
    {
        epgId: "EPG-001",
        channelId: "CH-003",
        endpointId: "EP-0001",
        program: {
            title: "Morning Prayer & Worship",
            description: "Start your day with prayer, worship music, and spiritual reflection. Hosted by Pastor David.",
            type: "religious",
            category: "Faith",
            startTime: new Date("2026-06-20T06:00:00Z"),
            endTime: new Date("2026-06-20T09:00:00Z"),
            duration: 10800,
            language: "en",
            rating: "G",
            isLive: true,
            isRerun: false,
            episode: { season: null, number: null, title: null },
            guests: [],
            tags: ["prayer", "worship", "morning", "faith"],
            thumbnail: "https://cdn.fantazma.network/epg/morning-prayer.jpg",
            poster: "https://cdn.fantazma.network/epg/morning-prayer-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "daily",
            recurrenceDays: [0,1,2,3,4,5,6],
            timezone: "America/New_York"
        },
        metadata: {
            director: null,
            cast: ["Pastor David"],
            year: 2026,
            country: "US",
            genre: ["Religious", "Spiritual"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        epgId: "EPG-002",
        channelId: "CH-003",
        endpointId: "EP-0002",
        program: {
            title: "Bible Study Hour",
            description: "In-depth study of Scripture with commentary and group discussion. Today's focus: Book of Revelation.",
            type: "educational",
            category: "Faith",
            startTime: new Date("2026-06-20T19:00:00Z"),
            endTime: new Date("2026-06-20T20:30:00Z"),
            duration: 5400,
            language: "en",
            rating: "G",
            isLive: true,
            isRerun: false,
            episode: { season: 3, number: 24, title: "Revelation Chapter 7" },
            guests: ["Dr. Sarah Mitchell"],
            tags: ["bible", "study", "revelation", "scripture"],
            thumbnail: "https://cdn.fantazma.network/epg/bible-study.jpg",
            poster: "https://cdn.fantazma.network/epg/bible-study-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "weekly",
            recurrenceDays: [2,4], // Tue, Thu
            timezone: "America/New_York"
        },
        metadata: {
            director: null,
            cast: ["Pastor David", "Dr. Sarah Mitchell"],
            year: 2026,
            country: "US",
            genre: ["Religious", "Educational"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Politics & Governance (CH-002)
    {
        epgId: "EPG-003",
        channelId: "CH-002",
        endpointId: "EP-0045",
        program: {
            title: "Foster 2028: Campaign Rally Live",
            description: "Live coverage of the Foster for President 2028 campaign rally in Portland, Maine. Key policy announcements and Q&A.",
            type: "live",
            category: "Politics",
            startTime: new Date("2026-06-20T18:00:00Z"),
            endTime: new Date("2026-06-20T21:00:00Z"),
            duration: 10800,
            language: "en",
            rating: "PG",
            isLive: true,
            isRerun: false,
            episode: { season: null, number: null, title: "Portland Rally" },
            guests: ["David J. Fantazma", "Senator Collins", "Mayor Snyder"],
            tags: ["campaign", "foster2028", "rally", "politics", "live"],
            thumbnail: "https://cdn.fantazma.network/epg/foster-rally.jpg",
            poster: "https://cdn.fantazma.network/epg/foster-rally-poster.jpg"
        },
        schedule: {
            isRecurring: false,
            recurrencePattern: null,
            recurrenceDays: [],
            timezone: "America/New_York"
        },
        metadata: {
            director: "Campaign Media Team",
            cast: ["David J. Fantazma"],
            year: 2026,
            country: "US",
            genre: ["Political", "Live Event"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        epgId: "EPG-004",
        channelId: "CH-002",
        endpointId: "EP-0046",
        program: {
            title: "Policy Deep Dive: Education Reform",
            description: "Detailed analysis of the Foster 2028 education reform proposal. Panel discussion with educators and policymakers.",
            type: "talk",
            category: "Politics",
            startTime: new Date("2026-06-21T20:00:00Z"),
            endTime: new Date("2026-06-21T22:00:00Z"),
            duration: 7200,
            language: "en",
            rating: "PG",
            isLive: true,
            isRerun: false,
            episode: { season: 1, number: 12, title: "Education Reform" },
            guests: ["Dr. Emily Carter", "Rep. Johnson", "Teacher Union Rep"],
            tags: ["policy", "education", "foster2028", "reform"],
            thumbnail: "https://cdn.fantazma.network/epg/policy-education.jpg",
            poster: "https://cdn.fantazma.network/epg/policy-education-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "weekly",
            recurrenceDays: [6], // Saturday
            timezone: "America/New_York"
        },
        metadata: {
            director: "Policy Media Team",
            cast: ["David J. Fantazma", "Dr. Emily Carter"],
            year: 2026,
            country: "US",
            genre: ["Political", "Educational"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // News & Current Events (CH-001)
    {
        epgId: "EPG-005",
        channelId: "CH-001",
        endpointId: "EP-0100",
        program: {
            title: "Fantazma News Network: Evening Edition",
            description: "Comprehensive evening news coverage. Top stories: Campaign updates, AOC market analysis, and international affairs.",
            type: "news",
            category: "News",
            startTime: new Date("2026-06-20T23:00:00Z"),
            endTime: new Date("2026-06-21T00:30:00Z"),
            duration: 5400,
            language: "en",
            rating: "PG",
            isLive: true,
            isRerun: false,
            episode: { season: 2026, number: 171, title: "June 20 Evening Edition" },
            guests: [],
            tags: ["news", "evening", "headlines", "live"],
            thumbnail: "https://cdn.fantazma.network/epg/evening-news.jpg",
            poster: "https://cdn.fantazma.network/epg/evening-news-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "daily",
            recurrenceDays: [0,1,2,3,4,5,6],
            timezone: "America/New_York"
        },
        metadata: {
            director: "News Desk",
            cast: ["Anchor Team"],
            year: 2026,
            country: "US",
            genre: ["News", "Current Events"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Sacred Geometry (CH-004)
    {
        epgId: "EPG-006",
        channelId: "CH-004",
        endpointId: "EP-0200",
        program: {
            title: "Sacred Frequencies: 528Hz Healing",
            description: "Immersive sound healing session using 528Hz Solfeggio frequency. Visual sacred geometry overlays with binaural beats.",
            type: "special",
            category: "Spiritual",
            startTime: new Date("2026-06-20T21:00:00Z"),
            endTime: new Date("2026-06-20T22:30:00Z"),
            duration: 5400,
            language: "en",
            rating: "G",
            isLive: false,
            isRerun: true,
            episode: { season: 2, number: 8, title: "528Hz DNA Repair" },
            guests: ["Sound Healer Maria"],
            tags: ["sacred-geometry", "frequency", "healing", "528hz", "binaural"],
            thumbnail: "https://cdn.fantazma.network/epg/sacred-frequencies.jpg",
            poster: "https://cdn.fantazma.network/epg/sacred-frequencies-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "weekly",
            recurrenceDays: [5], // Friday
            timezone: "America/New_York"
        },
        metadata: {
            director: "Sacred Media Productions",
            cast: ["Sound Healer Maria"],
            year: 2026,
            country: "US",
            genre: ["Spiritual", "Wellness"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // AOC Token Updates (CH-058)
    {
        epgId: "EPG-007",
        channelId: "CH-058",
        endpointId: "EP-1400",
        program: {
            title: "AOC Market Watch: Weekly Burn Report",
            description: "Weekly analysis of AOC token burns, staking rewards, price action, and market sentiment. Live Q&A with community.",
            type: "talk",
            category: "Crypto",
            startTime: new Date("2026-06-21T20:00:00Z"),
            endTime: new Date("2026-06-21T21:30:00Z"),
            duration: 5400,
            language: "en",
            rating: "PG",
            isLive: true,
            isRerun: false,
            episode: { season: 1, number: 24, title: "Week 24 Burn Report" },
            guests: ["Crypto Analyst Alex", "AOC Dev Team"],
            tags: ["aoc", "crypto", "burn", "staking", "market"],
            thumbnail: "https://cdn.fantazma.network/epg/aoc-market-watch.jpg",
            poster: "https://cdn.fantazma.network/epg/aoc-market-watch-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "weekly",
            recurrenceDays: [0], // Sunday
            timezone: "America/New_York"
        },
        metadata: {
            director: "AOC Media",
            cast: ["Crypto Analyst Alex"],
            year: 2026,
            country: "US",
            genre: ["Crypto", "Finance"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Foster 2028 Campaign (CH-046)
    {
        epgId: "EPG-008",
        channelId: "CH-046",
        endpointId: "EP-1300",
        program: {
            title: "Volunteer Training: Canvassing 101",
            description: "Essential training for campaign volunteers. Learn canvassing techniques, voter registration, and grassroots organizing.",
            type: "educational",
            category: "Campaign",
            startTime: new Date("2026-06-22T18:00:00Z"),
            endTime: new Date("2026-06-22T20:00:00Z"),
            duration: 7200,
            language: "en",
            rating: "G",
            isLive: true,
            isRerun: false,
            episode: { season: 1, number: 5, title: "Canvassing Basics" },
            guests: ["Campaign Director Lisa", "Field Organizer Mike"],
            tags: ["campaign", "volunteer", "training", "foster2028", "canvassing"],
            thumbnail: "https://cdn.fantazma.network/epg/volunteer-training.jpg",
            poster: "https://cdn.fantazma.network/epg/volunteer-training-poster.jpg"
        },
        schedule: {
            isRecurring: true,
            recurrencePattern: "weekly",
            recurrenceDays: [1], // Monday
            timezone: "America/New_York"
        },
        metadata: {
            director: "Campaign Training Dept",
            cast: ["Campaign Director Lisa"],
            year: 2026,
            country: "US",
            genre: ["Political", "Educational"]
        },
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function seedEPG() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection('epg');
        
        // Create indexes
        console.log('📇 Creating indexes...');
        await collection.createIndex({ 'endpointId': 1, 'program.startTime': 1 });
        await collection.createIndex({ 'channelId': 1, 'program.startTime': 1 });
        await collection.createIndex({ 'program.startTime': 1 });
        await collection.createIndex({ 'program.type': 1 });
        await collection.createIndex({ 'program.tags': 1 });
        console.log('   ✅ EPG indexes created');
        
        await collection.deleteMany({});
        console.log('🗑️  Cleared existing EPG data');
        
        const result = await collection.insertMany(programs);
        console.log(`✅ Inserted ${result.insertedCount} EPG programs`);
        
        // Show schedule summary
        const summary = await collection.aggregate([
            { $group: { _id: '$channelId', count: { $sum: 1 }, programs: { $push: '$program.title' } } },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('');
        console.log('📺 EPG SCHEDULE BY CHANNEL:');
        for (const s of summary) {
            console.log(`   ${s._id}: ${s.count} programs`);
            for (const p of s.programs) {
                console.log(`      • ${p}`);
            }
        }
        
        // Show upcoming programs
        const now = new Date();
        const upcoming = await collection.find({ 'program.startTime': { $gte: now } })
            .sort({ 'program.startTime': 1 })
            .limit(5)
            .toArray();
        
        console.log('');
        console.log('📅 UPCOMING PROGRAMS:');
        for (const p of upcoming) {
            const start = p.program.startTime.toLocaleString('en-US', { timeZone: 'America/New_York' });
            console.log(`   ${start} — ${p.program.title} (${p.program.duration/60} min)`);
        }
        
        console.log('');
        console.log('🙏 God bless Fantazma Network!');
        
    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.close();
        console.log('🔌 Connection closed');
    }
}

seedEPG();
'''

with open('/mnt/agents/output/config/mongodb-epg.js', 'w') as f:
    f.write(epg_js)

print("✅ FILE 6/8: config/mongodb-epg.js (TV Program Guide)")
print(f"📁 Saved to: /mnt/agents/output/config/mongodb-epg.js")
print(f"📊 Size: {len(epg_js)} characters")
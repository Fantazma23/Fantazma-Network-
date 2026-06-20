
# ═══════════════════════════════════════════════════════════════════════════════
# FILE 4: config/mongodb-users.js (Accounts + AOC Integration)
# ═══════════════════════════════════════════════════════════════════════════════

users_js = '''// ═══════════════════════════════════════════════════════════════════════════════
// FANTAZMA NETWORK — USERS COLLECTION SCHEMA & SAMPLE DATA
// Accounts with AOC wallet integration, campaign tracking, watch history
// Run: node config/mongodb-users.js
// ═══════════════════════════════════════════════════════════════════════════════

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const dbName = 'fantazma_network';

const sampleUsers = [
    {
        userId: "USR-001",
        username: "fantazma23",
        email: "fantazma@example.com",
        displayName: "David J. Fantazma",
        avatar: "https://cdn.fantazma.network/avatars/fantazma23.jpg",
        bio: "Founder of Fantazma Network & Alpha Coin Omega. Running for President 2028.",
        role: "admin",
        status: "active",
        auth: {
            passwordHash: "$2b$10$...hashed...",
            lastLogin: new Date(),
            loginAttempts: 0,
            lockedUntil: null,
            twoFactorEnabled: true,
            metaMaskAddress: "0x4A662A2f4614BE5d9eB82592207be12F159b1101",
            metaMaskConnected: true,
            metaMaskConnectedAt: new Date()
        },
        aoc: {
            walletAddress: "0x4A662A2f4614BE5d9eB82592207be12F159b1101",
            balance: 50000,
            balanceUSD: 225.00,
            tier: 4, // Gold
            tierName: "Gold",
            stakedAmount: 25000,
            stakingStartDate: new Date("2026-01-15"),
            stakingAPY: 5.2,
            totalEarned: 127.50,
            totalBurned: 500,
            totalDonated: 1000,
            transactionHistory: [
                { type: "stake", amount: 25000, timestamp: new Date("2026-01-15"), txHash: "0xabc..." },
                { type: "donate", amount: 1000, timestamp: new Date("2026-03-01"), txHash: "0xdef...", campaign: "Foster2028" },
                { type: "burn", amount: 500, timestamp: new Date("2026-04-10"), txHash: "0xghi...", reason: "ad-free" }
            ]
        },
        campaign: {
            isVolunteer: true,
            referralCode: "FANTAZMA2028",
            referralsCount: 45,
            referralsEarnings: 2250,
            eventsAttended: ["Rally Maine 2026", "Town Hall Portland"],
            donationsTotal: 1000,
            voterRegistrationAssists: 12
        },
        subscription: {
            tier: "gold",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2027-01-01"),
            autoRenew: true,
            paymentMethod: "aoc",
            lastPayment: new Date("2026-06-01"),
            nextPayment: new Date("2026-07-01")
        },
        preferences: {
            language: "en",
            theme: "dark",
            notifications: {
                email: true,
                push: true,
                sms: false,
                aocPriceAlerts: true,
                campaignUpdates: true,
                newChannels: true
            },
            contentFilters: {
                matureContent: false,
                geoRestricted: true,
                adPersonalization: true
            },
            playback: {
                defaultQuality: "auto",
                autoPlay: true,
                captions: true,
                volume: 75
            }
        },
        watchHistory: [
            {
                endpointId: "EP-0001",
                channelId: "CH-003",
                title: "Live Prayer Room - 24/7 Intercession",
                watchedAt: new Date("2026-06-18T20:00:00Z"),
                duration: 3600,
                completed: false,
                progress: 1800
            },
            {
                endpointId: "EP-0045",
                channelId: "CH-002",
                title: "Politics & Governance — Stream 45",
                watchedAt: new Date("2026-06-18T18:30:00Z"),
                duration: 2400,
                completed: true,
                progress: 2400
            }
        ],
        favorites: [
            { channelId: "CH-003", addedAt: new Date("2026-01-10") },
            { channelId: "CH-046", addedAt: new Date("2026-03-15") },
            { channelId: "CH-058", addedAt: new Date("2026-04-20") }
        ],
        playlists: [
            {
                playlistId: "PL-001",
                name: "Faith & Prayer",
                description: "My favorite spiritual content",
                isPublic: false,
                items: [
                    { endpointId: "EP-0001", addedAt: new Date("2026-01-10"), order: 1 },
                    { endpointId: "EP-0002", addedAt: new Date("2026-01-15"), order: 2 }
                ],
                createdAt: new Date("2026-01-10"),
                updatedAt: new Date("2026-06-01")
            }
        ],
        geo: {
            country: "US",
            region: "Maine",
            city: "Bangor",
            timezone: "America/New_York",
            ipAddress: "192.168.1.1"
        },
        devices: [
            { deviceId: "DEV-001", type: "mobile", os: "iOS", browser: "Safari", lastActive: new Date() },
            { deviceId: "DEV-002", type: "desktop", os: "Windows", browser: "Chrome", lastActive: new Date("2026-06-17") }
        ],
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        userId: "USR-002",
        username: "sacredseeker",
        email: "sacred@example.com",
        displayName: "Sacred Seeker",
        avatar: "https://cdn.fantazma.network/avatars/sacredseeker.jpg",
        bio: "Exploring sacred geometry and divine frequencies. AOC Diamond holder.",
        role: "user",
        status: "active",
        auth: {
            passwordHash: "$2b$10$...hashed...",
            lastLogin: new Date(),
            loginAttempts: 0,
            lockedUntil: null,
            twoFactorEnabled: false,
            metaMaskAddress: "0x1234567890abcdef1234567890abcdef12345678",
            metaMaskConnected: true,
            metaMaskConnectedAt: new Date("2026-02-01")
        },
        aoc: {
            walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
            balance: 75000,
            balanceUSD: 337.50,
            tier: 5, // Diamond
            tierName: "Diamond",
            stakedAmount: 50000,
            stakingStartDate: new Date("2026-02-01"),
            stakingAPY: 5.2,
            totalEarned: 285.00,
            totalBurned: 1200,
            totalDonated: 2500,
            transactionHistory: [
                { type: "stake", amount: 50000, timestamp: new Date("2026-02-01"), txHash: "0xaaa..." },
                { type: "donate", amount: 2500, timestamp: new Date("2026-03-15"), txHash: "0xbbb...", campaign: "Foster2028" }
            ]
        },
        campaign: {
            isVolunteer: true,
            referralCode: "SACRED2028",
            referralsCount: 23,
            referralsEarnings: 1150,
            eventsAttended: ["Sacred Geometry Summit"],
            donationsTotal: 2500,
            voterRegistrationAssists: 5
        },
        subscription: {
            tier: "diamond",
            startDate: new Date("2026-02-01"),
            endDate: new Date("2027-02-01"),
            autoRenew: true,
            paymentMethod: "aoc",
            lastPayment: new Date("2026-06-01"),
            nextPayment: new Date("2026-07-01")
        },
        preferences: {
            language: "en",
            theme: "dark",
            notifications: { email: true, push: true, sms: false, aocPriceAlerts: true, campaignUpdates: true, newChannels: true },
            contentFilters: { matureContent: true, geoRestricted: true, adPersonalization: false },
            playback: { defaultQuality: "1080p", autoPlay: true, captions: false, volume: 80 }
        },
        watchHistory: [
            {
                endpointId: "EP-0100",
                channelId: "CH-004",
                title: "Sacred Geometry & Esoteric — Stream 100",
                watchedAt: new Date("2026-06-18T19:00:00Z"),
                duration: 7200,
                completed: true,
                progress: 7200
            }
        ],
        favorites: [
            { channelId: "CH-004", addedAt: new Date("2026-02-10") },
            { channelId: "CH-031", addedAt: new Date("2026-03-01") },
            { channelId: "CH-032", addedAt: new Date("2026-03-15") }
        ],
        playlists: [],
        geo: { country: "US", region: "California", city: "Los Angeles", timezone: "America/Los_Angeles", ipAddress: "10.0.0.1" },
        devices: [{ deviceId: "DEV-003", type: "desktop", os: "macOS", browser: "Chrome", lastActive: new Date() }],
        createdAt: new Date("2026-02-01"),
        updatedAt: new Date()
    },
    {
        userId: "USR-003",
        username: "newviewer",
        email: "new@example.com",
        displayName: "New Viewer",
        avatar: "https://cdn.fantazma.network/avatars/default.jpg",
        bio: "Just joined Fantazma Network! Excited to explore.",
        role: "user",
        status: "active",
        auth: {
            passwordHash: "$2b$10$...hashed...",
            lastLogin: new Date(),
            loginAttempts: 0,
            lockedUntil: null,
            twoFactorEnabled: false,
            metaMaskAddress: null,
            metaMaskConnected: false,
            metaMaskConnectedAt: null
        },
        aoc: {
            walletAddress: null,
            balance: 0,
            balanceUSD: 0,
            tier: 1, // Bronze
            tierName: "Bronze",
            stakedAmount: 0,
            stakingStartDate: null,
            stakingAPY: 5.2,
            totalEarned: 0,
            totalBurned: 0,
            totalDonated: 0,
            transactionHistory: []
        },
        campaign: {
            isVolunteer: false,
            referralCode: null,
            referralsCount: 0,
            referralsEarnings: 0,
            eventsAttended: [],
            donationsTotal: 0,
            voterRegistrationAssists: 0
        },
        subscription: {
            tier: "free",
            startDate: new Date("2026-06-19"),
            endDate: null,
            autoRenew: false,
            paymentMethod: null,
            lastPayment: null,
            nextPayment: null
        },
        preferences: {
            language: "en",
            theme: "light",
            notifications: { email: true, push: false, sms: false, aocPriceAlerts: false, campaignUpdates: false, newChannels: true },
            contentFilters: { matureContent: false, geoRestricted: true, adPersonalization: true },
            playback: { defaultQuality: "auto", autoPlay: false, captions: true, volume: 50 }
        },
        watchHistory: [],
        favorites: [],
        playlists: [],
        geo: { country: "US", region: "Texas", city: "Houston", timezone: "America/Chicago", ipAddress: "172.16.0.1" },
        devices: [{ deviceId: "DEV-004", type: "mobile", os: "Android", browser: "Chrome", lastActive: new Date() }],
        createdAt: new Date("2026-06-19"),
        updatedAt: new Date()
    }
];

async function seedUsers() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection('users');
        
        // Create indexes first
        console.log('📇 Creating indexes...');
        await collection.createIndex({ 'email': 1 }, { unique: true });
        await collection.createIndex({ 'username': 1 }, { unique: true });
        await collection.createIndex({ 'auth.metaMaskAddress': 1 }, { sparse: true });
        await collection.createIndex({ 'aoc.walletAddress': 1 }, { sparse: true });
        await collection.createIndex({ 'aoc.tier': 1 });
        await collection.createIndex({ 'campaign.referralCode': 1 });
        await collection.createIndex({ 'watchHistory.endpointId': 1 });
        await collection.createIndex({ 'favorites.channelId': 1 });
        console.log('   ✅ All indexes created');
        
        await collection.deleteMany({});
        console.log('🗑️  Cleared existing users');
        
        const result = await collection.insertMany(sampleUsers);
        console.log(`✅ Inserted ${result.insertedCount} sample users`);
        
        // Show summary
        const tierSummary = await collection.aggregate([
            { $group: { _id: '$aoc.tier', count: { $sum: 1 }, tierName: { $first: '$aoc.tierName' } } },
            { $sort: { _id: 1 } }
        ]).toArray();
        
        console.log('');
        console.log('📊 USERS BY AOC TIER:');
        const tierLabels = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Diamond' };
        for (const t of tierSummary) {
            console.log(`   ${tierLabels[t._id] || 'Unknown'} (Tier ${t._id}): ${t.count} users`);
        }
        
        const walletSummary = await collection.aggregate([
            { $match: { 'aoc.walletAddress': { $ne: null } } },
            { $group: { _id: null, totalBalance: { $sum: '$aoc.balance' }, avgBalance: { $avg: '$aoc.balance' }, count: { $sum: 1 } } }
        ]).toArray();
        
        if (walletSummary.length > 0) {
            console.log('');
            console.log('📊 WALLET STATISTICS:');
            console.log(`   Connected wallets: ${walletSummary[0].count}`);
            console.log(`   Total AOC held: ${walletSummary[0].totalBalance.toLocaleString()}`);
            console.log(`   Average balance: ${Math.round(walletSummary[0].avgBalance).toLocaleString()} AOC`);
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

seedUsers();
'''

with open('/mnt/agents/output/config/mongodb-users.js', 'w') as f:
    f.write(users_js)

print("✅ FILE 4/8: config/mongodb-users.js (Accounts + AOC)")
print(f"📁 Saved to: /mnt/agents/output/config/mongodb-users.js")
print(f"📊 Size: {len(users_js)} characters")
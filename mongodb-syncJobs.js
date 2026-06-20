
# ═══════════════════════════════════════════════════════════════════════════════
# FILE 7: config/mongodb-syncJobs.js (API Bridge Queue)
# ═══════════════════════════════════════════════════════════════════════════════

syncJobs_js = '''// ═══════════════════════════════════════════════════════════════════════════════
// FANTAZMA NETWORK — SYNC JOBS COLLECTION (API Bridge Queue)
// Background job queue for platform syncing, data imports, exports
// Run: node config/mongodb-syncJobs.js
// ═══════════════════════════════════════════════════════════════════════════════

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const dbName = 'fantazma_network';

const syncJobs = [
    {
        jobId: "SYNC-001",
        name: "YouTube Channel Sync",
        description: "Sync live streams and VODs from configured YouTube channels",
        platform: "youtube",
        status: "active",
        priority: 1, // 1=high, 5=low
        schedule: {
            type: "interval", // interval, cron, manual
            interval: 300, // seconds (5 min)
            cronExpression: null,
            nextRun: new Date(Date.now() + 300000),
            lastRun: new Date(Date.now() - 600000),
            runCount: 1247,
            successCount: 1234,
            failureCount: 13
        },
        target: {
            channelId: "CH-008", // Music & Performance
            endpointIds: ["EP-0300", "EP-0301"],
            platformChannelIds: ["UCmusic123", "UCmusic456"],
            filters: {
                minDuration: 60,
                maxDuration: 14400,
                allowedTypes: ["live", "premiere"],
                excludeKeywords: ["private", "deleted"]
            }
        },
        config: {
            apiKey: "${YOUTUBE_API_KEY}",
            maxResults: 50,
            includeComments: false,
            includeThumbnails: true,
            qualityPreference: ["1080p", "720p", "480p"]
        },
        results: {
            lastSyncItems: 12,
            lastSyncDuration: 45000, // ms
            lastError: null,
            lastErrorAt: null
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        jobId: "SYNC-002",
        name: "Twitch Live Sync",
        description: "Monitor and import live Twitch streams for Gaming & Esports channel",
        platform: "twitch",
        status: "active",
        priority: 1,
        schedule: {
            type: "interval",
            interval: 180, // 3 min
            cronExpression: null,
            nextRun: new Date(Date.now() + 180000),
            lastRun: new Date(Date.now() - 120000),
            runCount: 2890,
            successCount: 2876,
            failureCount: 14
        },
        target: {
            channelId: "CH-009", // Gaming & Esports
            endpointIds: [],
            platformChannelIds: ["ninja", "shroud", "pokimane", "xqc"],
            filters: {
                minViewers: 1000,
                maxViewers: null,
                gameIds: ["509658", "33214", "21779"], // Fortnite, CS2, LoL
                language: "en"
            }
        },
        config: {
            clientId: "${TWITCH_CLIENT_ID}",
            clientSecret: "${TWITCH_CLIENT_SECRET}",
            maxStreams: 20,
            includeChat: false,
            includeClips: true
        },
        results: {
            lastSyncItems: 8,
            lastSyncDuration: 23000,
            lastError: null,
            lastErrorAt: null
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        jobId: "SYNC-003",
        name: "IPTV Playlist Import",
        description: "Import and validate M3U playlists from external IPTV sources",
        platform: "iptv",
        status: "active",
        priority: 2,
        schedule: {
            type: "cron",
            interval: null,
            cronExpression: "0 */6 * * *", // Every 6 hours
            nextRun: new Date(Date.now() + 21600000),
            lastRun: new Date(Date.now() - 18000000),
            runCount: 876,
            successCount: 850,
            failureCount: 26
        },
        target: {
            channelId: null, // All channels
            endpointIds: [],
            platformChannelIds: [],
            filters: {
                validateStreams: true,
                timeoutMs: 10000,
                maxBitrate: 10000000,
                allowedProtocols: ["https", "http"]
            }
        },
        config: {
            playlistUrls: [
                "https://iptv-org.github.io/iptv/index.m3u",
                "https://raw.githubusercontent.com/.../playlist.m3u"
            ],
            autoCategorize: true,
            deduplicate: true,
            geoFilter: ["US", "CA", "UK"]
        },
        results: {
            lastSyncItems: 145,
            lastSyncDuration: 120000,
            lastError: null,
            lastErrorAt: null
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        jobId: "SYNC-004",
        name: "AOC Price Feed",
        description: "Fetch real-time AOC token price, market cap, and trading data",
        platform: "custom",
        status: "active",
        priority: 1,
        schedule: {
            type: "interval",
            interval: 60, // 1 min
            cronExpression: null,
            nextRun: new Date(Date.now() + 60000),
            lastRun: new Date(Date.now() - 30000),
            runCount: 15678,
            successCount: 15650,
            failureCount: 28
        },
        target: {
            channelId: "CH-058", // AOC Token Updates
            endpointIds: [],
            platformChannelIds: [],
            filters: {}
        },
        config: {
            apiEndpoints: [
                "https://api.coingecko.com/api/v3/simple/price?ids=alpha-coin-omega&vs_currencies=usd",
                "https://api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=aoc"
            ],
            contractAddress: "0x4A662A2f4614BE5d9eB82592207be12F159b1101",
            updateAnalytics: true,
            alertOnPriceChange: 5.0 // Alert if price changes >5%
        },
        results: {
            lastSyncItems: 1,
            lastSyncDuration: 1200,
            lastError: null,
            lastErrorAt: null
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        jobId: "SYNC-005",
        name: "Campaign Donation Sync",
        description: "Sync on-chain AOC donations to Foster 2028 campaign treasury",
        platform: "custom",
        status: "active",
        priority: 2,
        schedule: {
            type: "interval",
            interval: 600, // 10 min
            cronExpression: null,
            nextRun: new Date(Date.now() + 600000),
            lastRun: new Date(Date.now() - 300000),
            runCount: 4320,
            successCount: 4315,
            failureCount: 5
        },
        target: {
            channelId: "CH-050", // Campaign Finance
            endpointIds: [],
            platformChannelIds: [],
            filters: {
                minConfirmations: 12,
                campaignAddress: "0xCampaignTreasury...",
                tokenContract: "0x4A662A2f4614BE5d9eB82592207be12F159b1101"
            }
        },
        config: {
            rpcUrl: "${ETH_RPC_URL}",
            etherscanApiKey: "${ETHERSCAN_API_KEY}",
            updateDonorsList: true,
            generateFecReport: true,
            alertThreshold: 1000 // Alert on donations >1000 AOC
        },
        results: {
            lastSyncItems: 3,
            lastSyncDuration: 8000,
            lastError: null,
            lastErrorAt: null
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        jobId: "SYNC-006",
        name: "EPG Data Import",
        description: "Import TV guide data from external EPG providers",
        platform: "custom",
        status: "paused",
        priority: 3,
        schedule: {
            type: "cron",
            interval: null,
            cronExpression: "0 2 * * *", // Daily at 2 AM
            nextRun: new Date(Date.now() + 86400000),
            lastRun: new Date(Date.now() - 172800000),
            runCount: 156,
            successCount: 150,
            failureCount: 6
        },
        target: {
            channelId: null,
            endpointIds: [],
            platformChannelIds: [],
            filters: {
                daysAhead: 7,
                language: "en",
                includeImages: true
            }
        },
        config: {
            providers: ["tvguide.com", "ontvtonight.com", "schedulesdirect.org"],
            apiKeys: {
                tvguide: "${TVGUIDE_API_KEY}",
                schedulesDirect: "${SD_API_KEY}"
            },
            mappingFile: "config/epg-channel-mapping.json"
        },
        results: {
            lastSyncItems: 450,
            lastSyncDuration: 180000,
            lastError: "API rate limit exceeded",
            lastErrorAt: new Date(Date.now() - 172800000)
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    },
    {
        jobId: "SYNC-007",
        name: "Health Check Monitor",
        description: "Monitor all endpoint health status and update analytics",
        platform: "custom",
        status: "active",
        priority: 1,
        schedule: {
            type: "interval",
            interval: 30, // 30 seconds
            cronExpression: null,
            nextRun: new Date(Date.now() + 30000),
            lastRun: new Date(Date.now() - 15000),
            runCount: 52560,
            successCount: 52000,
            failureCount: 560
        },
        target: {
            channelId: null,
            endpointIds: [],
            platformChannelIds: [],
            filters: {
                checkTimeout: 5000,
                retryAttempts: 3,
                markOfflineAfter: 5
            }
        },
        config: {
            parallelChecks: 50,
            updateDashboard: true,
            sendAlerts: true,
            alertChannels: ["email", "slack", "dashboard"]
        },
        results: {
            lastSyncItems: 1450,
            lastSyncDuration: 45000,
            lastError: null,
            lastErrorAt: null
        },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date()
    }
];

async function seedSyncJobs() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection('syncJobs');
        
        // Create indexes
        console.log('📇 Creating indexes...');
        await collection.createIndex({ 'platform': 1, 'status': 1 });
        await collection.createIndex({ 'schedule.nextRun': 1 });
        await collection.createIndex({ 'target.channelId': 1 });
        await collection.createIndex({ 'priority': 1, 'status': 1 });
        console.log('   ✅ SyncJobs indexes created');
        
        await collection.deleteMany({});
        console.log('🗑️  Cleared existing sync jobs');
        
        const result = await collection.insertMany(syncJobs);
        console.log(`✅ Inserted ${result.insertedCount} sync jobs`);
        
        // Show summary
        const statusSummary = await collection.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        console.log('');
        console.log('📊 SYNC JOBS BY STATUS:');
        for (const s of statusSummary) {
            console.log(`   ${s._id}: ${s.count} jobs`);
        }
        
        const platformSummary = await collection.aggregate([
            { $group: { _id: '$platform', count: { $sum: 1 } } }
        ]).toArray();
        
        console.log('');
        console.log('📊 SYNC JOBS BY PLATFORM:');
        for (const p of platformSummary) {
            console.log(`   ${p._id}: ${p.count} jobs`);
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

seedSyncJobs();
'''

with open('/mnt/agents/output/config/mongodb-syncJobs.js', 'w') as f:
    f.write(syncJobs_js)

print("✅ FILE 7/8: config/mongodb-syncJobs.js (API Bridge Queue)")
print(f"📁 Saved to: /mnt/agents/output/config/mongodb-syncJobs.js")
print(f"📊 Size: {len(syncJobs_js)} characters")
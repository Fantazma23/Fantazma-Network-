
# ═══════════════════════════════════════════════════════════════════════════════
# FILE 5: config/mongodb-analytics.js (Time-Series Metrics)
# ═══════════════════════════════════════════════════════════════════════════════

analytics_js = '''// ═══════════════════════════════════════════════════════════════════════════════
// FANTAZMA NETWORK — ANALYTICS COLLECTION SCHEMA & SAMPLE DATA
// Time-series metrics for viewers, AOC, bandwidth, geo, devices
// Run: node config/mongodb-analytics.js
// ═══════════════════════════════════════════════════════════════════════════════

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const dbName = 'fantazma_network';

// Generate 30 days of hourly analytics data
function generateAnalyticsData() {
    const data = [];
    const now = new Date();
    
    for (let day = 0; day < 30; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(hour, 0, 0, 0);
            
            // Peak hours: 18:00-23:00
            const isPeak = hour >= 18 && hour <= 23;
            const baseViewers = isPeak ? 45000 : 15000;
            const viewers = Math.floor(baseViewers + Math.random() * 10000);
            
            data.push({
                timestamp: timestamp,
                type: "global",
                global: {
                    totalViewers: viewers,
                    peakViewers: Math.floor(viewers * 1.8),
                    totalChannels: 58,
                    activeChannels: 52 + Math.floor(Math.random() * 4),
                    totalEndpoints: 1450,
                    onlineEndpoints: 1380 + Math.floor(Math.random() * 50),
                    uniqueFeeds: 8000 + Math.floor(Math.random() * 500),
                    cacheHitRate: 85 + Math.random() * 5,
                    avgResponseTime: 120 + Math.floor(Math.random() * 80),
                    bandwidth: 4000000000 + Math.floor(Math.random() * 1000000000)
                },
                aoc: {
                    priceUSD: 0.0045 + (Math.random() * 0.002 - 0.001),
                    marketCap: 4500000 + Math.floor(Math.random() * 500000),
                    volume24h: 100000 + Math.floor(Math.random() * 50000),
                    holders: 8900 + Math.floor(Math.random() * 100),
                    transactions24h: 3000 + Math.floor(Math.random() * 1000),
                    burned24h: Math.floor(Math.random() * 10000),
                    stakedTotal: 2400000 + Math.floor(Math.random() * 200000)
                },
                geo: {
                    countries: {
                        "US": { viewers: Math.floor(viewers * 0.52), bandwidth: Math.floor(viewers * 0.52 * 100000) },
                        "CA": { viewers: Math.floor(viewers * 0.10), bandwidth: Math.floor(viewers * 0.10 * 100000) },
                        "UK": { viewers: Math.floor(viewers * 0.07), bandwidth: Math.floor(viewers * 0.07 * 100000) },
                        "DE": { viewers: Math.floor(viewers * 0.05), bandwidth: Math.floor(viewers * 0.05 * 100000) },
                        "AU": { viewers: Math.floor(viewers * 0.04), bandwidth: Math.floor(viewers * 0.04 * 100000) },
                        "FR": { viewers: Math.floor(viewers * 0.04), bandwidth: Math.floor(viewers * 0.04 * 100000) },
                        "JP": { viewers: Math.floor(viewers * 0.03), bandwidth: Math.floor(viewers * 0.03 * 100000) },
                        "BR": { viewers: Math.floor(viewers * 0.03), bandwidth: Math.floor(viewers * 0.03 * 100000) },
                        "IN": { viewers: Math.floor(viewers * 0.04), bandwidth: Math.floor(viewers * 0.04 * 100000) },
                        "MX": { viewers: Math.floor(viewers * 0.03), bandwidth: Math.floor(viewers * 0.03 * 100000) }
                    },
                    topCities: ["New York", "Los Angeles", "London", "Toronto", "Sydney", "Berlin", "Paris", "Tokyo", "São Paulo", "Mumbai"]
                },
                devices: {
                    mobile: 40 + Math.random() * 10,
                    desktop: 30 + Math.random() * 8,
                    smartTV: 15 + Math.random() * 5,
                    tablet: 5 + Math.random() * 3,
                    console: 1 + Math.random() * 2
                },
                campaigns: {
                    foster2028: {
                        totalDonationsUSD: 125000 + Math.floor(Math.random() * 5000),
                        uniqueDonors: 450 + Math.floor(Math.random() * 50),
                        avgDonation: 277.78,
                        aocDonations: 15000 + Math.floor(Math.random() * 2000)
                    }
                }
            });
        }
    }
    
    return data;
}

// Generate channel-specific analytics
function generateChannelAnalytics() {
    const data = [];
    const now = new Date();
    const channelIds = ["CH-001", "CH-002", "CH-003", "CH-046", "CH-058"];
    
    for (const channelId of channelIds) {
        for (let day = 0; day < 7; day++) {
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(0, 0, 0, 0);
            
            data.push({
                timestamp: timestamp,
                type: "channel",
                channelId: channelId,
                metrics: {
                    totalViewers: 500 + Math.floor(Math.random() * 5000),
                    peakViewers: 1000 + Math.floor(Math.random() * 8000),
                    avgWatchTime: 600 + Math.floor(Math.random() * 3600),
                    totalPlays: 1000 + Math.floor(Math.random() * 10000),
                    completionRate: 0.3 + Math.random() * 0.5,
                    uniqueVisitors: 400 + Math.floor(Math.random() * 4000),
                    returningVisitors: 100 + Math.floor(Math.random() * 1000)
                },
                engagement: {
                    likes: Math.floor(Math.random() * 1000),
                    shares: Math.floor(Math.random() * 500),
                    comments: Math.floor(Math.random() * 200),
                    bookmarks: Math.floor(Math.random() * 300)
                },
                revenue: {
                    adRevenue: Math.random() * 100,
                    subscriptionRevenue: Math.random() * 50,
                    aocTips: Math.floor(Math.random() * 100)
                }
            });
        }
    }
    
    return data;
}

async function seedAnalytics() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection('analytics');
        
        // Create indexes
        console.log('📇 Creating indexes...');
        await collection.createIndex({ 'timestamp': 1, 'type': 1 });
        await collection.createIndex({ 'timestamp': 1, 'channelId': 1 });
        await collection.createIndex({ 'timestamp': 1, 'endpointId': 1 });
        console.log('   ✅ Analytics indexes created');
        
        await collection.deleteMany({});
        console.log('🗑️  Cleared existing analytics');
        
        // Insert global analytics
        console.log('🔄 Generating 30 days of global analytics (720 records)...');
        const globalData = generateAnalyticsData();
        
        const batchSize = 500;
        let inserted = 0;
        
        for (let i = 0; i < globalData.length; i += batchSize) {
            const batch = globalData.slice(i, i + batchSize);
            const result = await collection.insertMany(batch);
            inserted += result.insertedCount;
            console.log(`   ✅ Batch ${Math.floor(i/batchSize)+1}: ${result.insertedCount} records`);
        }
        
        // Insert channel analytics
        console.log('🔄 Generating channel analytics (35 records)...');
        const channelData = generateChannelAnalytics();
        const channelResult = await collection.insertMany(channelData);
        inserted += channelResult.insertedCount;
        console.log(`   ✅ Channel analytics: ${channelResult.insertedCount} records`);
        
        console.log('');
        console.log(`✅ TOTAL INSERTED: ${inserted} analytics records`);
        
        // Show latest stats
        const latest = await collection.findOne({ type: "global" }, { sort: { timestamp: -1 } });
        if (latest) {
            console.log('');
            console.log('📊 LATEST GLOBAL STATS:');
            console.log(`   Viewers: ${latest.global.totalViewers.toLocaleString()}`);
            console.log(`   AOC Price: $${latest.aoc.priceUSD.toFixed(4)}`);
            console.log(`   Market Cap: $${latest.aoc.marketCap.toLocaleString()}`);
            console.log(`   Bandwidth: ${(latest.global.bandwidth / 1000000000).toFixed(2)} GB/s`);
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

seedAnalytics();
'''

with open('/mnt/agents/output/config/mongodb-analytics.js', 'w') as f:
    f.write(analytics_js)

print("✅ FILE 5/8: config/mongodb-analytics.js (Time-Series Metrics)")
print(f"📁 Saved to: /mnt/agents/output/config/mongodb-analytics.js")
print(f"📊 Size: {len(analytics_js)} characters")
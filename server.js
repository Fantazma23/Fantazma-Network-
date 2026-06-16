// ============================================
// FANTAZMA NETWORK — Combined Server
// Serves frontend static files + runs backend API
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fantazma-super-secret-jwt-key-2026-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();

// Enable CORS — allow your frontend domain + localhost for testing
app.use(cors({
    origin: [
        'https://fantazma-network.onrender.com',
        'https://fantazma-network.vercel.app',
        'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STATIC FILES — Serve your frontend HTML/CSS/JS
// ============================================

// Try multiple possible paths for static files
const possibleStaticPaths = [
    path.join(__dirname, 'public'),      // public/ folder
    path.join(__dirname, 'dist'),        // dist/ folder
    path.join(__dirname, 'build'),       // build/ folder
    path.join(__dirname),                // root (files in repo root)
    path.join(__dirname, 'frontend'),    // frontend/ folder
    path.join(__dirname, 'src')         // src/ folder
];

let staticPath = null;
for (const p of possibleStaticPaths) {
    if (fs.existsSync(p)) {
        staticPath = p;
        console.log(`[Static] Found static files at: ${p}`);
        break;
    }
}

if (staticPath) {
    app.use(express.static(staticPath, {
        maxAge: '1d',
        etag: true,
        lastModified: true
    }));
    console.log(`[Static] Serving files from: ${staticPath}`);
} else {
    console.log('[Static] WARNING: No static folder found. Creating fallback...');
}

// ============================================
// JWT HELPERS (simple implementation)
// ============================================

function generateToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const body = Buffer.from(JSON.stringify({
        ...payload,
        iat: now,
        exp: now + (30 * 24 * 60 * 60) // 30 days
    })).toString('base64url');
    const signature = require('crypto')
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
    try {
        const [header, body, signature] = token.split('.');
        const expectedSig = require('crypto')
            .createHmac('sha256', JWT_SECRET)
            .update(`${header}.${body}`)
            .digest('base64url');
        if (signature !== expectedSig) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

// ============================================
// IN-MEMORY USER STORE (replace with MongoDB in production)
// ============================================

const users = new Map();

async function checkSubscription(address) {
    // TODO: Query your database for subscription status
    // For now, return false — user needs to subscribe
    return false;
}

async function getOrCreateUser(address) {
    const normalizedAddress = address.toLowerCase();
    if (!users.has(normalizedAddress)) {
        users.set(normalizedAddress, {
            walletAddress: normalizedAddress,
            createdAt: new Date(),
            lastLogin: new Date(),
            loginCount: 0,
            subscription: {
                isPaid: false,
                type: null,
                status: 'inactive',
                expiresAt: null
            }
        });
    }
    const user = users.get(normalizedAddress);
    user.lastLogin = new Date();
    user.loginCount += 1;
    user.subscription.isPaid = await checkSubscription(normalizedAddress);
    if (user.subscription.isPaid) {
        user.subscription.status = 'active';
        user.subscription.type = 'monthly';
        user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    return user;
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Fantazma Network API',
        version: '1.0.0',
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

// MetaMask authentication
app.post('/api/auth/metamask', async (req, res) => {
    try {
        const { address, signature, message } = req.body;

        // Validate inputs
        if (!address || !signature || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: address, signature, message'
            });
        }

        // Validate Ethereum address format
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!ethAddressRegex.test(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address format'
            });
        }

        console.log('[MetaMask Auth] Verifying signature for:', address);

        // Recover the signing address from the signature
        let recoveredAddress;
        try {
            const { recoverPersonalSignature } = require('@metamask/eth-sig-util');
            recoveredAddress = recoverPersonalSignature({
                data: message,
                signature: signature,
            });
        } catch (sigError) {
            console.error('[MetaMask Auth] Signature recovery failed:', sigError.message);
            return res.status(401).json({
                success: false,
                error: 'Invalid signature format'
            });
        }

        // Verify it matches the claimed address (case-insensitive)
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            console.error('[MetaMask Auth] Address mismatch!');
            return res.status(401).json({
                success: false,
                error: 'Signature verification failed — address mismatch'
            });
        }

        console.log('[MetaMask Auth] Signature verified!');

        // Get or create user
        const user = await getOrCreateUser(address);

        // Generate JWT token
        const token = generateToken({
            walletAddress: address.toLowerCase(),
            type: 'metamask',
            iat: Date.now()
        });

        res.json({
            success: true,
            message: 'MetaMask authentication successful',
            address: address,
            walletAddress: address,
            token: token,
            isPaid: user.subscription.isPaid,
            subscription: {
                type: user.subscription.type || 'none',
                status: user.subscription.status,
                expiresAt: user.subscription.expiresAt
            },
            user: {
                walletAddress: address,
                loginCount: user.loginCount,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('[MetaMask Auth] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during authentication',
            details: NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Verify JWT token
app.get('/api/auth/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        res.json({
            success: true,
            valid: true,
            walletAddress: payload.walletAddress
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Token verification failed'
        });
    }
});

// Get current user info
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        const user = users.get(payload.walletAddress);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                walletAddress: user.walletAddress,
                subscription: user.subscription,
                loginCount: user.loginCount,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get user info'
        });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ============================================
// FALLBACK: Serve index.html for SPA routes
// ============================================

// If no API route matched and no static file found, serve index.html
// This enables client-side routing for SPAs
app.get('*', (req, res) => {
    // Don't serve HTML for API routes that 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'API endpoint not found',
            path: req.path
        });
    }

    // Try to find and serve index.html or login.html
    const indexPaths = [
        path.join(__dirname, 'public', 'index.html'),
        path.join(__dirname, 'public', 'login.html'),
        path.join(__dirname, 'index.html'),
        path.join(__dirname, 'login.html'),
        path.join(__dirname, 'dist', 'index.html'),
        path.join(__dirname, 'build', 'index.html')
    ];

    for (const indexPath of indexPaths) {
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }

    // If no index file found, return a simple message
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Fantazma Network</title></head>
        <body style="background:#0a0a1a;color:#fff;font-family:sans-serif;text-align:center;padding-top:20vh;">
            <h1>⚡ Fantazma Network API</h1>
            <p>Server is running. Add your HTML files to serve the frontend.</p>
            <p><a href="/api/health" style="color:#00f0ff;">Check API Health</a></p>
        </body>
        </html>
    `);
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║     ⚡ FANTAZMA NETWORK COMBINED SERVER ⚡           ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Port:        ${PORT.toString().padEnd(41)} ║`);
    console.log(`║  Environment: ${NODE_ENV.padEnd(41)} ║`);
    console.log(`║  Static Path: ${(staticPath || 'NOT FOUND').padEnd(41)} ║`);
    console.log('║  Status:      Running ✅                            ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('API Endpoints:');
    console.log('  GET  /api/health       → Health check');
    console.log('  POST /api/auth/metamask → MetaMask login');
    console.log('  GET  /api/auth/verify  → Verify JWT token');
    console.log('  GET  /api/auth/me      → Get user info');
    console.log('  POST /api/auth/logout  → Logout');
    console.log('');
    console.log('Static Files:');
    console.log('  /login.html, /index.html, /dashboard.html, etc.');
    console.log('');
});
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================================================
// PERFORMANCE OPTIMIZATION: Environment Variable Validation (Fix #6)
// ============================================================================
const requiredEnvVars = ['JWT_SECRET', 'COINBASE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Create a .env file with: JWT_SECRET and COINBASE_API_KEY');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// ============================================================================
// PERFORMANCE OPTIMIZATION: CORS Security (Fix #3)
// ============================================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:8080'];

console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 3600
  },
  // Socket.io Security (Fix #9)
  maxHttpBufferSize: 1e6, // 1MB limit
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;

// ============================================================================
// PERFORMANCE OPTIMIZATION: Memory Management with TTL Cache (Fix #1)
// ============================================================================
class CacheWithTTL {
  constructor(ttlMs) {
    this.data = new Map();
    this.ttl = ttlMs;
    this.expirations = new Map();
    
    // Auto-cleanup every hour (Fix #10: Graceful Management)
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  set(key, value) {
    this.data.set(key, value);
    const expirationTime = Date.now() + this.ttl;
    this.expirations.set(key, expirationTime);
  }

  get(key) {
    const expirationTime = this.expirations.get(key);
    if (expirationTime && Date.now() > expirationTime) {
      this.data.delete(key);
      this.expirations.delete(key);
      return undefined;
    }
    return this.data.get(key);
  }

  cleanup() {
    const now = Date.now();
    let removed = 0;
    for (const [key, expTime] of this.expirations.entries()) {
      if (now > expTime) {
        this.data.delete(key);
        this.expirations.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired cache entries`);
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Initialize caches with TTL
const users = new CacheWithTTL(7 * 24 * 60 * 60 * 1000); // 7 days
const payments = new CacheWithTTL(30 * 24 * 60 * 60 * 1000); // 30 days
const messageHistory = new Map(); // Room-specific message history

// ============================================================================
// PERFORMANCE OPTIMIZATION: Rate Limiting (Fix #2)
// ============================================================================
const rateLimit = require('express-rate-limit');

const createPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: '❌ Too many payment attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: '❌ Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// Middleware
// ============================================================================
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Static file serving with caching headers (Fix #8)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
}));

// ============================================================================
// PERFORMANCE OPTIMIZATION: Input Validation Helper
// ============================================================================
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeString(str) {
  return String(str).trim().substring(0, 500);
}

// ============================================================================
// PERFORMANCE OPTIMIZATION: JWT Authentication Middleware (Fix #7)
// ============================================================================
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied - no token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.warn('Invalid token attempted:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============================================================================
// PERFORMANCE OPTIMIZATION: Error Handling for API Calls (Fix #5)
// ============================================================================
async function createCoinbaseCharge(chargeData) {
  try {
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(chargeData),
      timeout: 10000 // 10 second timeout
    });

    // Validate response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coinbase API error:', response.status, errorText);
      return { error: `Payment API error: ${response.status}` };
    }

    const data = await response.json();

    // Validate response structure
    if (!data.data || !data.data.id || !data.data.hosted_url) {
      console.error('Invalid Coinbase response structure:', data);
      return { error: 'Invalid payment response from Coinbase' };
    }

    return data;
  } catch (err) {
    console.error('Coinbase API error:', err.message);
    return { error: 'Payment service temporarily unavailable' };
  }
}

// ============================================================================
// Routes: Create Crypto Charge
// ============================================================================
app.post('/api/create-crypto-charge', createPaymentLimiter, async (req, res) => {
  try {
    const { email, tier } = req.body;

    // Input validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!tier || !['monthly', 'yearly', 'ppv'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const pricing = {
      monthly: { amount: '4.99', name: 'Fantazma Network Monthly' },
      yearly: { amount: '49.99', name: 'Fantazma Network Annual' },
      ppv: { amount: '9.99', name: 'Premium Premiere' }
    };

    const selected = pricing[tier];

    const charge = {
      name: 'Fantazma Network',
      description: selected.name,
      local_price: {
        amount: selected.amount,
        currency: 'USD'
      },
      pricing_type: 'fixed_price',
      metadata: {
        customer_email: email,
        tier: tier
      },
      redirect_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`
    };

    const result = await createCoinbaseCharge(charge);

    if (result.error) {
      return res.status(502).json({ error: result.error });
    }

    // Store payment with TTL
    payments.set(result.data.id, {
      email,
      tier,
      status: 'pending',
      createdAt: Date.now()
    });

    console.log(`💳 Payment initiated for ${email} - ${tier}`);

    res.json({
      url: result.data.hosted_url,
      charge_id: result.data.id
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// ============================================================================
// Routes: Coinbase Webhook
// ============================================================================
app.post('/api/webhook-crypto', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    let event;
    
    if (Buffer.isBuffer(req.body)) {
      event = JSON.parse(req.body.toString());
    } else {
      event = req.body;
    }

    if (event.event === 'charge:confirmed') {
      const charge = event.data;
      const { customer_email, tier } = charge.metadata || {};

      if (!customer_email) {
        console.warn('Webhook received without customer email');
        return res.status(400).json({ error: 'Invalid webhook data' });
      }

      // Update user with TTL
      const user = users.get(customer_email) || { email: customer_email };
      user.isPaid = true;
      user.tier = tier;
      user.paidAt = Date.now();
      users.set(customer_email, user);

      console.log(`✅ Payment confirmed for: ${customer_email}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================================================
// Routes: Authentication
// ============================================================================
app.post('/api/login', loginLimiter, (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const user = users.get(email) || { email, isPaid: false };
    users.set(email, user);

    // Token expires in 24 hours (Fix #7: Reduced from 7 days)
    const token = jwt.sign(
      { email, isPaid: user.isPaid },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`🔓 User logged in: ${email}`);

    res.json({ token, isPaid: user.isPaid });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============================================================================
// Socket.io Chat with Message History (Fix #4)
// ============================================================================
const MESSAGE_HISTORY_LIMIT = 50; // Cap messages per room

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    roomId = sanitizeString(roomId);
    socket.join(roomId);

    // Initialize message history for room if needed
    if (!messageHistory.has(roomId)) {
      messageHistory.set(roomId, []);
    }

    // Send existing message history to user
    const history = messageHistory.get(roomId);
    socket.emit('message-history', history);

    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      timestamp: new Date().toISOString()
    });

    console.log(`📍 User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send-message', (data) => {
    try {
      const { roomId, message, username } = data;

      // Input validation and sanitization
      if (!roomId || !message) {
        return socket.emit('error', { message: 'Invalid message data' });
      }

      const sanitizedMessage = sanitizeString(message);
      const sanitizedUsername = sanitizeString(username || 'Anonymous');

      const messageData = {
        username: sanitizedUsername,
        message: sanitizedMessage,
        timestamp: new Date().toISOString(),
        userId: socket.id
      };

      // Store in message history with limit
      const history = messageHistory.get(roomId) || [];
      history.push(messageData);

      // Keep only last N messages (Fix #4)
      if (history.length > MESSAGE_HISTORY_LIMIT) {
        history.shift();
      }
      messageHistory.set(roomId, history);

      // Broadcast to room
      io.to(roomId).emit('receive-message', messageData);
    } catch (err) {
      console.error('Message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
  });
});

// ============================================================================
// Routes: Static Files
// ============================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// PERFORMANCE OPTIMIZATION: Graceful Shutdown (Fix #10)
// ============================================================================
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('✅ Server closed');
    
    // Cleanup caches
    users.destroy();
    payments.destroy();
    messageHistory.clear();
    
    console.log('✅ Cache cleanup complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown - timeout exceeded');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// Start Server
// ============================================================================
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎬 Fantazma Network - Running                             ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                                 ║
║  Environment: ${NODE_ENV}                                       ║
║  CORS Origins: ${allowedOrigins.length}                                         ║
║  Memory Cache: Users + Payments + Message History           ║
║  Auto-Cleanup: Enabled (hourly)                             ║
║  Socket.io Security: Enabled (1MB buffer limit)             ║
║  Rate Limiting: Enabled (payments + login)                  ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

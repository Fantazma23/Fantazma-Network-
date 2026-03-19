const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage
const users = new Map();
const payments = new Map();

// JWT auth middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Create crypto charge
app.post('/api/create-crypto-charge', async (req, res) => {
  const { email, tier } = req.body;
  
  const pricing = {
    monthly: { amount: '4.99', name: 'Fantazma Network Monthly' },
    yearly: { amount: '49.99', name: 'Fantazma Network Annual' },
    ppv: { amount: '9.99', name: 'Premium Premiere' }
  };
  
  const selected = pricing[tier] || pricing.monthly;
  
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
  
  try {
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(charge)
    });
    
    const data = await response.json();
    
    payments.set(data.data.id, {
      email,
      tier,
      status: 'pending'
    });
    
    res.json({ 
      url: data.data.hosted_url,
      charge_id: data.data.id
    });
  } catch (err) {
    console.error('Coinbase error:', err);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Coinbase webhook
app.post('/api/webhook-crypto', express.raw({type: 'application/json'}), async (req, res) => {
  const event = req.body;
  
  if (event.event === 'charge:confirmed') {
    const charge = event.data;
    const { customer_email, tier } = charge.metadata;
    
    const user = users.get(customer_email) || { email: customer_email };
    user.isPaid = true;
    user.tier = tier;
    user.paidAt = Date.now();
    users.set(customer_email, user);
    
    console.log('Payment confirmed for:', customer_email);
  }
  
  res.json({ received: true });
});

// Auth routes
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const user = users.get(email) || { email, isPaid: false };
  users.set(email, user);
  
  const token = jwt.sign(
    { email, isPaid: user.isPaid },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token, isPaid: user.isPaid });
});

app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Socket.io chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { 
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('send-message', (data) => {
    const { roomId, message, username } = data;
    io.to(roomId).emit('receive-message', {
      username: username || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
      userId: socket.id
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`🎬 Fantazma Network running on port ${PORT}`);
});

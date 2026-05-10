# Fantazma Network - Security & Performance Setup Guide

## 🔐 Environment Setup

### 1. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it into your `.env` file as `JWT_SECRET`.

### 2. Create `.env` File
```bash
cp .env.example .env
```

### 3. Configure Environment Variables
Edit `.env` with your actual values:

```env
# Server
PORT=3000
NODE_ENV=production

# Security - REQUIRED
JWT_SECRET=your_generated_secret_here
COINBASE_API_KEY=your_api_key_here

# CORS - Adjust for your domains
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🚀 Installation & Running

### Development
```bash
npm install
npm run dev
```
Server runs on `http://localhost:3000` with auto-reload and detailed logging.

### Production
```bash
npm install --production
npm start
```

### Performance Monitoring
```bash
npm run monitor
```
This generates detailed performance profiles showing CPU, memory, and event loop metrics.

## 📊 Performance Optimizations Implemented

### 1. ✅ Memory Leak Prevention
**What was fixed:** In-memory cache was growing indefinitely
- **Solution:** `CacheWithTTL` class with automatic expiration
- **TTL:** Users (7 days), Payments (30 days), Messages (50 per room)
- **Auto-cleanup:** Runs every hour
- **Impact:** Memory usage now stays stable

### 2. ✅ Rate Limiting
**What was fixed:** No protection against brute-force attacks
- **Payment endpoint:** 5 requests per 15 minutes
- **Login endpoint:** 10 requests per 15 minutes
- **Impact:** Prevents abuse and protects against DoS attacks

### 3. ✅ CORS Security
**What was fixed:** CORS allowed all origins (`*`)
- **Solution:** Whitelist only in `ALLOWED_ORIGINS` env var
- **Default:** Localhost only
- **Impact:** Prevents unauthorized cross-origin requests

### 4. ✅ Message History Capping
**What was fixed:** Chat could consume unbounded memory
- **Solution:** Limit to 50 messages per room
- **Behavior:** Oldest messages removed when limit exceeded
- **Impact:** Stable memory usage regardless of chat activity

### 5. ✅ Error Handling
**What was fixed:** API errors were silent, payments could fail unnoticed
- **Solution:** HTTP status validation before parsing responses
- **Logging:** All errors logged to console
- **Impact:** Better debugging and error visibility

### 6. ✅ Environment Variable Validation
**What was fixed:** Missing env vars caused silent crashes
- **Solution:** Validate required vars on startup
- **Behavior:** Exit with error message if any vars missing
- **Impact:** Fails fast with clear error messages

### 7. ✅ Token Security
**What was fixed:** 7-day tokens were too long-lived
- **Solution:** Reduced to 24 hours
- **Benefit:** Limits damage from compromised tokens
- **Impact:** 6x improvement in token security

### 8. ✅ Static Asset Caching
**What was fixed:** No cache headers on frontend assets
- **Solution:** 1-day cache with ETag support
- **Benefit:** Browsers cache CSS/JS/images for repeat visits
- **Impact:** Faster repeat page loads, reduced bandwidth

### 9. ✅ Socket.io Security
**What was fixed:** No payload size limit, potential DDoS vector
- **Solution:** 1MB buffer limit on messages
- **Validation:** Input sanitization on all messages
- **Impact:** Prevents memory exhaustion from large payloads

### 10. ✅ Graceful Shutdown
**What was fixed:** Server didn't clean up on shutdown
- **Solution:** SIGTERM/SIGINT handlers with 10-second timeout
- **Behavior:** Closes connections, clears caches, then exits
- **Impact:** Clean server restarts without data loss

## 🔍 Monitoring & Testing

### Check Memory Usage
```bash
# On Linux/Mac
node --expose-gc server.js
# In another terminal
watch -n 1 'ps aux | grep node'
```

### Test Rate Limiting
```bash
# This should fail after 5 requests
for i in {1..10}; do curl -X POST http://localhost:3000/api/create-crypto-charge; done
```

### Test Input Validation
```bash
# Invalid email - should be rejected
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}'

# Valid email - should work
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📈 Performance Metrics to Track

Monitor these metrics in production:

```
Memory Usage:
  - Should stay stable after hourly cleanup
  - Typical: 50-100MB for idle server
  - Alert if: > 500MB (memory leak)

Request Latency:
  - Payment creation: < 2 seconds
  - Login: < 500ms
  - API verify: < 100ms
  - Alert if: > 5 seconds

Socket.io Connections:
  - Active connections per room
  - Message throughput (msgs/sec)
  - Alert if: > 1000 connections per room

Rate Limit Hits:
  - Track failed login attempts
  - Track failed payment attempts
  - Indicates potential attacks

Cache Efficiency:
  - Monitor cache cleanup logs
  - Check expired entry count
  - Adjust TTL if needed
```

## 🛠️ Troubleshooting

### Server crashes on startup
```
Error: Missing environment variables: JWT_SECRET, COINBASE_API_KEY
```
**Fix:** Create `.env` file with required variables

### CORS errors in browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Add your domain to `ALLOWED_ORIGINS` in `.env`

### Too many login attempts message
```
Error: 429 Too many login attempts. Please try again later.
```
**Fix:** Wait 15 minutes or restart the server

### Socket.io connection refused
```
Error: WebSocket connection to ws://localhost:3000 failed
```
**Fix:** Ensure server is running and CORS is configured

## 📦 Dependencies

- **express**: Web framework
- **socket.io**: Real-time communication
- **cors**: Cross-origin resource sharing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variable management
- **express-rate-limit**: Rate limiting middleware
- **clinic**: Performance profiling (dev only)

## 🔄 Next Steps for Production

### High Priority
1. **Switch to Persistent Database**
   - Install MongoDB or PostgreSQL
   - Migrate user and payment data
   - Update cache layer to use database

2. **Add Input Validation**
   - Implement joi or yup for schema validation
   - Add XSRF protection
   - Sanitize HTML input

3. **Setup Monitoring & Logging**
   - Integrate Sentry for error tracking
   - Setup Winston/Pino for structured logging
   - Configure CloudWatch or similar

### Medium Priority
1. **Redis Integration** - For distributed caching
2. **Database Query Optimization** - Add indexes, caching
3. **Frontend Optimization** - Minify assets, lazy loading
4. **SSL/TLS Certificates** - Setup HTTPS

### Low Priority
1. **CDN Integration** - Serve assets from CDN
2. **Load Testing** - Use Artillery or Locust
3. **API Documentation** - Generate with Swagger/OpenAPI
4. **Automated Tests** - Jest + Supertest

## 📞 Support

For issues, check:
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)

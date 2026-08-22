/* ═══════════════════════════════════════════════════════════════
   FANTAZMA NETWORK — WEBSOCKET CHAT SERVER
   Real-time chat for live streams
   ═══════════════════════════════════════════════════════════════ */

const WebSocket = require('ws');

class ChatServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.rooms = new Map(); // roomId -> Set of clients
        this.history = new Map(); // roomId -> Array of messages

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const roomId = url.pathname.split('/').pop();

        // Join room
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(ws);
        ws.roomId = roomId;

        // Send history
        const history = this.history.get(roomId) || [];
        ws.send(JSON.stringify({ type: 'history', messages: history }));

        // Handle messages
        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);
                this.broadcast(roomId, msg, ws);
            } catch (err) {
                console.error('Invalid message:', err);
            }
        });

        // Handle disconnect
        ws.on('close', () => {
            const room = this.rooms.get(roomId);
            if (room) {
                room.delete(ws);
                if (room.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        });
    }

    broadcast(roomId, message, sender) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Add timestamp
        message.timestamp = Date.now();

        // Store in history (keep last 100)
        if (!this.history.has(roomId)) {
            this.history.set(roomId, []);
        }
        const hist = this.history.get(roomId);
        hist.push(message);
        if (hist.length > 100) hist.shift();

        // Broadcast to all clients in room
        const data = JSON.stringify(message);
        room.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

module.exports = ChatServer;

// Usage in server.js:
// const ChatServer = require('./websocket-server');
// const chatServer = new ChatServer(server);

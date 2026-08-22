/* ═══════════════════════════════════════════════════════════════
   FANTAZMA NETWORK — DASHBOARD ENGINE
   Auth, Navigation, Data, UI State
   ═══════════════════════════════════════════════════════════════ */

// ─── CONFIG ───
const CONFIG = {
    sessionKey: 'fantazma_session',
    userKey: 'fantazma_user',
    demoMode: true,  // Set to false when backend auth is ready
};

// ─── DEMO DATA ───
const DEMO_USER = {
    email: 'david_j_foster2211@yahoo.com',
    name: 'David J. Foster',
    initials: 'DF',
    tier: 'High Priest',
    avatar: null,
    subscription: 'yearly',
    joined: '2024-01-15'
};

const CHANNELS = [
    {
        id: 'writing-room',
        title: 'The Writing Room',
        desc: 'Live scriptwriting with David J. Foster',
        icon: 'fa-pen-fancy',
        live: true,
        viewers: 1247,
        category: 'live',
        color: 'linear-gradient(135deg, #00d4ff, #0099cc)',
        episodes: [
            { num: 1, title: 'Pilot Episode — Genesis', duration: '2:34:12', date: '2024-08-20' },
            { num: 2, title: 'Character Arcs & Redemption', duration: '1:58:44', date: '2024-08-21' },
            { num: 3, title: 'The Lilith Principle', duration: '2:12:08', date: '2024-08-22' },
        ]
    },
    {
        id: 'after-dark',
        title: 'Fantazma After Dark',
        desc: 'Unfiltered commentary. Raw. Real.',
        icon: 'fa-moon',
        live: false,
        schedule: '8:00 PM EST',
        viewers: 0,
        category: 'live',
        color: 'linear-gradient(135deg, #a855f7, #6366f1)',
        nextStream: '2024-08-22T20:00:00'
    },
    {
        id: 'nexus-stream',
        title: 'NEXUS Frequency Stream',
        desc: '285 Hz Solfeggio + Theta Sync',
        icon: 'fa-wave-square',
        live: true,
        viewers: 89,
        category: 'live',
        color: 'linear-gradient(135deg, #22c55e, #16a34a)',
    },
    {
        id: 'maine-stories',
        title: 'Maine Stories',
        desc: 'Uniquely Maine. Unfiltered.',
        icon: 'fa-mountain-sun',
        live: false,
        category: 'archive',
        color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    {
        id: 'crypto-corner',
        title: 'Crypto Corner',
        desc: 'Bitcoin, markets, and the future',
        icon: 'fa-bitcoin',
        live: false,
        category: 'archive',
        color: 'linear-gradient(135deg, #f7931a, #e67e22)',
    },
    {
        id: 'ministry-hour',
        title: 'The Ministry Hour',
        desc: 'Servant / High Priest teachings',
        icon: 'fa-cross',
        live: false,
        category: 'archive',
        color: 'linear-gradient(135deg, #ffd700, #b8860b)',
    }
];

const ARCHIVE_CONTENT = [
    { title: 'Sunberry — The Full Story', type: 'film', duration: '1:45:00', progress: 0, thumbnail: 'fa-apple-alt' },
    { title: 'The Lilith Arc: Episode 1', type: 'series', duration: '45:00', progress: 65, thumbnail: 'fa-mask' },
    { title: 'NEXXUS Protocol Explained', type: 'doc', duration: '32:15', progress: 30, thumbnail: 'fa-brain' },
    { title: 'Maine Winter Sessions', type: 'podcast', duration: '1:12:00', progress: 0, thumbnail: 'fa-snowflake' },
    { title: 'Ordination & Purpose', type: 'doc', duration: '58:00', progress: 100, thumbnail: 'fa-hands-praying' },
    { title: 'The 432 Hz Frequency Guide', type: 'podcast', duration: '2:00:00', progress: 15, thumbnail: 'fa-music' },
];

const CONTINUE_WATCHING = [
    { title: 'The Lilith Arc: Episode 1', progress: 65, total: 45, thumbnail: 'fa-mask' },
    { title: 'NEXXUS Protocol Explained', progress: 30, total: 32, thumbnail: 'fa-brain' },
    { title: 'The 432 Hz Frequency Guide', progress: 15, total: 120, thumbnail: 'fa-music' },
];

const TX_HISTORY = [
    { type: 'in', asset: 'BTC', amount: '0.0100', fiat: '$671.50', from: 'Subscription Payment', date: '2024-08-20' },
    { type: 'out', asset: 'ETH', amount: '0.0500', fiat: '$150.00', to: 'Server Hosting', date: '2024-08-18' },
    { type: 'in', asset: 'USDC', amount: '49.99', fiat: '$49.99', from: 'Monthly Renewal', date: '2024-08-15' },
    { type: 'in', asset: 'BTC', amount: '0.0050', fiat: '$335.75', from: 'Donation', date: '2024-08-12' },
];

// ─── AUTH SYSTEM ───
class AuthManager {
    static init() {
        this.checkSession();
        this.bindEvents();
    }

    static checkSession() {
        const session = localStorage.getItem(CONFIG.sessionKey);
        if (session || CONFIG.demoMode) {
            this.showDashboard();
        } else {
            this.showAuthGate();
        }
    }

    static showAuthGate() {
        document.getElementById('auth-gate').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    static showDashboard() {
        const gate = document.getElementById('auth-gate');
        gate.classList.add('hidden');
        setTimeout(() => {
            gate.style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            App.init();
        }, 600);
    }

    static login(email, password) {
        // TODO: Replace with actual API call
        // fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({email, password}) })

        if (CONFIG.demoMode) {
            // Simulate API delay
            return new Promise((resolve) => {
                setTimeout(() => {
                    localStorage.setItem(CONFIG.sessionKey, 'demo_session_token_' + Date.now());
                    localStorage.setItem(CONFIG.userKey, JSON.stringify(DEMO_USER));
                    resolve({ success: true, user: DEMO_USER });
                }, 800);
            });
        }
    }

    static logout() {
        localStorage.removeItem(CONFIG.sessionKey);
        localStorage.removeItem(CONFIG.userKey);
        location.reload();
    }

    static getUser() {
        const data = localStorage.getItem(CONFIG.userKey);
        return data ? JSON.parse(data) : DEMO_USER;
    }

    static bindEvents() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Authenticating...';
            btn.disabled = true;

            try {
                const result = await this.login(email, password);
                if (result.success) {
                    this.showDashboard();
                }
            } catch (err) {
                showToast('Authentication failed', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }
}

// ─── APP ENGINE ───
class App {
    static init() {
        this.renderUser();
        this.renderChannels();
        this.renderContinueWatching();
        this.renderArchive();
        this.renderWritingEpisodes();
        this.renderTxHistory();
        this.bindNavigation();
        this.bindSidebar();
        this.startCryptoTicker();
        this.startLiveIndicators();
    }

    static renderUser() {
        const user = AuthManager.getUser();
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-avatar').textContent = user.initials;
        document.getElementById('user-tier').innerHTML = `<i class="fas fa-crown"></i> ${user.tier}`;
    }

    static renderChannels() {
        const grid = document.getElementById('live-channels');
        const liveChannels = CHANNELS.filter(c => c.category === 'live');

        grid.innerHTML = liveChannels.map(ch => `
            <div class="channel-card" onclick="playMedia('${ch.id}')">
                <div class="card-thumbnail" style="background: ${ch.color}">
                    <i class="fas ${ch.icon}" style="color: white; text-shadow: 0 0 20px rgba(0,0,0,0.5);"></i>
                    ${ch.live ? `<span class="live-indicator"><i class="fas fa-circle"></i> LIVE</span>` : ''}
                </div>
                <div class="card-info">
                    <div class="card-title">${ch.title}</div>
                    <div class="card-meta">
                        <span><i class="fas fa-eye"></i> ${ch.viewers?.toLocaleString() || 0} watching</span>
                        ${ch.schedule ? `<span><i class="fas fa-clock"></i> ${ch.schedule}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    static renderContinueWatching() {
        const grid = document.getElementById('continue-watching');
        grid.innerHTML = CONTINUE_WATCHING.map(item => `
            <div class="content-card" onclick="playMedia('continue', '${item.title}')">
                <div class="card-thumbnail">
                    <i class="fas ${item.thumbnail}"></i>
                </div>
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(item.progress / item.total) * 100}%"></div>
                    </div>
                    <div class="card-meta">
                        <span>${item.progress}m / ${item.total}m remaining</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static renderArchive() {
        const grid = document.getElementById('archive-grid');
        const fullGrid = document.getElementById('archive-full');

        const cardHTML = (item) => `
            <div class="content-card" onclick="playMedia('archive', '${item.title}')">
                <div class="card-thumbnail">
                    <i class="fas ${item.thumbnail}"></i>
                </div>
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta">
                        <span class="type-badge">${item.type}</span>
                        <span><i class="fas fa-clock"></i> ${item.duration}</span>
                    </div>
                    ${item.progress > 0 ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.progress}%"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        grid.innerHTML = ARCHIVE_CONTENT.slice(0, 3).map(cardHTML).join('');
        if (fullGrid) fullGrid.innerHTML = ARCHIVE_CONTENT.map(cardHTML).join('');
    }

    static renderWritingEpisodes() {
        const container = document.getElementById('writing-episodes');
        const writingRoom = CHANNELS.find(c => c.id === 'writing-room');
        if (!container || !writingRoom?.episodes) return;

        container.innerHTML = writingRoom.episodes.map(ep => `
            <div class="episode-item" onclick="playMedia('writing-room', '${ep.title}')">
                <div class="episode-num">${ep.num}</div>
                <div class="episode-info">
                    <h4>${ep.title}</h4>
                    <span><i class="fas fa-clock"></i> ${ep.duration} • ${ep.date}</span>
                </div>
            </div>
        `).join('');
    }

    static renderTxHistory() {
        const list = document.getElementById('tx-list');
        if (!list) return;

        list.innerHTML = TX_HISTORY.map(tx => `
            <div class="tx-item">
                <div class="tx-info">
                    <div class="tx-icon ${tx.type}">
                        <i class="fas fa-arrow-${tx.type === 'in' ? 'down' : 'up'}"></i>
                    </div>
                    <div class="tx-details">
                        <h4>${tx.from || tx.to}</h4>
                        <span>${tx.date} • ${tx.asset}</span>
                    </div>
                </div>
                <div class="tx-amount">
                    <div class="amount ${tx.type}">${tx.type === 'in' ? '+' : '-'}${tx.amount} ${tx.asset}</div>
                    <div class="fiat">${tx.fiat}</div>
                </div>
            </div>
        `).join('');
    }

    static bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.switchView(view);

                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterArchive(btn.dataset.filter);
            });
        });

        // Hero play button
        const heroPlay = document.getElementById('hero-play-btn');
        if (heroPlay) {
            heroPlay.addEventListener('click', () => playMedia('writing-room'));
        }
    }

    static switchView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${viewName}`);
        if (target) target.classList.add('active');

        // Special init for certain views
        if (viewName === 'nexus') {
            setTimeout(() => NexusSystem.init(), 100);
        }
    }

    static filterArchive(filter) {
        const grid = document.getElementById('archive-full');
        if (!grid) return;

        const filtered = filter === 'all' 
            ? ARCHIVE_CONTENT 
            : ARCHIVE_CONTENT.filter(item => item.type === filter);

        grid.innerHTML = filtered.map(item => `
            <div class="content-card" onclick="playMedia('archive', '${item.title}')">
                <div class="card-thumbnail">
                    <i class="fas ${item.thumbnail}"></i>
                </div>
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta">
                        <span class="type-badge">${item.type}</span>
                        <span><i class="fas fa-clock"></i> ${item.duration}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static bindSidebar() {
        const toggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    static startCryptoTicker() {
        const priceEl = document.getElementById('btc-price');
        let basePrice = 67420;

        setInterval(() => {
            const change = (Math.random() - 0.5) * 200;
            basePrice += change;
            priceEl.textContent = '$' + Math.floor(basePrice).toLocaleString();
        }, 5000);
    }

    static startLiveIndicators() {
        // Update live viewer counts
        setInterval(() => {
            CHANNELS.forEach(ch => {
                if (ch.live && ch.viewers) {
                    ch.viewers += Math.floor((Math.random() - 0.5) * 20);
                    if (ch.viewers < 10) ch.viewers = 10;
                }
            });
            this.renderChannels();
        }, 10000);
    }
}

// ─── NEXUS SYSTEM ───
class NexusSystem {
    static audioCtx = null;
    static oscillator = null;
    static gainNode = null;
    static isPlaying = false;
    static canvas = null;
    static ctx = null;
    static animId = null;

    static init() {
        this.canvas = document.getElementById('nexus-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        const slider = document.getElementById('freq-slider');
        const display = document.getElementById('freq-value');
        const playBtn = document.getElementById('nexus-play');

        slider.addEventListener('input', (e) => {
            display.textContent = e.target.value;
            if (this.isPlaying) this.updateFrequency(parseFloat(e.target.value));
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const freq = parseFloat(btn.dataset.freq);
                slider.value = freq;
                display.textContent = freq;
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.isPlaying) this.updateFrequency(freq);
            });
        });

        playBtn.addEventListener('click', () => this.toggle());
        this.drawVisualizer();
    }

    static toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    static start() {
        const freq = parseFloat(document.getElementById('freq-slider').value);

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillator = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();

        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = freq;
        this.gainNode.gain.value = 0.15;

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        this.oscillator.start();

        this.isPlaying = true;
        document.getElementById('nexus-play').innerHTML = '<i class="fas fa-stop"></i> Stop Generation';

        this.log(`Started ${freq} Hz tone`);
        this.animate();
    }

    static stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
        this.isPlaying = false;
        document.getElementById('nexus-play').innerHTML = '<i class="fas fa-play"></i> Generate Tone';
        this.log('Stopped tone generation');
        cancelAnimationFrame(this.animId);
        this.drawVisualizer();
    }

    static updateFrequency(freq) {
        if (this.oscillator) {
            this.oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        }
    }

    static log(message) {
        const container = document.getElementById('nexus-log');
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="timestamp">[${time}]</span> ${message}`;
        container.prepend(entry);
    }

    static animate() {
        const freq = parseFloat(document.getElementById('freq-slider').value);
        const time = Date.now() * 0.001;

        this.ctx.fillStyle = '#151520';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let x = 0; x < this.canvas.width; x++) {
            const y = this.canvas.height / 2 + 
                Math.sin(x * 0.02 * (freq / 100) + time * 5) * 50 +
                Math.sin(x * 0.05 + time * 3) * 20;
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();

        // Glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        this.animId = requestAnimationFrame(() => this.animate());
    }

    static drawVisualizer() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#151520';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(0,212,255,0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < this.canvas.width; x += 5) {
            const y = this.canvas.height / 2 + Math.sin(x * 0.05) * 30;
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }
}

// ─── UTILITIES ───
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function copyAddress(el) {
    const text = el.textContent.trim().replace('📋', '').trim();
    navigator.clipboard.writeText(text).then(() => {
        showToast('Address copied to clipboard', 'success');
    });
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});

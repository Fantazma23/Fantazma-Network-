/* ═══════════════════════════════════════════════════════════════
   FANTAZMA NETWORK — MEDIA PLAYER ENGINE
   Modal player, chat, stream simulation
   ═══════════════════════════════════════════════════════════════ */

// ─── MEDIA PLAYER STATE ───
const MediaPlayer = {
    currentChannel: null,
    isPlaying: false,
    chatInterval: null,
    viewerInterval: null,
    chatMessages: [],
    demoUsers: ['CryptoKing', 'MaineWriter', 'ThetaWalker', 'LilithFan', 'BTC_Hodler', 'DarkMoon', 'NexusSeeker', 'PriestDavid', 'Sunberry_Reader', 'FreqMaster'],
    demoMessages: [
        'This is incredible content!',
        'The frequency is hitting different tonight',
        'When is the next live stream?',
        'Love the new dashboard design',
        'David you're killing it',
        'Maine represent!',
        'That Lilith arc is fire',
        '285 Hz changed my life',
        'Bitcoin to the moon',
        'Writing room is my therapy',
        'Unfiltered and unapologetic',
        'The NEXUS system is wild',
        'Can't wait for After Dark',
        'This is what streaming should be',
        'Fantazma forever',
    ],
};

// ─── PLAY MEDIA ───
function playMedia(channelId, episodeTitle = null) {
    const channel = CHANNELS.find(c => c.id === channelId);
    const modal = document.getElementById('media-modal');
    const placeholder = document.getElementById('media-placeholder');
    const video = document.getElementById('video-element');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const liveBadge = document.getElementById('modal-live-badge');
    const viewersEl = document.getElementById('modal-viewers');
    const durationEl = document.getElementById('modal-duration');

    MediaPlayer.currentChannel = channelId;

    // Set content info
    if (channel) {
        titleEl.textContent = episodeTitle || channel.title;
        descEl.textContent = channel.desc;

        if (channel.live) {
            liveBadge.style.display = 'inline-flex';
            viewersEl.style.display = 'inline-flex';
            viewersEl.innerHTML = `<i class="fas fa-eye"></i> ${channel.viewers?.toLocaleString() || 0} watching`;
            durationEl.style.display = 'none';
        } else {
            liveBadge.style.display = 'none';
            viewersEl.style.display = 'none';
            durationEl.style.display = 'inline-flex';
            durationEl.innerHTML = `<i class="fas fa-clock"></i> ${channel.schedule || 'On Demand'}`;
        }
    } else {
        titleEl.textContent = episodeTitle || 'Content';
        descEl.textContent = 'Streaming now...';
        liveBadge.style.display = 'none';
        viewersEl.style.display = 'none';
        durationEl.style.display = 'inline-flex';
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Show placeholder (no real video source yet)
    placeholder.style.display = 'block';
    video.classList.remove('active');

    // Update placeholder text
    document.getElementById('media-title').textContent = episodeTitle || channel?.title || 'Now Playing';
    document.getElementById('media-desc').textContent = channel?.desc || 'Stream loading...';

    // Start chat simulation
    startChatSimulation();

    // Start viewer count updates for live channels
    if (channel?.live) {
        startViewerUpdates(channel);
    }

    showToast(`Now playing: ${episodeTitle || channel?.title || 'Content'}`, 'info');
}

// ─── CLOSE MEDIA ───
function closeMedia() {
    const modal = document.getElementById('media-modal');
    const video = document.getElementById('video-element');

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Stop video if playing
    video.pause();
    video.src = '';

    // Stop chat
    stopChatSimulation();
    stopViewerUpdates();

    MediaPlayer.currentChannel = null;
    MediaPlayer.isPlaying = false;
}

// ─── CHAT SIMULATION ───
function startChatSimulation() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    // Add system message
    addChatMessage('system', 'Welcome to the live chat. Be respectful.');

    // Add a few initial messages
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const user = MediaPlayer.demoUsers[Math.floor(Math.random() * MediaPlayer.demoUsers.length)];
            const msg = MediaPlayer.demoMessages[Math.floor(Math.random() * MediaPlayer.demoMessages.length)];
            addChatMessage(user, msg);
        }, i * 800);
    }

    // Periodic new messages
    MediaPlayer.chatInterval = setInterval(() => {
        if (Math.random() > 0.3) {
            const user = MediaPlayer.demoUsers[Math.floor(Math.random() * MediaPlayer.demoUsers.length)];
            const msg = MediaPlayer.demoMessages[Math.floor(Math.random() * MediaPlayer.demoMessages.length)];
            addChatMessage(user, msg);
        }
    }, 3500);
}

function stopChatSimulation() {
    if (MediaPlayer.chatInterval) {
        clearInterval(MediaPlayer.chatInterval);
        MediaPlayer.chatInterval = null;
    }
}

function addChatMessage(user, text) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${user === 'system' ? 'system' : ''}`;

    if (user === 'system') {
        msgDiv.textContent = text;
    } else {
        msgDiv.innerHTML = `<span class="msg-user">${user}:</span><span class="msg-text">${text}</span>`;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    // Keep only last 50 messages
    while (container.children.length > 50) {
        container.removeChild(container.firstChild);
    }
}

function sendChat() {
    const input = document.getElementById('chat-input-field');
    const text = input.value.trim();

    if (!text) return;

    const user = AuthManager.getUser();
    addChatMessage(user.name || 'You', text);
    input.value = '';
}

// ─── VIEWER COUNT UPDATES ───
function startViewerUpdates(channel) {
    const viewersEl = document.getElementById('modal-viewers');

    MediaPlayer.viewerInterval = setInterval(() => {
        if (channel.viewers) {
            channel.viewers += Math.floor((Math.random() - 0.5) * 15);
            if (channel.viewers < 5) channel.viewers = 5;
            viewersEl.innerHTML = `<i class="fas fa-eye"></i> ${channel.viewers.toLocaleString()} watching`;
        }
    }, 5000);
}

function stopViewerUpdates() {
    if (MediaPlayer.viewerInterval) {
        clearInterval(MediaPlayer.viewerInterval);
        MediaPlayer.viewerInterval = null;
    }
}

// ─── KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMedia();
    }

    if (e.key === 'Enter' && document.getElementById('media-modal').classList.contains('active')) {
        const chatInput = document.getElementById('chat-input-field');
        if (document.activeElement === chatInput) {
            sendChat();
        }
    }
});

// ─── LIVE CHANNEL LIST (for Live view) ───
function renderLiveChannelList() {
    const container = document.getElementById('channel-list-full');
    if (!container) return;

    const liveChannels = CHANNELS.filter(c => c.category === 'live');

    container.innerHTML = liveChannels.map(ch => `
        <div class="channel-card" onclick="playMedia('${ch.id}')">
            <div class="card-thumbnail" style="background: ${ch.color}">
                <i class="fas ${ch.icon}" style="color: white;"></i>
                ${ch.live ? `<span class="live-indicator"><i class="fas fa-circle"></i> LIVE</span>` : ''}
            </div>
            <div class="card-info">
                <div class="card-title">${ch.title}</div>
                <div class="card-meta">
                    <span><i class="fas fa-eye"></i> ${ch.viewers?.toLocaleString() || 0}</span>
                    ${ch.schedule ? `<span><i class="fas fa-clock"></i> ${ch.schedule}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
    renderLiveChannelList();
});

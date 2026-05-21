/**
 * Fantazma Network - Dashboard Module
 * Handles dashboard functionality, chat, and content
 */

(function() {
    'use strict';

    window.FantazmaDashboard = {
        // Initialize all dashboard components
        init: function() {
            this.initNavigation();
            this.initChat();
            this.initVideoPlayer();
            this.loadContentLibrary();
            this.loadTVGuide();
            this.initSubscribe();
            this.showUserInfo();
        },

        // Navigation between sections
        initNavigation: function() {
            var navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    var section = this.getAttribute('data-section');
                    navItems.forEach(function(n) { n.classList.remove('active'); });
                    this.classList.add('active');
                    document.querySelectorAll('.section').forEach(function(s) {
                        s.classList.remove('active');
                    });
                    var target = document.getElementById('section-' + section);
                    if (target) target.classList.add('active');
                });
            });
        },

        // Show user info from session
        showUserInfo: function() {
            if (typeof FantazmaAuth !== 'undefined') {
                var user = FantazmaAuth.getUser();
                if (user) {
                    var name = user.name || user.email || 'User';
                    var avatarEl = document.getElementById('userAvatar');
                    var nameEl = document.getElementById('userName');
                    var walletEl = document.getElementById('walletAddress');
                    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
                    if (nameEl) nameEl.textContent = name;
                    if (walletEl) walletEl.textContent = user.address || 'Not connected';
                }
            }
        },

        // Chat functionality
        initChat: function() {
            var messages = document.getElementById('chatMessages');
            var input = document.getElementById('chatInput');
            var sendBtn = document.getElementById('chatSend');
            if (!messages) return;

            var demoMessages = [
                { user: 'System', text: 'Welcome to Fantazma Network chat!', time: 'Now' },
                { user: 'SacredUser', text: 'The binaural tracks are amazing tonight!', time: '2m ago' },
                { user: 'FrequencyMaster', text: 'NEXUS system working perfectly', time: '5m ago' }
            ];

            demoMessages.forEach(function(msg) {
                this.addMessage(msg.user, msg.text, msg.time, false);
            }, this);

            var self = this;
            if (sendBtn) {
                sendBtn.addEventListener('click', function() {
                    self.sendChatMessage(input, messages);
                });
            }
            if (input) {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') self.sendChatMessage(input, messages);
                });
            }
        },

        sendChatMessage: function(input, messages) {
            var text = input ? input.value.trim() : '';
            if (!text) return;
            this.addMessage('You', text, 'Just now', true);
            if (input) input.value = '';
            var self = this;
            setTimeout(function() {
                var replies = [
                    'Interesting point!',
                    'The frequencies are aligned tonight',
                    'Sacred geometry in action!'
                ];
                var reply = replies[Math.floor(Math.random() * replies.length)];
                self.addMessage('AutoBot', reply, 'Just now', false);
            }, 1500);
        },

        addMessage: function(user, text, time, own) {
            var messages = document.getElementById('chatMessages');
            if (!messages) return;
            var div = document.createElement('div');
            div.className = 'chat-message' + (own ? ' own' : '');
            div.innerHTML = '<div class="msg-user">' + user + '</div><div class="msg-text">' + text + '</div><div class="msg-time">' + time + '</div>';
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        },

        // Video player
        initVideoPlayer: function() {
            var playBtn = document.getElementById('playBtn');
            var player = document.getElementById('videoPlayer');
            if (playBtn && player) {
                playBtn.addEventListener('click', function() {
                    player.innerHTML = '<div style="text-align:center;padding:60px;"><div style="font-size:4em;margin-bottom:20px;">&#128225;</div><h3>Live Stream Active</h3><p style="color:rgba(255,255,255,0.6);">Streaming sacred geometry visuals...</p></div>';
                });
            }
        },

        // Content library
        loadContentLibrary: function() {
            var grid = document.getElementById('contentGrid');
            if (!grid) return;
            var contents = [
                { icon: '&#127932;', title: 'Sacred Frequencies', desc: 'Binaural beats collection' },
                { icon: '&#127916;', title: 'Arousal Study Doc', desc: 'Polan et al. (2003) analysis' },
                { icon: '&#128302;', title: 'Chakra Alignment', desc: 'Energy healing sessions' },
                { icon: '&#127769;', title: 'Lunar Cycles', desc: 'Astrology programming' },
                { icon: '&#9889;', title: 'NEXUS System', desc: 'Arousal frequency tech' },
                { icon: '&#128225;', title: 'Live Broadcasts', desc: '24/7 streaming archive' }
            ];
            contents.forEach(function(item) {
                var card = document.createElement('div');
                card.className = 'content-card';
                card.innerHTML = '<div class="content-thumb">' + item.icon + '</div><div class="content-meta"><h4>' + item.title + '</h4><p>' + item.desc + '</p></div>';
                grid.appendChild(card);
            });
        },

        // TV Guide
        loadTVGuide: function() {
            var list = document.getElementById('scheduleList');
            if (!list) return;
            var schedules = [
                { time: '6:00 AM', title: 'Morning Frequencies', status: 'LIVE' },
                { time: '9:00 AM', title: 'Sacred Geometry Hour', status: 'upcoming' },
                { time: '12:00 PM', title: 'Midday Meditation', status: 'upcoming' },
                { time: '3:00 PM', title: 'NEXUS Arousal Session', status: 'upcoming' },
                { time: '6:00 PM', title: 'Evening Chakra Cleanse', status: 'upcoming' },
                { time: '9:00 PM', title: 'Night Stream', status: 'upcoming' }
            ];
            schedules.forEach(function(item) {
                var div = document.createElement('div');
                div.className = 'schedule-item';
                div.innerHTML = '<span class="schedule-time">' + item.time + '</span><span class="schedule-title">' + item.title + '</span><span class="schedule-status ' + item.status + '">' + (item.status === 'LIVE' ? '&#9679; LIVE' : 'Upcoming') + '</span>';
                list.appendChild(div);
            });
        },

        // Subscribe button
        initSubscribe: function() {
            var btn = document.getElementById('subscribeBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    alert('Stripe integration required.\n\nDemo mode: Subscription would process $1.89/month.\n\nSet up Stripe in backend for real payments.');
                });
            }
        }
    };
})();

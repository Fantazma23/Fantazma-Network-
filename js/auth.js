/**
 * Fantazma Network - Authentication Module
 * Handles login, session management, and wallet connections
 */

(function() {
    'use strict';

    var CONFIG = {
        sessionKey: 'fantazma_session',
        authKey: 'fantazma_auth',
        sessionDuration: 86400000, // 24 hours
        redirectUrl: '/fantazma-dashboard-v3.html',

        loginUrl: '/login.html'
    };

    window.FantazmaAuth = {
        // Create session
        createSession: function(userData) {
            try {
                var session = {
                    type: userData.type || 'email',
                    data: userData,
                    created: Date.now(),
                    expires: Date.now() + CONFIG.sessionDuration
                };
                localStorage.setItem(CONFIG.authKey, 'true');
                localStorage.setItem(CONFIG.sessionKey, JSON.stringify(session));
                return true;
            } catch (e) {
                console.error('Session creation failed:', e);
                return false;
            }
        },

        // Get current session
        getSession: function() {
            try {
                var auth = localStorage.getItem(CONFIG.authKey);
                var sessionStr = localStorage.getItem(CONFIG.sessionKey);
                if (auth === 'true' && sessionStr) {
                    var session = JSON.parse(sessionStr);
                    if (session.expires > Date.now()) {
                        return session;
                    }
                    // Session expired, clear it
                    this.clearSession();
                }
            } catch (e) {
                console.error('Session read failed:', e);
            }
            return null;
        },

        // Check if authenticated
        isAuthenticated: function() {
            return this.getSession() !== null;
        },

        // Clear session and logout
        clearSession: function() {
            localStorage.removeItem(CONFIG.authKey);
            localStorage.removeItem(CONFIG.sessionKey);
        },

        // Logout and redirect
        logout: function() {
            this.clearSession();
            window.location.href = CONFIG.loginUrl;
        },

        // Redirect to dashboard if authenticated
        redirectIfAuth: function() {
            if (this.isAuthenticated()) {
                window.location.href = CONFIG.redirectUrl;
                return true;
            }
            return false;
        },

        // Require auth (for protected pages)
        requireAuth: function() {
            if (!this.isAuthenticated()) {
                window.location.href = CONFIG.loginUrl;
                return false;
            }
            return true;
        },

        // Get user data
        getUser: function() {
            var session = this.getSession();
            return session ? session.data : null;
        },

        // Update session data
        updateUser: function(updates) {
            var session = this.getSession();
            if (session) {
                session.data = Object.assign(session.data || {}, updates);
                session.expires = Date.now() + CONFIG.sessionDuration;
                localStorage.setItem(CONFIG.sessionKey, JSON.stringify(session));
                return true;
            }
            return false;
        }
    };
})();

/**
 * Fantazma Network - Loader Helper
 * Ensures DOM is fully ready before initializing scripts
 */

(function() {
    'use strict';

    window.FantazmaLoader = {
        // Wait for DOM with multiple fallback methods
        ready: function(callback) {
            var called = false;
            var safeCall = function() {
                if (!called) {
                    called = true;
                    callback();
                }
            };

            // Method 1: DOMContentLoaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', safeCall);
            } else {
                safeCall();
            }

            // Method 2: window.load
            window.addEventListener('load', safeCall);

            // Method 3: Emergency fallback
            setTimeout(safeCall, 3000);
        },

        // Hide loading overlay safely
        hideOverlay: function(overlayId) {
            var overlay = document.getElementById(overlayId);
            if (overlay) {
                overlay.classList.add('hidden');
                setTimeout(function() {
                    overlay.style.display = 'none';
                }, 500);
            }
        },

        // Safe element getter with fallback
        getElement: function(id, fallback) {
            var el = document.getElementById(id);
            if (el) return el;
            if (typeof fallback === 'function') {
                return fallback();
            }
            return null;
        },

        // Error wrapper
        safe: function(fn, errorMsg) {
            try {
                return fn();
            } catch (e) {
                console.error(errorMsg || 'Operation failed:', e);
                return null;
            }
        }
    };
})();

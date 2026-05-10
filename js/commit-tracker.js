/**
 * Commit Tracker Module
 * Handles fetching and displaying recent commits from the API
 */

class CommitTracker {
    constructor(containerSelector = '.commit-tracker') {
        this.container = document.querySelector(containerSelector);
        this.itemsContainer = null;
        this.maxItems = 5; // Display max 5 commits
        this.isLoading = false;
        this.cache = {
            commits: null,
            timestamp: null,
            ttl: 5 * 60 * 1000, // 5 minute cache
        };
    }

    /**
     * Initialize the commit tracker
     */
    async init() {
        if (!this.container) {
            console.warn('Commit tracker container not found');
            return;
        }

        this.setupContainer();
        await this.loadCommits();
    }

    /**
     * Setup the HTML structure for the tracker
     */
    setupContainer() {
        // Clear existing content but keep header
        const header = this.container.querySelector('h3');
        this.container.innerHTML = '';
        if (header) {
            this.container.appendChild(header);
        }

        // Create items container
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.className = 'commit-items-container';
        this.container.appendChild(this.itemsContainer);
    }

    /**
     * Load commits from API or cache
     */
    async loadCommits() {
        // Check cache first
        if (this.isCacheValid()) {
            this.renderCommits(this.cache.commits);
            return;
        }

        this.showLoading();
        this.isLoading = true;

        try {
            const commits = await this.fetchCommits();
            
            // Cache the results
            this.cache.commits = commits;
            this.cache.timestamp = Date.now();

            this.renderCommits(commits);
        } catch (error) {
            this.showError(error.message);
            console.error('Failed to load commits:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Fetch commits from API
     */
    async fetchCommits() {
        // TODO: Replace with actual API endpoint
        // For now, using GitHub API as a fallback example
        const owner = 'Fantazma23';
        const repo = 'Fantazma-Network-';
        
        try {
            // Try custom API first
            if (typeof safeApiCall !== 'undefined') {
                try {
                    return await safeApiCall('/commits');
                } catch (error) {
                    console.warn('Custom API unavailable, falling back to GitHub API');
                }
            }

            // Fallback to GitHub API (public, no auth required for public repos)
            const response = await fetchWithRetry(
                `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${this.maxItems}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                    },
                }
            );

            const data = await response.json();

            // Transform GitHub API response to our format
            return data.map(commit => ({
                id: commit.sha,
                message: commit.commit.message.split('\n')[0], // First line only
                author: commit.commit.author.name,
                date: commit.commit.author.date,
                url: commit.html_url,
                stats: {
                    additions: 0, // GitHub API doesn't provide this in commits list
                    deletions: 0,
                },
            }));
        } catch (error) {
            throw new Error(`Failed to fetch commits: ${error.message}`);
        }
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        return this.cache.commits && 
               this.cache.timestamp && 
               Date.now() - this.cache.timestamp < this.cache.ttl;
    }

    /**
     * Render commits to the DOM
     */
    renderCommits(commits) {
        if (!commits || commits.length === 0) {
            this.showEmpty();
            return;
        }

        this.itemsContainer.innerHTML = '';

        commits.slice(0, this.maxItems).forEach(commit => {
            const element = this.createCommitElement(commit);
            this.itemsContainer.appendChild(element);
        });
    }

    /**
     * Create a commit item element
     */
    createCommitElement(commit) {
        const div = document.createElement('div');
        div.className = 'commit-item-tracker';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'commit-info';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'commit-title-tracker';
        titleDiv.textContent = commit.message;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'commit-meta';
        const date = new Date(commit.date).toLocaleDateString();
        metaDiv.textContent = `👤 ${commit.author} • ${date}`;

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(metaDiv);

        // Stats
        const statsDiv = document.createElement('div');
        statsDiv.className = 'commit-stats';

        if (commit.stats && commit.stats.additions !== undefined) {
            const addedSpan = document.createElement('span');
            addedSpan.className = 'stat-badge stat-added';
            addedSpan.textContent = `✅ +${commit.stats.additions} additions`;
            statsDiv.appendChild(addedSpan);
        }

        if (commit.stats && commit.stats.deletions !== undefined) {
            const deletedSpan = document.createElement('span');
            deletedSpan.className = 'stat-badge stat-deleted';
            deletedSpan.textContent = `❌ -${commit.stats.deletions} deletions`;
            statsDiv.appendChild(deletedSpan);
        }

        // Link button
        const linkBtn = document.createElement('a');
        linkBtn.href = commit.url;
        linkBtn.target = '_blank';
        linkBtn.rel = 'noopener noreferrer'; // Security: prevent opener access
        linkBtn.className = 'commit-link-btn';
        linkBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> View';

        div.appendChild(infoDiv);
        div.appendChild(statsDiv);
        div.appendChild(linkBtn);

        return div;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.itemsContainer.innerHTML = `
            <div class="commit-tracker-loading">
                <div class="spinner"></div>
                <p>Loading recent commits...</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.itemsContainer.innerHTML = `
            <div class="commit-tracker-error">
                <i class="fas fa-exclamation-circle"></i>
                Failed to load commits: ${message}
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmpty() {
        this.itemsContainer.innerHTML = `
            <div class="commit-tracker-empty">
                <i class="fas fa-inbox"></i>
                <p>No commits found</p>
            </div>
        `;
    }

    /**
     * Refresh commits (clear cache and reload)
     */
    async refresh() {
        this.cache.timestamp = null;
        await this.loadCommits();
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new CommitTracker('.commit-tracker');
    tracker.init();

    // Expose for manual refresh if needed
    window.commitTracker = tracker;
});

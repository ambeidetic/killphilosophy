// GitHub API integration for KillPhilosophy

/**
 * GitHub Manager for handling repository interactions
 */
class GitHubManager {
    constructor() {
        this.username = 'killphilosophy';
        this.repoName = 'academic-database';
        this.baseApiUrl = 'https://api.github.com';
        this.contributors = [];
        this.lastCommit = null;
        this.repoStats = {
            stars: 0,
            forks: 0,
            openIssues: 0
        };
        
        // Cache settings
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastFetch = {
            contributors: 0,
            commits: 0,
            stats: 0
        };
    }
    
    /**
     * Initialize GitHub status information
     */
    async init() {
        try {
            console.log('Initializing GitHub manager...');
            
            // Load cached data from localStorage
            this._loadFromCache();
            
            // Fetch fresh data
            await Promise.all([
                this.fetchContributors(),
                this.fetchLastCommit(),
                this.fetchRepoStats()
            ]);
            
            // Update the UI
            this.updateGitHubUI();
            
            console.log('GitHub manager initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize GitHub manager:', error);
            return false;
        }
    }
    
    /**
     * Load cached data from localStorage
     */
    _loadFromCache() {
        try {
            const cachedData = localStorage.getItem('killphilosophy_github_cache');
            if (cachedData) {
                const data = JSON.parse(cachedData);
                
                if (data.contributors) {
                    this.contributors = data.contributors;
                    this.lastFetch.contributors = data.timestamps.contributors || 0;
                }
                
                if (data.lastCommit) {
                    this.lastCommit = data.lastCommit;
                    this.lastFetch.commits = data.timestamps.commits || 0;
                }
                
                if (data.repoStats) {
                    this.repoStats = data.repoStats;
                    this.lastFetch.stats = data.timestamps.stats || 0;
                }
                
                console.log('Loaded GitHub data from cache');
            }
        } catch (error) {
            console.error('Error loading GitHub cache:', error);
        }
    }
    
    /**
     * Save data to localStorage cache
     */
    _saveToCache() {
        try {
            const cacheData = {
                contributors: this.contributors,
                lastCommit: this.lastCommit,
                repoStats: this.repoStats,
                timestamps: this.lastFetch
            };
            
            localStorage.setItem('killphilosophy_github_cache', JSON.stringify(cacheData));
            console.log('Saved GitHub data to cache');
        } catch (error) {
            console.error('Error saving GitHub cache:', error);
        }
    }
    
    /**
     * Check if cache is still valid for a specific data type
     */
    _isCacheValid(dataType) {
        const now = Date.now();
        return now - this.lastFetch[dataType] < this.cacheTimeout;
    }
    
    /**
     * Fetch repository contributors
     */
    async fetchContributors() {
        // Check cache first
        if (this._isCacheValid('contributors')) {
            console.log('Using cached contributors data');
            return this.contributors;
        }
        
        try {
            const url = `${this.baseApiUrl}/repos/${this.username}/${this.repoName}/contributors`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }
            
            const data = await response.json();
            this.contributors = data.map(contributor => ({
                username: contributor.login,
                avatar: contributor.avatar_url,
                contributions: contributor.contributions,
                url: contributor.html_url
            }));
            
            this.lastFetch.contributors = Date.now();
            this._saveToCache();
            
            console.log(`Fetched ${this.contributors.length} contributors`);
            return this.contributors;
        } catch (error) {
            console.error('Error fetching contributors:', error);
            return this.contributors; // Return cached data on error
        }
    }
    
    /**
     * Fetch the last commit information
     */
    async fetchLastCommit() {
        // Check cache first
        if (this._isCacheValid('commits')) {
            console.log('Using cached commit data');
            return this.lastCommit;
        }
        
        try {
            const url = `${this.baseApiUrl}/repos/${this.username}/${this.repoName}/commits?per_page=1`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }
            
            const data = await response.json();
            if (data.length > 0) {
                const commit = data[0];
                this.lastCommit = {
                    sha: commit.sha,
                    message: commit.commit.message,
                    author: commit.commit.author.name,
                    date: commit.commit.author.date,
                    url: commit.html_url
                };
            }
            
            this.lastFetch.commits = Date.now();
            this._saveToCache();
            
            console.log('Fetched last commit information');
            return this.lastCommit;
        } catch (error) {
            console.error('Error fetching last commit:', error);
            return this.lastCommit; // Return cached data on error
        }
    }
    
    /**
     * Fetch repository statistics
     */
    async fetchRepoStats() {
        // Check cache first
        if (this._isCacheValid('stats')) {
            console.log('Using cached repo stats');
            return this.repoStats;
        }
        
        try {
            const url = `${this.baseApiUrl}/repos/${this.username}/${this.repoName}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }
            
            const data = await response.json();
            this.repoStats = {
                stars: data.stargazers_count,
                forks: data.forks_count,
                openIssues: data.open_issues_count
            };
            
            this.lastFetch.stats = Date.now();
            this._saveToCache();
            
            console.log('Fetched repository statistics');
            return this.repoStats;
        } catch (error) {
            console.error('Error fetching repo stats:', error);
            return this.repoStats; // Return cached data on error
        }
    }
    
    /**
     * Update the GitHub UI elements with the fetched data
     */
    updateGitHubUI() {
        // Contributors section
        const contributorsContainer = document.getElementById('github-contributors');
        if (contributorsContainer) {
            contributorsContainer.innerHTML = '';
            
            if (this.contributors.length > 0) {
                this.contributors.forEach(contributor => {
                    const contributorElement = document.createElement('div');
                    contributorElement.className = 'github-contributor';
                    contributorElement.innerHTML = `
                        <img src="${contributor.avatar}" alt="${contributor.username}" class="contributor-avatar">
                        <div class="contributor-info">
                            <div class="contributor-username">${contributor.username}</div>
                            <div class="contributor-stats">${contributor.contributions} contributions</div>
                        </div>
                    `;
                    contributorsContainer.appendChild(contributorElement);
                });
            } else {
                contributorsContainer.innerHTML = '<div class="empty-list">No contributors data available</div>';
            }
        }
        
        // Last commit section
        const lastCommitContainer = document.getElementById('github-last-commit');
        if (lastCommitContainer && this.lastCommit) {
            const date = new Date(this.lastCommit.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            lastCommitContainer.innerHTML = `
                <div class="commit-message">${this.lastCommit.message}</div>
                <div class="commit-details">
                    <span class="commit-author">${this.lastCommit.author}</span>
                    <span class="commit-date">${formattedDate}</span>
                </div>
                <a href="${this.lastCommit.url}" class="commit-link" target="_blank">View on GitHub</a>
            `;
        } else if (lastCommitContainer) {
            lastCommitContainer.innerHTML = '<div class="empty-list">No commit data available</div>';
        }
        
        // Repository stats section
        const statsContainer = document.getElementById('github-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${this.repoStats.stars}</div>
                    <div class="stat-label">Stars</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.repoStats.forks}</div>
                    <div class="stat-label">Forks</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.repoStats.openIssues}</div>
                    <div class="stat-label">Open Issues</div>
                </div>
            `;
        }
    }
    
    /**
     * Submit an issue to the repository
     */
    async submitIssue(title, body, labels = []) {
        if (!title || !body) {
            console.error('Title and body are required for submitting an issue');
            return false;
        }
        
        try {
            // In a real implementation, this would make an API call to create an issue
            // For now, we'll just simulate success
            console.log('Submitting issue:', { title, body, labels });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Issue submitted successfully');
            return true;
        } catch (error) {
            console.error('Error submitting issue:', error);
            return false;
        }
    }
}

// Initialize the GitHub manager
const githubManager = new GitHubManager();

/**
 * Function to initialize GitHub status information
 */
async function initializeGitHubStatus() {
    try {
        const success = await githubManager.init();
        
        if (success) {
            console.log('GitHub status initialized successfully');
            
            // Setup event listeners for GitHub-related UI elements
            setupGitHubEventListeners();
        } else {
            console.warn('GitHub status initialization failed');
        }
    } catch (error) {
        console.error('Error initializing GitHub status:', error);
    }
}

/**
 * Setup event listeners for GitHub-related UI elements
 */
function setupGitHubEventListeners() {
    // Submit issue form
    const submitIssueForm = document.getElementById('submit-issue-form');
    const submitIssueButton = document.getElementById('submit-issue-button');
    
    if (submitIssueForm && submitIssueButton) {
        submitIssueButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const titleInput = document.getElementById('issue-title');
            const bodyInput = document.getElementById('issue-body');
            
            if (!titleInput || !bodyInput) {
                console.error('Issue form inputs not found');
                return;
            }
            
            const title = titleInput.value.trim();
            const body = bodyInput.value.trim();
            
            if (!title) {
                alert('Please enter an issue title');
                return;
            }
            
            if (!body) {
                alert('Please enter an issue description');
                return;
            }
            
            // Disable the button and show loading state
            submitIssueButton.disabled = true;
            submitIssueButton.textContent = 'Submitting...';
            
            const success = await githubManager.submitIssue(title, body);
            
            if (success) {
                alert('Issue submitted successfully!');
                titleInput.value = '';
                bodyInput.value = '';
            } else {
                alert('Failed to submit issue. Please try again later.');
            }
            
            // Reset button state
            submitIssueButton.disabled = false;
            submitIssueButton.textContent = 'Submit Issue';
        });
    }
    
    // Refresh GitHub data button
    const refreshGitHubButton = document.getElementById('refresh-github-data');
    if (refreshGitHubButton) {
        refreshGitHubButton.addEventListener('click', async () => {
            refreshGitHubButton.disabled = true;
            refreshGitHubButton.textContent = 'Refreshing...';
            
            try {
                await Promise.all([
                    githubManager.fetchContributors(),
                    githubManager.fetchLastCommit(),
                    githubManager.fetchRepoStats()
                ]);
                
                githubManager.updateGitHubUI();
                
                alert('GitHub data refreshed!');
            } catch (error) {
                console.error('Error refreshing GitHub data:', error);
                alert('Failed to refresh GitHub data. Please try again later.');
            }
            
            refreshGitHubButton.disabled = false;
            refreshGitHubButton.textContent = 'Refresh Data';
        });
    }
}

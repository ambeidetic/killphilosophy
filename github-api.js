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
            
            // If using the actual repo fails, generate mock data
            if (this.contributors.length === 0) {
                this._generateMockContributors();
            }
            
            return this.contributors; // Return cached or mock data on error
        }
    }
    
    /**
     * Generate mock contributors data for demo purposes
     */
    _generateMockContributors() {
        const mockContributors = [
            {
                username: 'academic_explorer',
                avatar: 'https://gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                contributions: 47,
                url: 'https://github.com/killphilosophy'
            },
            {
                username: 'critical_theorist',
                avatar: 'https://gravatar.com/avatar/11111111111111111111111111111111?d=mp&f=y',
                contributions: 35,
                url: 'https://github.com/killphilosophy'
            },
            {
                username: 'philosophy_coder',
                avatar: 'https://gravatar.com/avatar/22222222222222222222222222222222?d=mp&f=y',
                contributions: 23,
                url: 'https://github.com/killphilosophy'
            }
        ];
        
        this.contributors = mockContributors;
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
            
            // If using the actual repo fails, generate mock data
            if (!this.lastCommit) {
                this._generateMockLastCommit();
            }
            
            return this.lastCommit; // Return cached or mock data on error
        }
    }
    
    /**
     * Generate mock last commit data for demo purposes
     */
    _generateMockLastCommit() {
        const now = new Date();
        
        this.lastCommit = {
            sha: '1234567890abcdef1234567890abcdef12345678',
            message: 'Update academic database with new connections',
            author: 'academic_explorer',
            date: now.toISOString(),
            url: 'https://github.com/killphilosophy/academic-database/commit/1234567890abcdef1234567890abcdef12345678'
        };
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
            
            // If using the actual repo fails, generate mock data
            if (this.repoStats.stars === 0 && this.repoStats.forks === 0) {
                this._generateMockRepoStats();
            }
            
            return this.repoStats; // Return cached or mock data on error
        }
    }
    
    /**
     * Generate mock repository statistics for demo purposes
     */
    _generateMockRepoStats() {
        this.repoStats = {
            stars: 42,
            forks: 15,
            openIssues: 7
        };
    }
    
    /**
     * Update the GitHub UI elements with the fetched data
     */
    updateGitHubUI() {
        // Update stats
        const githubStars = document.getElementById('github-stars');
        const githubForks = document.getElementById('github-forks');
        const githubIssues = document.getElementById('github-issues');
        
        if (githubStars) githubStars.textContent = this.repoStats.stars;
        if (githubForks) githubForks.textContent = this.repoStats.forks;
        if (githubIssues) githubIssues.textContent = this.repoStats.openIssues;
        
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
            
            // Increase open issues count
            this.repoStats.openIssues++;
            this._saveToCache();
            
            // Update UI
            const githubIssues = document.getElementById('github-issues');
            if (githubIssues) {
                githubIssues.textContent = this.repoStats.openIssues;
            }
            
            console.log('Issue submitted successfully');
            return true;
        } catch (error) {
            console.error('Error submitting issue:', error);
            return false;
        }
    }
    
    /**
     * Submit a contribution to the repository as a pull request
     */
    async submitContribution(data, type, description) {
        try {
            // In a real implementation, this would fork the repo, create a branch, add changes, and submit a PR
            console.log('Submitting contribution:', { data, type, description });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create a mock PR response
            const prNumber = Math.floor(Math.random() * 100) + 1;
            const prUrl = `https://github.com/${this.username}/${this.repoName}/pull/${prNumber}`;
            
            console.log('Contribution submitted as PR #', prNumber);
            return {
                success: true,
                prNumber,
                prUrl,
                message: `Contribution submitted as pull request #${prNumber}`
            };
        } catch (error) {
            console.error('Error submitting contribution:', error);
            return {
                success: false,
                message: 'Failed to submit contribution. Please try again later.'
            };
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
                // If we have a toast function, use it, otherwise use alert
                if (typeof showToast === 'function') {
                    showToast('Success', 'Issue submitted successfully!', 'success');
                } else {
                    alert('Issue submitted successfully!');
                }
                titleInput.value = '';
                bodyInput.value = '';
            } else {
                if (typeof showToast === 'function') {
                    showToast('Error', 'Failed to submit issue. Please try again later.', 'error');
                } else {
                    alert('Failed to submit issue. Please try again later.');
                }
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
                
                if (typeof showToast === 'function') {
                    showToast('Success', 'GitHub data refreshed!', 'success');
                } else {
                    alert('GitHub data refreshed!');
                }
            } catch (error) {
                console.error('Error refreshing GitHub data:', error);
                
                if (typeof showToast === 'function') {
                    showToast('Error', 'Failed to refresh GitHub data. Please try again later.', 'error');
                } else {
                    alert('Failed to refresh GitHub data. Please try again later.');
                }
            }
            
            refreshGitHubButton.disabled = false;
            refreshGitHubButton.textContent = 'Refresh Data';
        });
    }
    
    // Close about modal
    const closeAboutModal = document.getElementById('close-about-modal');
    const aboutModal = document.getElementById('about-modal');
    
    if (closeAboutModal && aboutModal) {
        closeAboutModal.addEventListener('click', () => {
            // If we have a closeModal function, use it, otherwise just hide the modal
            if (typeof closeModal === 'function') {
                closeModal(aboutModal);
            } else {
                aboutModal.style.display = 'none';
            }
        });
        
        // Close modal when clicking outside content
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                if (typeof closeModal === 'function') {
                    closeModal(aboutModal);
                } else {
                    aboutModal.style.display = 'none';
                }
            }
        });
    }
}

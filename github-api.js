/**
 * GitHub API Integration for KillPhilosophy
 * 
 * This module handles interactions with the GitHub API for storing and retrieving
 * the academic database. It manages authentication, file operations, and pull requests.
 */

class GitHubManager {
    constructor() {
        this.apiBaseUrl = 'https://api.github.com';
        this.repoOwner = '';
        this.repoName = '';
        this.token = null;
        this.isAuthenticated = false;
        this.branchName = 'main';
        
        // Log for operations
        this.operationLog = [];
        
        // Load settings from localStorage
        this._loadSettings();
    }
    
    /**
     * Load GitHub settings from localStorage
     * @private
     */
    _loadSettings() {
        try {
            const repoString = localStorage.getItem('killphilosophy_github_repo');
            const token = localStorage.getItem('killphilosophy_github_token');
            
            if (repoString) {
                const [owner, name] = repoString.split('/');
                this.repoOwner = owner;
                this.repoName = name;
            }
            
            if (token) {
                this.token = token;
                this.isAuthenticated = true;
            }
        } catch (error) {
            console.error('Error loading GitHub settings:', error);
        }
    }
    
    /**
     * Save GitHub settings to localStorage
     */
    saveSettings(repoOwner, repoName, token = null) {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        
        if (token) {
            this.token = token;
            this.isAuthenticated = true;
        }
        
        try {
            localStorage.setItem('killphilosophy_github_repo', `${repoOwner}/${repoName}`);
            if (token) {
                localStorage.setItem('killphilosophy_github_token', token);
            }
        } catch (error) {
            console.error('Error saving GitHub settings:', error);
        }
        
        return true;
    }
    
    /**
     * Log an operation with timestamp
     * @param {string} message - Operation message
     * @param {string} type - Log type ('info', 'error', 'success')
     */
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        
        this.operationLog.unshift(logEntry);
        
        // Keep log size manageable
        if (this.operationLog.length > 100) {
            this.operationLog = this.operationLog.slice(0, 100);
        }
        
        // Update log display if element exists
        const logElement = document.getElementById('github-log-content');
        if (logElement) {
            this._updateLogDisplay();
        }
    }
    
    /**
     * Update the log display
     * @private
     */
    _updateLogDisplay() {
        const logElement = document.getElementById('github-log-content');
        if (!logElement) return;
        
        logElement.innerHTML = this.operationLog.map(entry => {
            const timeString = new Date(entry.timestamp).toLocaleTimeString();
            let classString = '';
            
            if (entry.type === 'error') classString = 'log-error';
            if (entry.type === 'success') classString = 'log-success';
            
            return `<div class="log-entry ${classString}">[${timeString}] ${entry.message}</div>`;
        }).join('');
    }
    
    /**
     * Generate headers for API requests
     * @param {boolean} includeAuth - Whether to include authentication
     * @returns {Object} - Headers object
     * @private
     */
    _getHeaders(includeAuth = true) {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        
        return headers;
    }
    
    /**
     * Make a request to the GitHub API with improved error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - Response data
     * @private
     */
    async _request(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                let errorMessage = '';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || response.statusText;
                } catch (e) {
                    errorMessage = response.statusText || `HTTP error ${response.status}`;
                }
                
                throw new Error(`GitHub API error (${response.status}): ${errorMessage}`);
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            this.log(`API Error: ${error.message}`, 'error');
            
            // Show UI error message
            this._showErrorMessage(error.message);
            
            throw error;
        }
    }
    
    /**
     * Display error message in the UI
     * @private
     */
    _showErrorMessage(message) {
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'github-error error-message';
        errorElement.textContent = message;
        
        // Find a suitable container to show the error
        const containers = [
            document.getElementById('github-status-panel'),
            document.getElementById('contribution-result'),
            document.querySelector('.github-link')
        ];
        
        // Use the first available container
        for (const container of containers) {
            if (container) {
                // Remove any existing error messages
                const existingErrors = container.querySelectorAll('.github-error');
                existingErrors.forEach(el => el.remove());
                
                // Add the new error
                container.appendChild(errorElement);
                
                // Auto-remove after 10 seconds
                setTimeout(() => {
                    errorElement.style.opacity = '0';
                    setTimeout(() => errorElement.remove(), 1000);
                }, 10000);
                
                break;
            }
        }
    }
    
    /**
     * Check if the repository exists and is accessible
     * @returns {Promise<boolean>} - Whether the repository is accessible
     */
    async checkRepository() {
        if (!this.repoOwner || !this.repoName) {
            this.log('Repository information is incomplete', 'error');
            return false;
        }
        
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}`;
            const options = {
                method: 'GET',
                headers: this._getHeaders(this.isAuthenticated)
            };
            
            await this._request(endpoint, options);
            this.log(`Successfully connected to repository ${this.repoOwner}/${this.repoName}`, 'success');
            return true;
        } catch (error) {
            this.log(`Repository check failed: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Get the repository structure
     * @returns {Promise<Object>} - Repository structure
     */
    async getRepositoryStructure() {
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents`;
            const options = {
                method: 'GET',
                headers: this._getHeaders(this.isAuthenticated)
            };
            
            const contents = await this._request(endpoint, options);
            return contents;
        } catch (error) {
            this.log(`Failed to get repository structure: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Get a file from the repository
     * @param {string} path - File path
     * @returns {Promise<Object>} - File content and metadata
     */
    async getFile(path) {
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;
            const options = {
                method: 'GET',
                headers: this._getHeaders(this.isAuthenticated)
            };
            
            const fileData = await this._request(endpoint, options);
            
            // Decode content if it's base64 encoded
            if (fileData.content && fileData.encoding === 'base64') {
                fileData.decodedContent = atob(fileData.content.replace(/\n/g, ''));
            }
            
            return fileData;
        } catch (error) {
            this.log(`Failed to get file ${path}: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Create or update a file in the repository
     * @param {string} path - File path
     * @param {string} content - File content
     * @param {string} message - Commit message
     * @param {string} sha - SHA of the file being replaced (for updates)
     * @returns {Promise<Object>} - Commit data
     */
    async createOrUpdateFile(path, content, message, sha = null) {
        if (!this.isAuthenticated) {
            this.log('Authentication required to create or update files', 'error');
            throw new Error('Authentication required');
        }
        
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;
            
            const requestBody = {
                message,
                content: btoa(content),
                branch: this.branchName
            };
            
            if (sha) {
                requestBody.sha = sha;
            }
            
            const options = {
                method: 'PUT',
                headers: this._getHeaders(),
                body: JSON.stringify(requestBody)
            };
            
            const response = await this._request(endpoint, options);
            
            this.log(`Successfully ${sha ? 'updated' : 'created'} file ${path}`, 'success');
            return response;
        } catch (error) {
            this.log(`Failed to ${sha ? 'update' : 'create'} file ${path}: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Get the database file from the repository
     * @returns {Promise<Object>} - Database data
     */
    async getDatabase() {
        try {
            const fileData = await this.getFile('database/academics.json');
            
            if (fileData.decodedContent) {
                return JSON.parse(fileData.decodedContent);
            }
            
            throw new Error('Could not decode database file');
        } catch (error) {
            // If file doesn't exist, return empty database
            if (error.message.includes('404')) {
                this.log('Database file does not exist yet, will be created on first save', 'info');
                return { academics: {}, noveltyTiles: [], taxonomyCategories: {} };
            }
            
            this.log(`Failed to get database: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Save the database to the repository
     * @param {Object} databaseData - Database data
     * @returns {Promise<boolean>} - Success indicator
     */
    async saveDatabase(databaseData) {
        if (!this.isAuthenticated) {
            this.log('Authentication required to save database', 'error');
            return false;
        }
        
        try {
            // Check if database file exists
            let sha = null;
            try {
                const fileData = await this.getFile('database/academics.json');
                sha = fileData.sha;
            } catch (error) {
                // File doesn't exist, will be created
                this.log('Database file will be created', 'info');
            }
            
            // Create or update database file
            const content = JSON.stringify(databaseData, null, 2);
            const message = 'Update academic database';
            
            await this.createOrUpdateFile('database/academics.json', content, message, sha);
            
            this.log('Database saved successfully', 'success');
            return true;
        } catch (error) {
            this.log(`Failed to save database: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Create a fork of the repository
     * @returns {Promise<Object>} - Fork data
     */
    async createFork() {
        if (!this.isAuthenticated) {
            this.log('Authentication required to create fork', 'error');
            throw new Error('Authentication required');
        }
        
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/forks`;
            const options = {
                method: 'POST',
                headers: this._getHeaders()
            };
            
            const response = await this._request(endpoint, options);
            
            this.log(`Repository forked successfully to ${response.full_name}`, 'success');
            return response;
        } catch (error) {
            this.log(`Failed to create fork: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Create a new branch
     * @param {string} branchName - Branch name
     * @param {string} fromBranch - Branch to create from
     * @returns {Promise<Object>} - Branch data
     */
    async createBranch(branchName, fromBranch = 'main') {
        if (!this.isAuthenticated) {
            this.log('Authentication required to create branch', 'error');
            throw new Error('Authentication required');
        }
        
        try {
            // Get the SHA of the latest commit on the source branch
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/git/refs/heads/${fromBranch}`;
            const options = {
                method: 'GET',
                headers: this._getHeaders()
            };
            
            const sourceRef = await this._request(endpoint, options);
            const sha = sourceRef.object.sha;
            
            // Create the new branch
            const createEndpoint = `/repos/${this.repoOwner}/${this.repoName}/git/refs`;
            const createOptions = {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha
                })
            };
            
            const response = await this._request(createEndpoint, createOptions);
            
            this.log(`Branch ${branchName} created successfully`, 'success');
            return response;
        } catch (error) {
            this.log(`Failed to create branch: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Create a pull request
     * @param {string} title - PR title
     * @param {string} body - PR description
     * @param {string} head - Head branch
     * @param {string} base - Base branch
     * @returns {Promise<Object>} - Pull request data
     */
    async createPullRequest(title, body, head, base = 'main') {
        if (!this.isAuthenticated) {
            this.log('Authentication required to create pull request', 'error');
            throw new Error('Authentication required');
        }
        
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/pulls`;
            const options = {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify({
                    title,
                    body,
                    head,
                    base
                })
            };
            
            const response = await this._request(endpoint, options);
            
            this.log(`Pull request created successfully: "${title}"`, 'success');
            return response;
        } catch (error) {
            this.log(`Failed to create pull request: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Enhanced submit function with proper error handling
     */
    async submitAcademicInfo(academicName, infoType, infoData, username = 'anonymous') {
        if (!this.repoOwner || !this.repoName) {
            const error = 'Repository information is incomplete';
            this.log(error, 'error');
            this._showErrorMessage(error);
            
            return {
                success: false,
                message: error
            };
        }
        
        try {
            // Generate a unique branch name
            const timestamp = Date.now();
            const sanitizedAcademicName = academicName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const branchName = `contribution/${sanitizedAcademicName}-${infoType}-${timestamp}`;
            
            // For unauthenticated users, we'll just return a simulated result
            if (!this.isAuthenticated) {
                this.log('Simulating pull request creation (no authentication)', 'info');
                return {
                    success: true,
                    simulated: true,
                    message: 'Contribution recorded locally. Connect with GitHub to submit directly to the repository.',
                    prTitle: `Add ${infoType} to ${academicName}`,
                    branchName
                };
            }
            
            // If authenticated, create an actual pull request
            
            // 1. Get the current database
            let database;
            try {
                database = await this.getDatabase();
            } catch (error) {
                // If database doesn't exist, create a basic structure
                database = {
                    academics: {},
                    noveltyTiles: [],
                    taxonomyCategories: {}
                };
            }
            
            // 2. Create a new branch
            await this.createBranch(branchName);
            this.branchName = branchName; // Set current branch for subsequent operations
            
            // 3. Update the academic in the database
            const normalizedName = academicName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            
            if (!database.academics[normalizedName]) {
                database.academics[normalizedName] = {
                    name: academicName,
                    papers: [],
                    events: [],
                    connections: [],
                    taxonomies: {}
                };
            }
            
            // Add info based on type
            switch (infoType) {
                case 'paper':
                    database.academics[normalizedName].papers.push(infoData);
                    break;
                case 'event':
                    database.academics[normalizedName].events.push(infoData);
                    break;
                case 'connection':
                    database.academics[normalizedName].connections.push(infoData);
                    break;
                case 'taxonomy':
                    const { category, value } = infoData;
                    if (!database.academics[normalizedName].taxonomies[category]) {
                        database.academics[normalizedName].taxonomies[category] = [];
                    }
                    database.academics[normalizedName].taxonomies[category].push(value);
                    break;
            }
            
            // 4. Save the updated database
            await this.saveDatabase(database);
            
            // 5. Create a pull request
            const prTitle = `Add ${infoType} to ${academicName}`;
            let prBody = `This pull request adds new ${infoType} information to ${academicName}.

Information details:
\`\`\`json
${JSON.stringify(infoData, null, 2)}
\`\`\`

Contributed by: ${username}`;

            const pullRequest = await this.createPullRequest(prTitle, prBody, branchName);
            
            // Reset to main branch
            this.branchName = 'main';
            
            return {
                success: true,
                message: 'Contribution submitted as a pull request',
                pullRequest
            };
        } catch (error) {
            this.log(`Failed to submit academic info: ${error.message}`, 'error');
            this.branchName = 'main'; // Reset to main branch
            
            // Show UI error
            this._showErrorMessage(`Failed to submit information: ${error.message}`);
            
            return {
                success: false,
                message: `Failed to submit information: ${error.message}`
            };
        }
    }
    
    /**
     * Get open pull requests
     * @returns {Promise<Array>} - Array of pull requests
     */
    async getPullRequests() {
        try {
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/pulls?state=open`;
            const options = {
                method: 'GET',
                headers: this._getHeaders(this.isAuthenticated)
            };
            
            const pullRequests = await this._request(endpoint, options);
            
            this.log(`Retrieved ${pullRequests.length} open pull requests`, 'success');
            return pullRequests;
        } catch (error) {
            this.log(`Failed to get pull requests: ${error.message}`, 'error');
            return [];
        }
    }
    
    /**
     * Sync local database with GitHub (if authenticated)
     * @param {Object} localDatabase - Local database object
     * @returns {Promise<Object>} - Sync result
     */
    async syncDatabase(localDatabase) {
        if (!this.isAuthenticated) {
            this.log('Authentication required to sync database', 'error');
            return {
                success: false,
                message: 'Authentication required'
            };
        }
        
        try {
            // Get the remote database
            let remoteDatabase;
            try {
                remoteDatabase = await this.getDatabase();
                this.log('Retrieved remote database', 'success');
            } catch (error) {
                // If remote database doesn't exist, use the local one
                remoteDatabase = {
                    academics: {},
                    noveltyTiles: [],
                    taxonomyCategories: {}
                };
                this.log('Remote database not found, will create from local', 'info');
            }
            
            // Check if the local database is newer or has more entries
            const localAcademicCount = Object.keys(localDatabase.academics).length;
            const remoteAcademicCount = Object.keys(remoteDatabase.academics).length;
            
            // If local has more entries, push to remote
            if (localAcademicCount > remoteAcademicCount) {
                this.log(`Local database has ${localAcademicCount} academics, remote has ${remoteAcademicCount}. Pushing to remote.`, 'info');
                await this.saveDatabase(localDatabase);
                return {
                    success: true,
                    message: 'Local database pushed to remote',
                    operation: 'push'
                };
            }
            // If remote has more entries, pull to local
            else if (remoteAcademicCount > localAcademicCount) {
                this.log(`Remote database has ${remoteAcademicCount} academics, local has ${localAcademicCount}. Pulling to local.`, 'info');
                return {
                    success: true,
                    message: 'Remote database pulled to local',
                    operation: 'pull',
                    database: remoteDatabase
                };
            }
            // If they have the same number of entries, merge changes
            else {
                this.log('Merging local and remote databases', 'info');
                
                // Simple merge strategy: combine academics from both
                const mergedAcademics = {...remoteDatabase.academics};
                
                // For each local academic, update or add to merged
                for (const [key, academic] of Object.entries(localDatabase.academics)) {
                    if (mergedAcademics[key]) {
                        // Merge papers, events, connections if local has more
                        if (academic.papers?.length > mergedAcademics[key].papers?.length) {
                            mergedAcademics[key].papers = academic.papers;
                        }
                        if (academic.events?.length > mergedAcademics[key].events?.length) {
                            mergedAcademics[key].events = academic.events;
                        }
                        if (academic.connections?.length > mergedAcademics[key].connections?.length) {
                            mergedAcademics[key].connections = academic.connections;
                        }
                        
                        // Merge taxonomies
                        if (academic.taxonomies) {
                            mergedAcademics[key].taxonomies = mergedAcademics[key].taxonomies || {};
                            for (const [category, values] of Object.entries(academic.taxonomies)) {
                                mergedAcademics[key].taxonomies[category] = mergedAcademics[key].taxonomies[category] || [];
                                // Add any values not already in the remote
                                for (const value of values) {
                                    if (!mergedAcademics[key].taxonomies[category].includes(value)) {
                                        mergedAcademics[key].taxonomies[category].push(value);
                                    }
                                }
                            }
                        }
                    } else {
                        // Academic doesn't exist in remote, add it
                        mergedAcademics[key] = academic;
                    }
                }
                
                // Create merged database
                const mergedDatabase = {
                    academics: mergedAcademics,
                    noveltyTiles: localDatabase.noveltyTiles.length > remoteDatabase.noveltyTiles.length 
                        ? localDatabase.noveltyTiles 
                        : remoteDatabase.noveltyTiles,
                    taxonomyCategories: {...remoteDatabase.taxonomyCategories}
                };
                
                // Save merged database to remote
                await this.saveDatabase(mergedDatabase);
                
                return {
                    success: true,
                    message: 'Databases merged and saved',
                    operation: 'merge',
                    database: mergedDatabase
                };
            }
        } catch (error) {
            this.log(`Database sync failed: ${error.message}`, 'error');
            return {
                success: false,
                message: `Sync failed: ${error.message}`
            };
        }
    }
}

// Initialize GitHub manager
const githubManager = new GitHubManager();

// Make it available globally
window.githubManager = githubManager;

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

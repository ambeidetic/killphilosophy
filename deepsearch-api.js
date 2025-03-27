// DeepSearch API with improved error handling
async search(query, options = {}) {
    try {
        // Default options
        const defaultOptions = {
            stream: true,
            depth: 'medium', // 'basic', 'medium', or 'deep'
            academicFilters: {
                papers: true,
                events: true,
                citations: true,
                influences: true
            }
        };

        // Merge default options with user options
        const searchOptions = { ...defaultOptions, ...options };

        // Construct the message content based on search parameters
        let content = query;
        
        // If searching for connections between two academics
        if (options.academicName1 && options.academicName2) {
            content = `Analyze the connections between ${options.academicName1} and ${options.academicName2}.`;
        } else if (options.academicName1) {
            content = `Provide information about ${options.academicName1}`;
        }

        // Add depth parameter to refine the search
        if (searchOptions.depth === 'deep') {
            content += ' Include comprehensive details, obscure connections, and thorough analysis.';
        } else if (searchOptions.depth === 'basic') {
            content += ' Provide a brief overview with essential information only.';
        }

        // Include filter specifications
        if (!searchOptions.academicFilters.papers) {
            content += ' Exclude papers and publications.';
        }
        if (!searchOptions.academicFilters.events) {
            content += ' Exclude events and appearances.';
        }
        if (!searchOptions.academicFilters.citations) {
            content += ' Exclude citation information.';
        }
        if (!searchOptions.academicFilters.influences) {
            content += ' Exclude information about academic influences.';
        }

        // Prepare the request payload
        const payload = {
            model: this.model,
            messages: [{ role: 'user', content: content }],
            stream: searchOptions.stream
        };

        // Validate API key before making request
        if (!this.apiKey || this.apiKey.trim() === '') {
            throw new Error('No API key provided. Please configure your API key first.');
        }

        // Make the API request
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Try to get detailed error message
            let errorMessage = `API request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = `API Error: ${errorData.message}`;
                } else if (errorData.error) {
                    errorMessage = `API Error: ${errorData.error}`;
                }
            } catch (e) {
                // If we can't parse JSON, use response status text
                errorMessage = `API Error: ${response.statusText || 'Unknown error'}`;
            }
            
            throw new Error(errorMessage);
        }

        // Handle streaming responses
        if (searchOptions.stream) {
            return response.body;
        } else {
            // For non-streaming, return the full response
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('DeepSearch error:', error);
        
        // Show error in UI
        this._showErrorMessage(error.message);
        
        throw error;
    }
}

/**
 * Display error message in the UI
 * @private
 */
_showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    const resultsContainer = document.getElementById('deep-search-results');
    if (resultsContainer) {
        // Clear previous errors
        const existingErrors = resultsContainer.querySelectorAll('.error-message');
        existingErrors.forEach(el => el.remove());
        
        // Add new error
        resultsContainer.prepend(errorElement);
        
        // Hide progress indicator
        const progressContainer = document.querySelector('.search-status-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            errorElement.style.opacity = '0';
            setTimeout(() => errorElement.remove(), 1000);
        }, 10000);
    }
}

/**
 * Improved initialization with API key validation 
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize API key configuration
    setupApiKeyConfiguration();
    
    // Initialize DeepSearch
    initializeDeepSearch();
    
    // Add validation for API key before search
    const runDeepSearchButton = document.getElementById('run-deep-search');
    if (runDeepSearchButton) {
        const originalClickHandler = runDeepSearchButton.onclick;
        runDeepSearchButton.onclick = function(e) {
            // Prevent default if there's no API key
            if (!deepSearchAPI.apiKey || deepSearchAPI.apiKey.trim() === '') {
                e.preventDefault();
                e.stopPropagation();
                
                // Show API key configuration
                const apiKeyConfig = document.getElementById('api-key-config');
                if (apiKeyConfig) {
                    apiKeyConfig.classList.add('visible');
                    
                    // Show error message
                    const errorElement = document.createElement('div');
                    errorElement.className = 'error-message';
                    errorElement.textContent = 'Please configure your API key first.';
                    apiKeyConfig.prepend(errorElement);
                    
                    // Auto-remove error after 5 seconds
                    setTimeout(() => {
                        errorElement.remove();
                    }, 5000);
                } else {
                    alert('Please configure your API key first.');
                }
                
                return false;
            }
            
            // If we have an API key, proceed with original handler
            if (typeof originalClickHandler === 'function') {
                return originalClickHandler.call(this, e);
            }
        };
    }
});

// Enhanced API key configuration
function setupApiKeyConfiguration() {
    const apiKeyLink = document.getElementById('api-key-link');
    const apiKeyConfig = document.getElementById('api-key-config');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    
    if (!apiKeyLink || !apiKeyConfig || !apiKeyInput || !saveApiKeyButton) return;
    
    // Toggle API key configuration visibility
    apiKeyLink.addEventListener('click', (e) => {
        e.preventDefault();
        apiKeyConfig.classList.toggle('visible');
    });
    
    // Save API key
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            // Update the API key in the DeepSearchAPI instance
            if (typeof deepSearchAPI !== 'undefined') {
                deepSearchAPI.apiKey = apiKey;
                
                // Store in localStorage for persistence
                try {
                    localStorage.setItem('jina_deepsearch_api_key', apiKey);
                    
                    // Show confirmation
                    const confirmationElement = document.createElement('div');
                    confirmationElement.className = 'success-message';
                    confirmationElement.textContent = 'API key saved successfully!';
                    apiKeyConfig.prepend(confirmationElement);
                    
                    // Auto-remove after 3 seconds
                    setTimeout(() => {
                        confirmationElement.remove();
                        apiKeyConfig.classList.remove('visible');
                    }, 3000);
                    
                } catch (error) {
                    console.error('Error saving API key to localStorage:', error);
                    alert('API key saved for this session, but could not be saved permanently.');
                }
            }
        } else {
            // Show error for empty API key
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Please enter a valid API key.';
            apiKeyConfig.prepend(errorElement);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                errorElement.remove();
            }, 3000);
        }
    });
    
    // Load stored API key on page load
    try {
        const storedApiKey = localStorage.getItem('jina_deepsearch_api_key');
        if (storedApiKey) {
            apiKeyInput.value = storedApiKey;
            
            // Update the API key in the DeepSearchAPI instance
            if (typeof deepSearchAPI !== 'undefined') {
                deepSearchAPI.apiKey = storedApiKey;
            }
        }
    } catch (error) {
        console.error('Error loading API key from localStorage:', error);
    }
}

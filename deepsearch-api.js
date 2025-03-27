/**
 * DeepSearch API Integration for KillPhilosophy
 * 
 * This module handles interactions with AI services to perform deep searches
 * and analysis of academics, their connections, and intellectual traditions.
 */

class DeepSearchAPI {
    constructor() {
        this.endpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-opus-20240229';
        this.apiKey = null;
        this.maxTokens = 4000;
        
        // Load API key from localStorage if available
        this._loadApiKey();
    }
    
    /**
     * Load API key from localStorage
     * @private
     */
    _loadApiKey() {
        try {
            const storedApiKey = localStorage.getItem('killphilosophy_deepsearch_api_key');
            if (storedApiKey) {
                this.apiKey = storedApiKey;
                console.log('DeepSearch API key loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading API key from localStorage:', error);
        }
    }
    
    /**
     * Save API key to localStorage
     * @param {string} apiKey - API key
     */
    saveApiKey(apiKey) {
        if (!apiKey) return false;
        
        this.apiKey = apiKey;
        
        try {
            localStorage.setItem('killphilosophy_deepsearch_api_key', apiKey);
            console.log('DeepSearch API key saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving API key to localStorage:', error);
            return false;
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
     * Display success message in the UI
     * @private
     */
    _showSuccessMessage(message) {
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        
        const resultsContainer = document.getElementById('deep-search-results');
        if (resultsContainer) {
            resultsContainer.prepend(successElement);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                successElement.style.opacity = '0';
                setTimeout(() => successElement.remove(), 1000);
            }, 5000);
        }
    }
    
    /**
     * Perform a deep search with improved error handling
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object|ReadableStream>} - Search results or stream
     */
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
                max_tokens: this.maxTokens,
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
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
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
     * Process and handle the streaming response
     * @param {ReadableStream} stream - Response stream
     * @param {function} onChunk - Callback for each chunk
     * @param {function} onComplete - Callback when stream is complete
     * @param {function} onError - Callback for errors
     */
    async handleStream(stream, onChunk, onComplete, onError) {
        try {
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let resultText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                // Process complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last incomplete line in the buffer
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6); // Remove 'data: ' prefix
                        
                        if (data === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            if (parsed.content) {
                                resultText += parsed.content;
                                
                                // Call the onChunk callback
                                if (typeof onChunk === 'function') {
                                    onChunk(parsed.content);
                                }
                            }
                        } catch (parseError) {
                            console.error('Error parsing stream data:', parseError);
                        }
                    }
                }
            }
            
            // Process any remaining content in the buffer
            if (buffer && buffer.startsWith('data: ')) {
                const data = buffer.slice(6);
                
                if (data !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(data);
                        
                        if (parsed.content) {
                            resultText += parsed.content;
                            
                            // Call the onChunk callback
                            if (typeof onChunk === 'function') {
                                onChunk(parsed.content);
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing final stream data:', parseError);
                    }
                }
            }
            
            // Call the onComplete callback
            if (typeof onComplete === 'function') {
                onComplete(resultText);
            }
            
            return resultText;
        } catch (error) {
            console.error('Error handling stream:', error);
            
            // Call the onError callback
            if (typeof onError === 'function') {
                onError(error);
            } else {
                this._showErrorMessage(`Error reading response: ${error.message}`);
            }
            
            throw error;
        }
    }
    
    /**
     * Update progress bar in the UI
     * @param {number} value - Progress value (0-100)
     */
    updateProgressBar(value) {
        const progressBar = document.querySelector('.deep-search-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${value}%`;
        }
    }
    
    /**
     * Extract academic information from search results
     * @param {string} text - Search result text
     * @returns {Object|null} - Extracted academic data or null if not found
     */
    extractAcademicData(text) {
        try {
            // Check if text contains academic information
            if (!text || !text.includes('name') || !text.includes('bio')) {
                return null;
            }
            
            // Try to find JSON data
            const jsonMatch = text.match(/```json([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const jsonData = JSON.parse(jsonMatch[1].trim());
                    if (jsonData.name) {
                        return jsonData;
                    }
                } catch (jsonError) {
                    console.error('Error parsing JSON from result:', jsonError);
                }
            }
            
            // Try to extract academic data using heuristics
            const academic = {
                name: '',
                bio: '',
                taxonomies: {},
                papers: [],
                events: [],
                connections: []
            };
            
            // Extract name
            const nameMatch = text.match(/(?:name|Name|NAME)[:\s]+([^\n]+)/);
            if (nameMatch) {
                academic.name = nameMatch[1].trim();
            }
            
            // Extract bio
            const bioMatch = text.match(/(?:bio|Bio|BIO|Biography|biography|BIOGRAPHY)[:\s]+([^\n]+(?:\n(?!Papers|Events|Connections|Taxonomies|papers|events|connections|taxonomies).+)*)/);
            if (bioMatch) {
                academic.bio = bioMatch[1].trim();
            }
            
            // Extract papers
            const papersMatch = text.match(/(?:papers|Papers|PAPERS)[:\s]+([\s\S]*?)(?:(?:events|Events|EVENTS|connections|Connections|CONNECTIONS|taxonomies|Taxonomies|TAXONOMIES)|$)/i);
            if (papersMatch) {
                const papersText = papersMatch[1].trim();
                const paperItems = papersText.split(/\n\s*[-*•]\s*/);
                
                for (const item of paperItems) {
                    if (item.trim()) {
                        // Try to extract year
                        const yearMatch = item.match(/\((\d{4})\)/) || item.match(/,\s*(\d{4})/);
                        const year = yearMatch ? parseInt(yearMatch[1]) : null;
                        
                        // Remove year from title
                        let title = item.replace(/\(\d{4}\)/, '').replace(/,\s*\d{4}/, '').trim();
                        
                        // Extract coauthors if present
                        const coauthors = [];
                        const coauthorsMatch = title.match(/with\s+([^\.]+)/i);
                        if (coauthorsMatch) {
                            const coauthorsText = coauthorsMatch[1];
                            coauthors.push(...coauthorsText.split(/(?:,|\sand\s)/g).map(c => c.trim()).filter(c => c));
                            title = title.replace(/with\s+([^\.]+)/i, '').trim();
                        }
                        
                        academic.papers.push({
                            title,
                            year: year || 0,
                            coauthors
                        });
                    }
                }
            }
            
            // Extract connections
            const connectionsMatch = text.match(/(?:connections|Connections|CONNECTIONS)[:\s]+([\s\S]*?)(?:(?:events|Events|EVENTS|papers|Papers|PAPERS|taxonomies|Taxonomies|TAXONOMIES)|$)/i);
            if (connectionsMatch) {
                const connectionsText = connectionsMatch[1].trim();
                const connectionItems = connectionsText.split(/\n\s*[-*•]\s*/);
                
                for (const item of connectionItems) {
                    const connection = item.trim();
                    if (connection) {
                        academic.connections.push(connection.replace(/^\d+\.\s*/, ''));
                    }
                }
            }
            
            return academic;
        } catch (error) {
            console.error('Error extracting academic data:', error);
            return null;
        }
    }
}

// Initialize the DeepSearch API
const deepSearchAPI = new DeepSearchAPI();

// Make it available globally
window.deepSearchAPI = deepSearchAPI;

// Initialize API key configuration when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup API key configuration
    setupApiKeyConfiguration();
    
    // Initialize DeepSearch interface
    initializeDeepSearch();
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
                deepSearchAPI.saveApiKey(apiKey);
                
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
        const storedApiKey = localStorage.getItem('killphilosophy_deepsearch_api_key');
        if (storedApiKey) {
            apiKeyInput.value = storedApiKey;
        }
    } catch (error) {
        console.error('Error loading API key from localStorage:', error);
    }
}

// Initialize DeepSearch functionality
function initializeDeepSearch() {
    const runDeepSearchButton = document.getElementById('run-deep-search');
    const deepSearchInput = document.getElementById('deep-search-input');
    const deepSearchResults = document.getElementById('deep-search-results');
    const searchStatusContainer = document.querySelector('.search-status-container');
    
    if (!runDeepSearchButton || !deepSearchInput || !deepSearchResults) return;
    
    // Add validation for API key before search
    runDeepSearchButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const query = deepSearchInput.value.trim();
        if (!query) {
            deepSearchAPI._showErrorMessage('Please enter a search query');
            return;
        }
        
        // Validate API key
        if (!deepSearchAPI.apiKey || deepSearchAPI.apiKey.trim() === '') {
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
                deepSearchAPI._showErrorMessage('Please configure your API key first');
            }
            return;
        }
        
        // Clear previous results
        deepSearchResults.innerHTML = '<div class="deep-search-result-content"></div>';
        const resultContent = deepSearchResults.querySelector('.deep-search-result-content');
        
        // Show search status
        if (searchStatusContainer) {
            searchStatusContainer.style.display = 'block';
            deepSearchAPI.updateProgressBar(5);
        }
        
        try {
            // Run the search
            const stream = await deepSearchAPI.search(query, {
                stream: true,
                depth: document.getElementById('search-depth')?.value || 'medium'
            });
            
            // Process the stream
            let progress = 10;
            await deepSearchAPI.handleStream(
                stream,
                // On chunk
                (chunk) => {
                    if (resultContent) {
                        resultContent.innerHTML += chunk;
                        resultContent.scrollTop = resultContent.scrollHeight;
                    }
                    
                    // Update progress
                    progress += 5;
                    if (progress > 90) progress = 90;
                    deepSearchAPI.updateProgressBar(progress);
                },
                // On complete
                (fullText) => {
                    // Update progress to 100%
                    deepSearchAPI.updateProgressBar(100);
                    
                    // Hide status after a short delay
                    setTimeout(() => {
                        if (searchStatusContainer) {
                            searchStatusContainer.style.display = 'none';
                        }
                    }, 1000);
                    
                    // Try to extract academic data
                    const academicData = deepSearchAPI.extractAcademicData(fullText);
                    if (academicData && academicData.name) {
                        // Add a button to save to database
                        const saveButton = document.createElement('button');
                        saveButton.className = 'save-academic-btn';
                        saveButton.textContent = `Save ${academicData.name} to Database`;
                        saveButton.addEventListener('click', () => {
                            if (typeof databaseManager !== 'undefined') {
                                const success = databaseManager.addOrUpdateAcademic(academicData);
                                if (success) {
                                    deepSearchAPI._showSuccessMessage(`${academicData.name} saved to database`);
                                    
                                    // Add a novelty tile
                                    databaseManager.addNoveltyTile({
                                        title: `New Academic: ${academicData.name}`,
                                        content: `Discovered and added ${academicData.name} to the database`,
                                        date: new Date().toISOString(),
                                        type: 'academic'
                                    });
                                } else {
                                    deepSearchAPI._showErrorMessage(`Failed to save ${academicData.name} to database`);
                                }
                            } else {
                                deepSearchAPI._showErrorMessage('Database manager not available');
                            }
                        });
                        
                        deepSearchResults.appendChild(saveButton);
                    }
                },
                // On error
                (error) => {
                    if (searchStatusContainer) {
                        searchStatusContainer.style.display = 'none';
                    }
                    deepSearchAPI._showErrorMessage(`Search error: ${error.message}`);
                }
            );
        } catch (error) {
            console.error('Error during deep search:', error);
            
            if (searchStatusContainer) {
                searchStatusContainer.style.display = 'none';
            }
            
            deepSearchAPI._showErrorMessage(`Search failed: ${error.message}`);
        }
    });
}

// DeepSearch API integration for KillPhilosophy
class DeepSearchAPI {
    constructor() {
        // Store the API key (in a real production environment, use more secure methods)
        this.apiKey = 'jina_3e0cba1e1cd14761b53309d362e69bf3yeToVynAVCMHf-CpFgwq_NE1UKzs';
        this.endpoint = 'https://deepsearch.jina.ai/v1/chat/completions';
        this.model = 'jina-deepsearch-v1';
    }

    /**
     * Perform a deep search query
     * @param {string} query - User's search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>} - Search results
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
                stream: searchOptions.stream
            };

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
                const errorData = await response.json();
                throw new Error(`DeepSearch API error: ${errorData.message || response.statusText}`);
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
            throw error;
        }
    }

    /**
     * Process a streaming search response
     * @param {ReadableStream} stream - The response stream
     * @param {Function} onChunk - Callback for each chunk of data
     * @param {Function} onComplete - Callback when stream is complete
     * @param {Function} onError - Callback for errors
     */
    async processStream(stream, onChunk, onComplete, onError) {
        try {
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    // Process any remaining data in the buffer
                    if (buffer.length > 0) {
                        onChunk(buffer);
                        result += buffer;
                    }
                    break;
                }

                // Decode the current chunk and add to buffer
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Process any complete messages in the buffer
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last potentially incomplete line in the buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        // Skip [DONE] message which indicates the stream is complete
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            // Extract the content from the message
                            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                const content = parsed.choices[0].delta.content;
                                onChunk(content);
                                result += content;
                            }
                        } catch (e) {
                            console.warn('Error parsing stream data:', e);
                        }
                    }
                }
            }

            // Call onComplete with the complete result
            onComplete(result);
        } catch (error) {
            console.error('Error processing stream:', error);
            onError(error);
        }
    }
}

// Initialize the DeepSearch API when the page loads
const deepSearchAPI = new DeepSearchAPI();

// Connect the DeepSearch API to the UI
function initializeDeepSearch() {
    const runDeepSearchButton = document.getElementById('run-deep-search');
    const searchProgressText = document.getElementById('search-progress-text');
    const searchProgressBar = document.querySelector('.deep-search-progress-bar');
    const searchStatusContainer = document.querySelector('.search-status-container');
    const deepSearchResults = document.getElementById('deep-search-results');
    
    if (!runDeepSearchButton) return;

    runDeepSearchButton.addEventListener('click', async () => {
        // Get search parameters from the UI
        const academic1 = document.getElementById('search-academic1').value.trim();
        const academic2 = document.getElementById('search-academic2').value.trim();
        const depth = document.getElementById('search-depth').value;
        
        // Get filter checkboxes (assuming the structure from index.html)
        const filterCheckboxes = document.querySelectorAll('.form-field input[type="checkbox"]');
        const filters = {
            papers: filterCheckboxes[0].checked,
            events: filterCheckboxes[1].checked,
            citations: filterCheckboxes[2].checked,
            influences: filterCheckboxes[3].checked
        };

        // Validate inputs
        if (!academic1) {
            alert('Please enter at least one academic name to search.');
            return;
        }

        // Prepare search options
        const searchOptions = {
            academicName1: academic1,
            academicName2: academic2 || null,
            depth: depth,
            academicFilters: filters
        };

        // Show search status
        searchStatusContainer.style.display = 'block';
        searchProgressText.textContent = 'Initializing deep search...';
        searchProgressBar.style.width = '10%';
        
        // Create a results container
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'deep-search-result';
        resultsDiv.innerHTML = '<div class="deep-search-thinking"></div><div class="deep-search-content"></div>';
        
        // Clear previous results and add the new container
        deepSearchResults.innerHTML = '';
        deepSearchResults.appendChild(resultsDiv);
        
        const thinkingDiv = resultsDiv.querySelector('.deep-search-thinking');
        const contentDiv = resultsDiv.querySelector('.deep-search-content');
        
        try {
            // Start the search
            searchProgressText.textContent = 'Searching academic databases...';
            searchProgressBar.style.width = '30%';
            
            // Call the API
            const stream = await deepSearchAPI.search(academic1, searchOptions);
            
            // Update UI
            searchProgressText.textContent = 'Processing results...';
            searchProgressBar.style.width = '60%';
            
            let isProcessingThinking = false;
            let thinkingContent = '';
            let finalContent = '';
            
            // Process the streaming response
            await deepSearchAPI.processStream(
                stream,
                // OnChunk callback
                (chunk) => {
                    // Check if chunk contains thinking markers
                    if (chunk.includes('<think>') || isProcessingThinking) {
                        isProcessingThinking = true;
                        
                        // Check if thinking section ends
                        if (chunk.includes('</think>')) {
                            isProcessingThinking = false;
                            const parts = chunk.split('</think>');
                            thinkingContent += parts[0];
                            
                            // Update thinking display
                            thinkingDiv.innerHTML = thinkingContent.replace('<think>', '');
                            
                            // Add any content after </think> to the main content
                            if (parts.length > 1 && parts[1]) {
                                finalContent += parts[1];
                                contentDiv.innerHTML = finalContent;
                            }
                        } else {
                            thinkingContent += chunk;
                            thinkingDiv.innerHTML = thinkingContent.replace('<think>', '');
                        }
                    } else {
                        finalContent += chunk;
                        contentDiv.innerHTML = finalContent;
                    }
                    
                    // Update progress
                    searchProgressBar.style.width = '80%';
                },
                // OnComplete callback
                (result) => {
                    searchProgressText.textContent = 'Search complete!';
                    searchProgressBar.style.width = '100%';
                    
                    // Hide progress after a delay
                    setTimeout(() => {
                        searchStatusContainer.style.display = 'none';
                        searchProgressBar.style.width = '0%';
                    }, 2000);
                    
                    // Process and enhance results
                    enhanceSearchResults(contentDiv, academic1, academic2);
                },
                // OnError callback
                (error) => {
                    searchProgressText.textContent = 'Error: ' + error.message;
                    searchProgressBar.style.width = '0%';
                    contentDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
                }
            );
        } catch (error) {
            searchProgressText.textContent = 'Error: ' + error.message;
            searchProgressBar.style.width = '0%';
            resultsDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        }
    });
}

/**
 * Enhance search results with interactive elements
 * @param {HTMLElement} contentElement - The content element to enhance
 * @param {string} academic1 - First academic name
 * @param {string} academic2 - Second academic name (optional)
 */
function enhanceSearchResults(contentElement, academic1, academic2) {
    if (!contentElement) return;
    
    // Highlight academic names and key terms
    highlightTerms(contentElement, [academic1, academic2].filter(Boolean));
    
    // Add connection analysis section if comparing two academics
    if (academic2) {
        addConnectionAnalysis(contentElement, academic1, academic2);
    }
}

/**
 * Highlight academic names and key terms in the content
 * @param {HTMLElement} element - The content element
 * @param {Array<string>} terms - Terms to highlight
 */
function highlightTerms(element, terms) {
    // Skip if no element or terms
    if (!element || !terms || terms.length === 0) return;
    
    // Get the HTML content
    let content = element.innerHTML;
    
    // Create a regex pattern for all terms
    const pattern = new RegExp(`(${terms.map(term => escapeRegExp(term)).join('|')})`, 'gi');
    
    // Replace matches with highlighted version
    content = content.replace(pattern, '<span class="highlight">$1</span>');
    
    // Set the updated content
    element.innerHTML = content;
}

/**
 * Escape special characters in string for use in regex
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Add connection analysis section to search results
 * @param {HTMLElement} element - The content element
 * @param {string} academic1 - First academic name
 * @param {string} academic2 - Second academic name
 */
function addConnectionAnalysis(element, academic1, academic2) {
    // Skip if missing any required parameter
    if (!element || !academic1 || !academic2) return;
    
    // Create connection analysis section
    const analysisSection = document.createElement('div');
    analysisSection.className = 'connection-analysis';
    
    // Add content to the analysis section
    analysisSection.innerHTML = `
        <h3>Connection Strength Analysis</h3>
        <div class="connection-strength-indicator">
            <div class="connection-strength-label">Philosophical Influence</div>
            <div class="connection-strength-bar">
                <div class="connection-strength-bar-fill" style="width: 85%"></div>
            </div>
            <div class="connection-strength-value">85%</div>
        </div>
        <div class="connection-strength-indicator">
            <div class="connection-strength-label">Methodological Overlap</div>
            <div class="connection-strength-bar">
                <div class="connection-strength-bar-fill" style="width: 70%"></div>
            </div>
            <div class="connection-strength-value">70%</div>
        </div>
        <div class="connection-strength-indicator">
            <div class="connection-strength-label">Conceptual Resonance</div>
            <div class="connection-strength-bar">
                <div class="connection-strength-bar-fill" style="width: 60%"></div>
            </div>
            <div class="connection-strength-value">60%</div>
        </div>
    `;
    
    // Append the analysis section to the content element
    element.appendChild(analysisSection);
}

// Setup API key configuration
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
                } catch (error) {
                    console.error('Error saving API key to localStorage:', error);
                }
                
                // Hide configuration
                apiKeyConfig.classList.remove('visible');
                
                // Show confirmation
                showGlitchEffect();
                setTimeout(() => {
                    alert('API key saved successfully!');
                }, 300);
            }
        } else {
            alert('Please enter a valid API key.');
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize API key configuration
    setupApiKeyConfiguration();
    
    // Initialize DeepSearch
    initializeDeepSearch();
});

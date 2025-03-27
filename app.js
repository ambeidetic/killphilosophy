// Enhanced initialization for KillPhilosophy application

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing KillPhilosophy application...');
    
    // Check for browser compatibility
    checkFeatureSupport();
    
    // Initialize database
    initializeDatabase();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set Search as the default and only visible view
    hideAllSections();
    setActiveNavItem('nav-search');
    document.getElementById('search-container').style.display = 'block';
    
    // Initialize terminal cursor blinking
    initializeTerminalCursor();
    
    // Initialize network visualization
    initializeNetworkVisualization();
    
    // Initialize logo animation
    initializeLogoAnimation();
    
    // Load search history
    loadSearchHistory();
    
    // Check for admin access
    checkAdminAccess();
});

/**
 * Check for browser feature support
 */
function checkFeatureSupport() {
    // Check for localStorage support
    const localStorageSupported = checkLocalStorageSupport();
    if (!localStorageSupported) {
        console.warn('localStorage not supported. Data will not be saved between sessions.');
    }
    
    // Check for Fetch API
    const fetchSupported = 'fetch' in window;
    if (!fetchSupported) {
        console.warn('Fetch API not supported. GitHub and DeepSearch features will be limited.');
        disableAPIFeatures();
    }
    
    // Check for ES6 features
    const es6Supported = typeof Symbol !== 'undefined';
    if (!es6Supported) {
        console.warn('ES6 not fully supported. Some features may not work correctly.');
    }
}

/**
 * Disable API-dependent features when not supported
 */
function disableAPIFeatures() {
    // Hide Deep Search container
    const deepSearchContainer = document.getElementById('deep-search-container');
    if (deepSearchContainer) {
        deepSearchContainer.innerHTML = '<div class="error-message">Deep Search requires a modern browser with Fetch API support.</div>';
    }
    
    // Disable Deep Search navigation
    const navDeepSearch = document.getElementById('nav-deep-search');
    if (navDeepSearch) {
        navDeepSearch.classList.add('disabled');
        navDeepSearch.setAttribute('aria-disabled', 'true');
        navDeepSearch.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Deep Search requires a modern browser with Fetch API support.');
        }, { capture: true });
    }
}

/**
 * Check for localStorage support
 */
function checkLocalStorageSupport() {
    try {
        const testKey = 'test';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Enhanced setActiveNavItem function to handle ARIA attributes
 */
function setActiveNavItem(id) {
    // Remove active class from all nav items
    document.querySelectorAll('nav a').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
    });
    
    // Add active class to selected nav item
    const navItem = document.getElementById(id);
    if (navItem) {
        navItem.classList.add('active');
        navItem.setAttribute('aria-pressed', 'true');
    }
    
    // Make all navigation items visible since we've navigated past the initial state
    const navItems = document.querySelectorAll('nav a');
    navItems.forEach(item => {
        item.style.display = 'inline-block';
    });
}

/**
 * Persistent search history
 */
let commandHistory = [];
let historyIndex = -1;

function loadSearchHistory() {
    try {
        const history = localStorage.getItem('killphilosophy_searchHistory');
        if (history) {
            commandHistory = JSON.parse(history);
            updateCommandHistoryDisplay();
        }
    } catch (error) {
        console.error('Error loading search history:', error);
    }
}

function saveSearchHistory() {
    try {
        localStorage.setItem('killphilosophy_searchHistory', JSON.stringify(commandHistory));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

/**
 * Update search functionality to save history
 */
window.handleSearch = function(query) {
    if (!query || query.trim() === '') return;
    
    // Add to command history if not already the most recent
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== query) {
        commandHistory.push(query);
        // Keep command history manageable
        if (commandHistory.length > 20) {
            commandHistory = commandHistory.slice(-20);
        }
        historyIndex = -1;
        updateCommandHistoryDisplay();
        
        // Save search history
        saveSearchHistory();
    }
    
    // Rest of the existing handleSearch function...
    console.log(`Searching for: "${query}"`);
    
    // Show search status
    const searchStatus = document.querySelector('.search-status');
    if (searchStatus) {
        searchStatus.style.display = 'block';
        document.querySelector('.search-status-text').textContent = `Searching for "${query}"...`;
    }
    
    // Simulate search delay for effect (matches the retro aesthetic)
    setTimeout(() => {
        // Search the database
        if (typeof databaseManager !== 'undefined') {
            const academic = databaseManager.getAcademic(query);
            
            if (academic) {
                // Academic found - display profile
                displayAcademic(academic);
                
                // Hide search status
                if (searchStatus) {
                    searchStatus.style.display = 'none';
                }
                
                // Switch to academic profile view
                hideAllSections();
                document.getElementById('results-container').style.display = 'block';
            } else {
                // No direct match, try a broader search
                const results = databaseManager.searchAcademics({ name: query });
                
                if (results && results.length > 0) {
                    // Matches found - display first result
                    displayAcademic(results[0]);
                    
                    // Hide search status
                    if (searchStatus) {
                        searchStatus.style.display = 'none';
                    }
                    
                    // Switch to academic profile view
                    hideAllSections();
                    document.getElementById('results-container').style.display = 'block';
                } else {
                    // No matches found
                    if (searchStatus) {
                        searchStatus.style.display = 'block';
                        document.querySelector('.search-status-text').textContent = `No results found for "${query}"`;
                    }
                }
            }
        } else {
            // Database not available
            if (searchStatus) {
                searchStatus.style.display = 'block';
                document.querySelector('.search-status-text').textContent = 'Database not available. Please try again later.';
            }
        }
    }, 800); // 800ms delay for retro terminal effect
};

// Debounce function for performance optimization
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Enhanced search listeners with debouncing
 */
function setupSearchListeners() {
    const searchBox = document.querySelector('.search-box');
    const suggestionsContainer = document.querySelector('.suggestions-container');
    const commandHistoryList = document.querySelector('.command-history-list');
    const searchStatus = document.querySelector('.search-status');
    
    if (!searchBox) return;
    
    // Add debounced input handler for better performance
    searchBox.addEventListener('input', debounce(() => {
        const query = searchBox.value.trim();
        
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        // Get matching academics
        const academics = databaseManager.getAllAcademics();
        const matches = academics.filter(academic => 
            academic.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions
        
        // Display suggestions
        if (matches.length > 0) {
            suggestionsContainer.innerHTML = '';
            matches.forEach((academic, index) => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.setAttribute('role', 'option');
                suggestion.setAttribute('aria-selected', 'false');
                suggestion.textContent = academic.name;
                suggestion.addEventListener('click', () => {
                    searchBox.value = academic.name;
                    suggestionsContainer.innerHTML = '';
                    handleSearch(academic.name);
                });
                suggestionsContainer.appendChild(suggestion);
            });
            
            // Add ARIA attributes to suggestions container
            suggestionsContainer.setAttribute('role', 'listbox');
            suggestionsContainer.setAttribute('aria-label', 'Search suggestions');
        } else {
            suggestionsContainer.innerHTML = '';
        }
    }, 300));
    
    // Rest of the existing setup function...
}

/**
 * Check admin access
 */
function checkAdminAccess() {
    // Check if URL has admin parameter
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    
    // Check if localStorage has admin flag
    const adminFlag = localStorage.getItem('killphilosophy_admin');
    
    // Show admin link if either check passes
    if (adminParam === 'true' || adminFlag === 'true') {
        const adminLink = document.getElementById('nav-admin');
        if (adminLink) {
            adminLink.style.display = 'inline-block';
            
            // Add event listener if not already added
            if (!adminLink.hasAttribute('data-listener-added')) {
                adminLink.addEventListener('click', navAdminHandler);
                adminLink.setAttribute('data-listener-added', 'true');
            }
        }
        
        // Store admin flag in localStorage for persistence
        localStorage.setItem('killphilosophy_admin', 'true');
    }
}

/**
 * Admin navigation handler
 */
function navAdminHandler() {
    showGlitchEffect();
    hideAllSections();
    document.getElementById('admin-container').style.display = 'block';
    setActiveNavItem('nav-admin');
}

// Make sure the logo works correctly as a home button
function initializeLogoAnimation() {
    const mainLogo = document.getElementById('main-logo');
    if (!mainLogo) return;
    
    mainLogo.addEventListener('click', () => {
        console.log('Logo clicked, returning to home view');
        
        // Reset to home view
        hideAllSections();
        document.getElementById('search-container').style.display = 'block';
        setActiveNavItem('nav-search');
        
        // Focus the search box
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.focus();
        }
        
        // Add animation class
        mainLogo.classList.add('animated');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            mainLogo.classList.remove('animated');
        }, 2000);
        
        // Show glitch effect
        showGlitchEffect();
    });
}

// Update event listener setup
function setupEventListeners() {
    // Navigation event listeners
    document.getElementById('nav-search').addEventListener('click', navSearchHandler);
    document.getElementById('nav-novelty-tiles').addEventListener('click', navNoveltyHandler);
    document.getElementById('nav-database').addEventListener('click', navDatabaseHandler);
    document.getElementById('nav-deep-search').addEventListener('click', navDeepSearchHandler);
    document.getElementById('nav-about').addEventListener('click', navAboutHandler);
    document.getElementById('nav-contribute').addEventListener('click', navContributeHandler);
    
    // Rest of the existing setup function...
}

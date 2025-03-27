// Main application script for KillPhilosophy

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing KillPhilosophy application...');
    
    // Initialize database
    initializeDatabase();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set Search as the default and only visible view
    hideAllSections();
    setActiveNavItem('nav-search');
    document.getElementById('search-container').style.display = 'block';
    
    // Hide all navigation items except Search
    hideNonSearchNavItems();
});

/**
 * Initialize the database with academic data
 */
function initializeDatabase() {
    console.log('Initializing database...');
    
    // This ensures databaseManager exists and is populated
    if (typeof databaseManager !== 'undefined') {
        console.log(`Database initialized with ${Object.keys(databaseManager.academics).length} academics.`);
    } else {
        console.error('Database manager not found. Ensure database.js is loaded properly.');
    }
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Navigation event listeners
    document.getElementById('nav-search').addEventListener('click', navSearchHandler);
    
    // Search box event listener
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(searchBox.value);
            }
        });
    }
    
    // Academic profile event listeners (for when search results are clicked)
    setupAcademicProfileListeners();
}

/**
 * Hide all navigation items except Search
 */
function hideNonSearchNavItems() {
    const navItems = document.querySelectorAll('nav a:not(#nav-search)');
    navItems.forEach(item => {
        item.style.display = 'none';
    });
}

/**
 * Set the active navigation item
 */
function setActiveNavItem(id) {
    // Remove active class from all nav items
    document.querySelectorAll('nav a').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected nav item
    const navItem = document.getElementById(id);
    if (navItem) {
        navItem.classList.add('active');
    }
}

/**
 * Hide all main content sections
 */
function hideAllSections() {
    const sections = [
        'search-container',
        'academic-profile',
        'database-browser',
        'novelty-tiles-container',
        'deep-search-container',
        'admin-container',
        'github-status-panel'
    ];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

/**
 * Handle the search function
 */
function handleSearch(query) {
    if (!query || query.trim() === '') {
        return; // Empty query, do nothing
    }
    
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
                document.getElementById('academic-profile').style.display = 'block';
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
                    document.getElementById('academic-profile').style.display = 'block';
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
}

/**
 * Display academic profile
 */
function displayAcademic(academic) {
    console.log('Displaying academic profile:', academic.name);
    
    // Set name
    const nameElement = document.getElementById('academic-name');
    if (nameElement) {
        nameElement.textContent = academic.name;
    }
    
    // Set bio
    const bioElement = document.getElementById('academic-bio');
    if (bioElement) {
        bioElement.textContent = academic.bio;
    }
    
    // Set taxonomies
    const taxonomiesContainer = document.getElementById('taxonomies-list');
    if (taxonomiesContainer) {
        taxonomiesContainer.innerHTML = '';
        
        if (academic.taxonomies) {
            for (const category in academic.taxonomies) {
                const values = academic.taxonomies[category];
                values.forEach(value => {
                    const tag = document.createElement('div');
                    tag.className = 'taxonomy-tag';
                    tag.textContent = `${category}: ${value}`;
                    taxonomiesContainer.appendChild(tag);
                });
            }
        }
    }
    
    // Set papers
    const papersContainer = document.getElementById('papers-list');
    if (papersContainer) {
        papersContainer.innerHTML = '';
        
        if (academic.papers && academic.papers.length > 0) {
            academic.papers.forEach(paper => {
                const paperElement = document.createElement('div');
                paperElement.className = 'paper-item';
                
                const title = document.createElement('div');
                title.className = 'paper-title';
                title.textContent = paper.title;
                
                const metadata = document.createElement('div');
                metadata.className = 'paper-metadata';
                metadata.textContent = `Year: ${paper.year}`;
                
                if (paper.coauthors && paper.coauthors.length > 0) {
                    metadata.textContent += ` | Coauthors: ${paper.coauthors.join(', ')}`;
                }
                
                paperElement.appendChild(title);
                paperElement.appendChild(metadata);
                papersContainer.appendChild(paperElement);
            });
        } else {
            papersContainer.innerHTML = '<div class="empty-list">No papers listed</div>';
        }
    }
    
    // Set events
    const eventsContainer = document.getElementById('events-list');
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
        
        if (academic.events && academic.events.length > 0) {
            academic.events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                
                const title = document.createElement('div');
                title.className = 'event-title';
                title.textContent = event.title;
                
                const metadata = document.createElement('div');
                metadata.className = 'event-metadata';
                metadata.textContent = `Year: ${event.year}`;
                
                if (event.location) {
                    metadata.textContent += ` | Location: ${event.location}`;
                }
                
                eventElement.appendChild(title);
                eventElement.appendChild(metadata);
                eventsContainer.appendChild(eventElement);
            });
        } else {
            eventsContainer.innerHTML = '<div class="empty-list">No events listed</div>';
        }
    }
    
    // Set connections
    const connectionsContainer = document.getElementById('connections-list');
    if (connectionsContainer) {
        connectionsContainer.innerHTML = '';
        
        if (academic.connections && academic.connections.length > 0) {
            academic.connections.forEach(connection => {
                const connectionElement = document.createElement('div');
                connectionElement.className = 'connection-item';
                
                const name = document.createElement('div');
                name.className = 'connection-name';
                name.textContent = connection;
                name.addEventListener('click', () => {
                    const connectedAcademic = databaseManager.getAcademic(connection);
                    if (connectedAcademic) {
                        displayAcademic(connectedAcademic);
                    }
                });
                
                connectionElement.appendChild(name);
                connectionsContainer.appendChild(connectionElement);
            });
        } else {
            connectionsContainer.innerHTML = '<div class="empty-list">No connections listed</div>';
        }
    }
    
    // Add glitch effect when displaying profile
    showGlitchEffect();
}

/**
 * Set up event listeners for the academic profile
 */
function setupAcademicProfileListeners() {
    // Add Information button
    const addInfoBtn = document.getElementById('add-info-btn');
    const addInfoForm = document.getElementById('add-info-form');
    
    if (addInfoBtn && addInfoForm) {
        addInfoBtn.addEventListener('click', () => {
            if (addInfoForm.style.display === 'block') {
                addInfoForm.style.display = 'none';
            } else {
                addInfoForm.style.display = 'block';
            }
        });
    }
    
    // Form type selector
    const infoType = document.getElementById('info-type');
    if (infoType) {
        infoType.addEventListener('change', () => {
            updateFormFields(infoType.value);
        });
    }
    
    // Submit button
    const submitInfo = document.getElementById('submit-info');
    if (submitInfo) {
        submitInfo.addEventListener('click', handleInfoSubmission);
    }
}

/**
 * Update form fields based on selected information type
 */
function updateFormFields(type) {
    // Hide all field groups
    document.querySelectorAll('.paper-field, .event-field, .connection-field, .taxonomy-field').forEach(field => {
        field.style.display = 'none';
    });
    
    // Show relevant fields based on type
    if (type === 'paper') {
        document.querySelectorAll('.paper-field').forEach(field => {
            field.style.display = 'block';
        });
    } else if (type === 'event') {
        document.querySelectorAll('.event-field').forEach(field => {
            field.style.display = 'block';
        });
    } else if (type === 'connection') {
        document.querySelectorAll('.connection-field').forEach(field => {
            field.style.display = 'block';
        });
    } else if (type === 'taxonomy') {
        document.querySelectorAll('.taxonomy-field').forEach(field => {
            field.style.display = 'block';
        });
    }
    
    // Show GitHub fields if contribution is checked
    const contributeCheckbox = document.getElementById('contribute-to-github');
    if (contributeCheckbox && contributeCheckbox.checked) {
        document.querySelector('.github-identity').style.display = 'block';
    }
}

/**
 * Handle information submission
 */
function handleInfoSubmission() {
    // Get current academic name
    const academicName = document.getElementById('academic-name').textContent;
    if (!academicName) {
        alert('No academic selected.');
        return;
    }
    
    // Get info type
    const infoType = document.getElementById('info-type').value;
    let infoData = {};
    
    // Gather information based on type
    if (infoType === 'paper') {
        const title = document.getElementById('paper-title').value;
        const year = parseInt(document.getElementById('paper-year').value);
        
        if (!title || isNaN(year)) {
            alert('Please enter a valid title and year.');
            return;
        }
        
        infoData = {
            title,
            year,
            coauthors: []
        };
    } else if (infoType === 'event') {
        const title = document.getElementById('event-title').value;
        const year = parseInt(document.getElementById('event-date').value);
        const location = document.getElementById('event-location').value;
        
        if (!title || isNaN(year)) {
            alert('Please enter a valid title and year.');
            return;
        }
        
        infoData = {
            title,
            year,
            location
        };
    } else if (infoType === 'connection') {
        const name = document.getElementById('connection-name').value;
        
        if (!name) {
            alert('Please enter a valid academic name.');
            return;
        }
        
        infoData = name;
    } else if (infoType === 'taxonomy') {
        const category = document.getElementById('taxonomy-category').value;
        const value = document.getElementById('taxonomy-value').value;
        
        if (!category || !value) {
            alert('Please enter a valid category and value.');
            return;
        }
        
        infoData = {
            category,
            value
        };
    }
    
    // Update the academic in the database
    const academic = databaseManager.getAcademic(academicName);
    if (academic) {
        if (infoType === 'paper') {
            if (!academic.papers) {
                academic.papers = [];
            }
            academic.papers.push(infoData);
        } else if (infoType === 'event') {
            if (!academic.events) {
                academic.events = [];
            }
            academic.events.push(infoData);
        } else if (infoType === 'connection') {
            if (!academic.connections) {
                academic.connections = [];
            }
            academic.connections.push(infoData);
        } else if (infoType === 'taxonomy') {
            if (!academic.taxonomies) {
                academic.taxonomies = {};
            }
            if (!academic.taxonomies[infoData.category]) {
                academic.taxonomies[infoData.category] = [];
            }
            academic.taxonomies[infoData.category].push(infoData.value);
        }
        
        // Update display
        displayAcademic(academic);
        
        // Save changes
        databaseManager.saveToLocalStorage();
        
        // Hide form
        document.getElementById('add-info-form').style.display = 'none';
        
        // Show success message with glitch effect
        showGlitchEffect();
        setTimeout(() => {
            alert('Information added successfully!');
        }, 300);
    }
}

/**
 * Handle navigation to search view
 */
function navSearchHandler() {
    showGlitchEffect();
    hideAllSections();
    document.getElementById('search-container').style.display = 'block';
    setActiveNavItem('nav-search');
    
    // Focus the search box
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.focus();
    }
}

/**
 * Show a visual glitch effect (reusing from original code)
 */
function showGlitchEffect() {
    const glitchElement = document.createElement('div');
    glitchElement.className = 'screen-glitch';
    document.body.appendChild(glitchElement);
    
    setTimeout(() => {
        glitchElement.remove();
    }, 500);
}

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
    
    // Initialize terminal cursor blinking
    initializeTerminalCursor();
    
    // Initialize network visualization
    initializeNetworkVisualization();
    
    // Initialize logo animation
    initializeLogoAnimation();
});

/**
 * Initialize the database with academic data
 */
function initializeDatabase() {
    console.log('Initializing database...');
    
    // This ensures databaseManager exists and is populated
    if (typeof databaseManager !== 'undefined') {
        console.log(`Database initialized with ${Object.keys(databaseManager.academics).length} academics.`);
        
        // Update database stats
        updateDatabaseStats();
    } else {
        console.error('Database manager not found. Ensure database.js is loaded properly.');
    }
}

/**
 * Update database statistics
 */
function updateDatabaseStats() {
    const dbCountElement = document.getElementById('db-count');
    const connectionsCountElement = document.getElementById('connections-count');
    const publicationsCountElement = document.getElementById('publications-count');
    
    if (!dbCountElement || !connectionsCountElement || !publicationsCountElement) return;
    
    const academics = databaseManager.getAllAcademics();
    
    // Total academics count
    dbCountElement.textContent = academics.length;
    
    // Total connections count
    let totalConnections = 0;
    academics.forEach(academic => {
        if (academic.connections) {
            totalConnections += academic.connections.length;
        }
    });
    connectionsCountElement.textContent = totalConnections;
    
    // Total publications count
    let totalPublications = 0;
    academics.forEach(academic => {
        if (academic.papers) {
            totalPublications += academic.papers.length;
        }
    });
    publicationsCountElement.textContent = totalPublications;
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Navigation event listeners
    document.getElementById('nav-search').addEventListener('click', navSearchHandler);
    document.getElementById('nav-novelty-tiles').addEventListener('click', navNoveltyHandler);
    document.getElementById('nav-database').addEventListener('click', navDatabaseHandler);
    document.getElementById('nav-deep-search').addEventListener('click', navDeepSearchHandler);
    document.getElementById('nav-about').addEventListener('click', navAboutHandler);
    document.getElementById('nav-contribute').addEventListener('click', navContributeHandler);
    
    // Search box event listeners
    setupSearchListeners();
    
    // Academic profile event listeners
    setupAcademicProfileListeners();
    
    // Novelty tiles event listeners
    setupNoveltyTilesListeners();
    
    // Database browser event listeners
    setupDatabaseBrowserListeners();
    
    // Navigation handlers to show the visualization section
    document.querySelectorAll('a[href="#visualization"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            document.getElementById('visualization-container').style.display = 'block';
            setActiveNavItem('nav-visualization');
        });
    });
    
    // Modal close handlers
    document.getElementById('close-about-modal').addEventListener('click', () => {
        document.getElementById('about-modal').style.display = 'none';
    });
    
    document.getElementById('close-contribution-modal').addEventListener('click', () => {
        document.getElementById('contribution-modal').style.display = 'none';
    });
    
    // Close modals when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

/**
 * Set up enhanced search box functionality
 */
function setupSearchListeners() {
    const searchBox = document.querySelector('.search-box');
    const suggestionsContainer = document.querySelector('.suggestions-container');
    const commandHistoryList = document.querySelector('.command-history-list');
    const searchStatus = document.querySelector('.search-status');
    
    if (!searchBox) return;
    
    // Command history for search
    let commandHistory = [];
    let historyIndex = -1;
    
    // Search suggestions
    searchBox.addEventListener('input', () => {
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
            matches.forEach(academic => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.textContent = academic.name;
                suggestion.addEventListener('click', () => {
                    searchBox.value = academic.name;
                    suggestionsContainer.innerHTML = '';
                    handleSearch(academic.name);
                });
                suggestionsContainer.appendChild(suggestion);
            });
        } else {
            suggestionsContainer.innerHTML = '';
        }
    });
    
    // Handle key navigation for search
    searchBox.addEventListener('keydown', (e) => {
        // Handle suggestions navigation
        if (suggestionsContainer.children.length > 0) {
            const suggestions = suggestionsContainer.children;
            let activeIndex = -1;
            
            // Find currently active suggestion
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].classList.contains('active')) {
                    activeIndex = i;
                    break;
                }
            }
            
            // Arrow down - select next suggestion
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeIndex < suggestions.length - 1) {
                    if (activeIndex >= 0) {
                        suggestions[activeIndex].classList.remove('active');
                    }
                    suggestions[activeIndex + 1].classList.add('active');
                } else if (activeIndex === -1 && suggestions.length > 0) {
                    suggestions[0].classList.add('active');
                }
            }
            // Arrow up - select previous suggestion
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeIndex > 0) {
                    suggestions[activeIndex].classList.remove('active');
                    suggestions[activeIndex - 1].classList.add('active');
                }
            }
            // Enter - use selected suggestion
            else if (e.key === 'Enter') {
                if (activeIndex >= 0) {
                    e.preventDefault();
                    searchBox.value = suggestions[activeIndex].textContent;
                    suggestionsContainer.innerHTML = '';
                    handleSearch(searchBox.value);
                    return;
                }
            }
            // Escape - close suggestions
            else if (e.key === 'Escape') {
                suggestionsContainer.innerHTML = '';
            }
        }
        
        // Command history navigation with Alt+Arrow
        if (e.altKey) {
            if (e.key === 'ArrowUp' && commandHistory.length > 0) {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    searchBox.value = commandHistory[commandHistory.length - 1 - historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    searchBox.value = commandHistory[commandHistory.length - 1 - historyIndex];
                } else if (historyIndex === 0) {
                    historyIndex = -1;
                    searchBox.value = '';
                }
            }
        }
        
        // Enter - submit search
        if (e.key === 'Enter' && !e.altKey) {
            if (suggestionsContainer.children.length === 0 || 
                ![...suggestionsContainer.children].some(el => el.classList.contains('active'))) {
                handleSearch(searchBox.value);
            }
        }
    });
    
    // Focus search box when clicking on terminal
    document.querySelector('.terminal-window').addEventListener('click', () => {
        searchBox.focus();
    });
    
    // Update command history display
    function updateCommandHistoryDisplay() {
        if (!commandHistoryList) return;
        
        // Show only the most recent 5 commands
        const recentCommands = commandHistory.slice(-5).reverse();
        
        commandHistoryList.innerHTML = '';
        recentCommands.forEach(command => {
            const historyItem = document.createElement('div');
            historyItem.className = 'command-history-item';
            historyItem.textContent = command;
            historyItem.addEventListener('click', () => {
                searchBox.value = command;
                searchBox.focus();
            });
            commandHistoryList.appendChild(historyItem);
        });
        
        // Only show command history if there are commands
        if (recentCommands.length > 0) {
            document.querySelector('.command-history').style.display = 'block';
        } else {
            document.querySelector('.command-history').style.display = 'none';
        }
    }
    
    // Handle search submission
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
        }
        
        console.log(`Searching for: "${query}"`);
        
        // Show search status
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
}

/**
 * Initialize the terminal cursor blinking
 */
function initializeTerminalCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    
    // Set initial state
    cursor.style.opacity = '1';
    
    // Start blinking
    setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 530); // Blink every 530ms for that authentic terminal feel
}

/**
 * Initialize the logo animation
 */
function initializeLogoAnimation() {
    const mainLogo = document.getElementById('main-logo');
    if (!mainLogo) return;
    
    mainLogo.addEventListener('click', () => {
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
    
    // Make all navigation items visible since we've navigated past the initial state
    const navItems = document.querySelectorAll('nav a');
    navItems.forEach(item => {
        item.style.display = 'inline-block';
    });
}

/**
 * Hide all main content sections
 */
function hideAllSections() {
    const sections = [
        'search-container',
        'results-container',
        'visualization-container',
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
 * Set up event listeners for the academic profile
 */
function setupAcademicProfileListeners() {
    // Profile tab navigation
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.profile-tab-content');
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            profileTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Show transition effect
            showGlitchEffect();
        });
    });
    
    // Add Information button
    const addInfoBtn = document.getElementById('add-info-btn');
    const addInfoForm = document.getElementById('add-info-form');
    const closeInfoForm = document.getElementById('close-info-form');
    
    if (addInfoBtn && addInfoForm) {
        addInfoBtn.addEventListener('click', () => {
            showGlitchEffect();
            addInfoForm.style.display = 'block';
        });
    }
    
    if (closeInfoForm && addInfoForm) {
        closeInfoForm.addEventListener('click', () => {
            addInfoForm.style.display = 'none';
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
    
    // Favorite button
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            const academicName = document.getElementById('academic-name').textContent;
            if (academicName) {
                const isFavorite = databaseManager.isFavorite(academicName);
                if (isFavorite) {
                    databaseManager.removeFromFavorites(academicName);
                    favoriteBtn.classList.remove('active');
                    favoriteBtn.textContent = 'Save';
                } else {
                    databaseManager.addToFavorites(academicName);
                    favoriteBtn.classList.add('active');
                    favoriteBtn.textContent = 'Saved';
                }
                
                showGlitchEffect();
            }
        });
    }
}

/**
 * Set up event listeners for novelty tiles
 */
function setupNoveltyTilesListeners() {
    // Novelty tiles search
    const noveltySearchBox = document.querySelector('.novelty-search-box');
    if (noveltySearchBox) {
        noveltySearchBox.addEventListener('input', () => {
            const query = noveltySearchBox.value.trim().toLowerCase();
            const tiles = document.querySelectorAll('.mosaic-facet');
            
            if (query === '') {
                // Reset all tiles to default state
                tiles.forEach(tile => {
                    tile.classList.remove('detected');
                    tile.style.opacity = '1';
                });
                return;
            }
            
            // Filter tiles based on search
            tiles.forEach(tile => {
                const titleElement = tile.querySelector('.tile-title');
                const academicsElement = tile.querySelector('.tile-academics');
                const descriptionElement = tile.querySelector('.tile-description');
                
                const title = titleElement ? titleElement.textContent.toLowerCase() : '';
                const academics = academicsElement ? academicsElement.textContent.toLowerCase() : '';
                const description = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';
                
                if (title.includes(query) || academics.includes(query) || description.includes(query)) {
                    tile.classList.add('detected');
                    tile.style.opacity = '1';
                } else {
                    tile.classList.remove('detected');
                    tile.style.opacity = '0.4';
                }
            });
        });
    }
    
    // Novelty scan mode
    const scanModeSelect = document.getElementById('novelty-scan-mode');
    if (scanModeSelect) {
        scanModeSelect.addEventListener('change', () => {
            const scanMode = scanModeSelect.value;
            stopAllScanningAnimations();
            startScanningAnimation(scanMode);
        });
    }
    
    // Novelty visual mode
    const visualModeSelect = document.getElementById('novelty-visual-mode');
    if (visualModeSelect) {
        visualModeSelect.addEventListener('change', () => {
            const visualMode = visualModeSelect.value;
            updateVisualMode(visualMode);
        });
    }
    
    // Novelty tiles toggle button
    const noveltyToggle = document.querySelector('.novelty-toggle');
    if (noveltyToggle) {
        noveltyToggle.addEventListener('click', () => {
            const tilesContainer = document.getElementById('novelty-tiles-container');
            if (tilesContainer) {
                if (tilesContainer.classList.contains('expanded')) {
                    tilesContainer.classList.remove('expanded');
                    noveltyToggle.textContent = '×';
                } else {
                    tilesContainer.classList.add('expanded');
                    noveltyToggle.textContent = '+';
                }
            }
        });
    }
    
    // Detail panel close button
    const detailClose = document.querySelector('.detail-close');
    if (detailClose) {
        detailClose.addEventListener('click', () => {
            const detailPanel = document.getElementById('novelty-detail-panel');
            if (detailPanel) {
                detailPanel.classList.remove('visible');
            }
        });
    }
}

/**
 * Set up event listeners for the database browser
 */
function setupDatabaseBrowserListeners() {
    // Database search filter
    const dbSearchInput = document.getElementById('db-search');
    if (dbSearchInput) {
        dbSearchInput.addEventListener('input', () => {
            filterDatabaseList(dbSearchInput.value);
        });
    }
    
    // Database sort
    const dbSortSelect = document.getElementById('db-sort');
    if (dbSortSelect) {
        dbSortSelect.addEventListener('change', () => {
            sortDatabaseList(dbSortSelect.value);
        });
    }
}

/**
 * Filter database list based on search input
 */
function filterDatabaseList(query) {
    if (!query) {
        // Reset filter
        populateDatabaseBrowser();
        return;
    }
    
    query = query.toLowerCase();
    const academics = databaseManager.getAllAcademics();
    const filteredAcademics = academics.filter(academic => 
        academic.name.toLowerCase().includes(query) || 
        (academic.taxonomies && Object.values(academic.taxonomies).some(taxonomy => 
            taxonomy.some(value => value.toLowerCase().includes(query))
        ))
    );
    
    // Sort academics alphabetically
    filteredAcademics.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate database list with filtered academics
    populateDatabaseWithAcademics(filteredAcademics);
}

/**
 * Sort database list based on selected sort option
 */
function sortDatabaseList(sortBy) {
    const academics = databaseManager.getAllAcademics();
    
    switch (sortBy) {
        case 'name':
            academics.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'era':
            academics.sort((a, b) => {
                const aEra = a.taxonomies?.era?.[0] || '';
                const bEra = b.taxonomies?.era?.[0] || '';
                return aEra.localeCompare(bEra) || a.name.localeCompare(b.name);
            });
            break;
        case 'discipline':
            academics.sort((a, b) => {
                const aDiscipline = a.taxonomies?.discipline?.[0] || '';
                const bDiscipline = b.taxonomies?.discipline?.[0] || '';
                return aDiscipline.localeCompare(bDiscipline) || a.name.localeCompare(b.name);
            });
            break;
    }
    
    // Populate database list with sorted academics
    populateDatabaseWithAcademics(academics);
}

/**
 * Populate database list with academics
 */
function populateDatabaseWithAcademics(academics) {
    const dbList = document.getElementById('db-list');
    if (!dbList) return;
    
    dbList.innerHTML = '';
    
    if (academics.length === 0) {
        dbList.innerHTML = '<div class="empty-list">No academics found</div>';
        return;
    }
    
    academics.forEach(academic => {
        const dbItem = document.createElement('div');
        dbItem.className = 'db-item';
        
        // Add discipline tag if available
        let disciplineHtml = '';
        if (academic.taxonomies && academic.taxonomies.discipline && academic.taxonomies.discipline.length > 0) {
            disciplineHtml = `<span class="db-item-discipline">${academic.taxonomies.discipline[0]}</span>`;
        }
        
        // Add era tag if available
        let eraHtml = '';
        if (academic.taxonomies && academic.taxonomies.era && academic.taxonomies.era.length > 0) {
            eraHtml = `<span class="db-item-era">${academic.taxonomies.era[0]}</span>`;
        }
        
        dbItem.innerHTML = `
            <div class="db-item-name">${academic.name}</div>
            <div class="db-item-tags">
                ${disciplineHtml}
                ${eraHtml}
            </div>
        `;
        
        dbItem.addEventListener('click', () => {
            displayAcademic(academic);
            hideAllSections();
            document.getElementById('results-container').style.display = 'block';
            showGlitchEffect();
        });
        
        dbList.appendChild(dbItem);
    });
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
    
    // Set favorite button state
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        const isFavorite = databaseManager.isFavorite(academic.name);
        if (isFavorite) {
            favoriteBtn.classList.add('active');
            favoriteBtn.textContent = 'Saved';
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.textContent = 'Save';
        }
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
                    tag.innerHTML = `<span class="taxonomy-category">${category}:</span> <span class="taxonomy-value">${value}</span>`;
                    taxonomiesContainer.appendChild(tag);
                });
            }
        }
    }
    
    // Set overview papers (limited list)
    const overviewPapersContainer = document.getElementById('overview-papers-list');
    if (overviewPapersContainer) {
        overviewPapersContainer.innerHTML = '';
        
        if (academic.papers && academic.papers.length > 0) {
            const papersList = document.createElement('ul');
            papersList.className = 'overview-list';
            
            academic.papers.slice(0, 3).forEach(paper => {
                const paperItem = document.createElement('li');
                paperItem.className = 'overview-item';
                paperItem.innerHTML = `
                    <span class="overview-item-title">${paper.title}</span>
                    <span class="overview-item-year">(${paper.year})</span>
                `;
                papersList.appendChild(paperItem);
            });
            
            overviewPapersContainer.appendChild(papersList);
            
            if (academic.papers.length > 3) {
                const viewMoreLink = document.createElement('a');
                viewMoreLink.href = '#';
                viewMoreLink.className = 'view-more-link';
                viewMoreLink.textContent = `View all ${academic.papers.length} works`;
                viewMoreLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Switch to Works tab
                    document.querySelector('[data-tab="works"]').click();
                });
                overviewPapersContainer.appendChild(viewMoreLink);
            }
        } else {
            overviewPapersContainer.innerHTML = '<div class="empty-list">No papers listed</div>';
        }
    }
    
    // Set overview events (limited list)
    const overviewEventsContainer = document.getElementById('overview-events-list');
    if (overviewEventsContainer) {
        overviewEventsContainer.innerHTML = '';
        
        if (academic.events && academic.events.length > 0) {
            const eventsList = document.createElement('ul');
            eventsList.className = 'overview-list';
            
            academic.events.slice(0, 3).forEach(event => {
                const eventItem = document.createElement('li');
                eventItem.className = 'overview-item';
                eventItem.innerHTML = `
                    <span class="overview-item-title">${event.title}</span>
                    <span class="overview-item-year">(${event.year})</span>
                `;
                eventsList.appendChild(eventItem);
            });
            
            overviewEventsContainer.appendChild(eventsList);
            
            if (academic.events.length > 3) {
                const viewMoreLink = document.createElement('a');
                viewMoreLink.href = '#';
                viewMoreLink.className = 'view-more-link';
                viewMoreLink.textContent = `View all ${academic.events.length} events`;
                viewMoreLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Switch to Events tab
                    document.querySelector('[data-tab="events"]').click();
                });
                overviewEventsContainer.appendChild(viewMoreLink);
            }
        } else {
            overviewEventsContainer.innerHTML = '<div class="empty-list">No events listed</div>';
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
            const connectionGrid = document.createElement('div');
            connectionGrid.className = 'connection-grid';
            
            academic.connections.forEach(connection => {
                const connectionElement = document.createElement('div');
                connectionElement.className = 'connection-item';
                
                const nameElement = document.createElement('div');
                nameElement.className = 'connection-name';
                nameElement.textContent = connection;
                
                // Check if connected academic exists in database
                const connectedAcademic = databaseManager.getAcademic(connection);
                if (connectedAcademic) {
                    // Add discipline if available
                    if (connectedAcademic.taxonomies && connectedAcademic.taxonomies.discipline) {
                        const disciplineElement = document.createElement('div');
                        disciplineElement.className = 'connection-discipline';
                        disciplineElement.textContent = connectedAcademic.taxonomies.discipline.join(', ');
                        connectionElement.appendChild(disciplineElement);
                    }
                    
                    // Make clickable
                    connectionElement.addEventListener('click', () => {
                        displayAcademic(connectedAcademic);
                        showGlitchEffect();
                        // Reset to top of page
                        window.scrollTo(0, 0);
                    });
                    connectionElement.classList.add('clickable');
                }
                
                connectionElement.appendChild(nameElement);
                connectionGrid.appendChild(connectionElement);
            });
            
            connectionsContainer.appendChild(connectionGrid);
        } else {
            connectionsContainer.innerHTML = '<div class="empty-list">No connections listed</div>';
        }
    }
    
    // Set related academics
    const relatedAcademicsList = document.getElementById('related-academics-list');
    if (relatedAcademicsList) {
        relatedAcademicsList.innerHTML = '';
        
        // Get related academics based on shared taxonomies
        const relatedAcademics = getRelatedAcademics(academic);
        
        if (relatedAcademics.length > 0) {
            const relatedGrid = document.createElement('div');
            relatedGrid.className = 'related-grid';
            
            relatedAcademics.forEach(related => {
                const relatedElement = document.createElement('div');
                relatedElement.className = 'related-item';
                
                const nameElement = document.createElement('div');
                nameElement.className = 'related-name';
                nameElement.textContent = related.name;
                
                // Add discipline if available
                if (related.taxonomies && related.taxonomies.discipline) {
                    const disciplineElement = document.createElement('div');
                    disciplineElement.className = 'related-discipline';
                    disciplineElement.textContent = related.taxonomies.discipline.join(', ');
                    relatedElement.appendChild(disciplineElement);
                }
                
                relatedElement.appendChild(nameElement);
                relatedElement.addEventListener('click', () => {
                    displayAcademic(related);
                    showGlitchEffect();
                    // Reset to top of page
                    window.scrollTo(0, 0);
                });
                
                relatedGrid.appendChild(relatedElement);
            });
            
            relatedAcademicsList.appendChild(relatedGrid);
            document.getElementById('related-academics').style.display = 'block';
        } else {
            document.getElementById('related-academics').style.display = 'none';
        }
    }
    
    // Reset to overview tab
    document.querySelector('[data-tab="overview"]').click();
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Add glitch effect when displaying profile
    showGlitchEffect();
    
    // Update network visualization to highlight this academic
    highlightNetworkNode(academic.name);
}

/**
 * Get related academics based on shared taxonomies
 */
function getRelatedAcademics(academic, limit = 6) {
    if (!academic || !academic.taxonomies) return [];
    
    const allAcademics = databaseManager.getAllAcademics();
    const scoredAcademics = [];
    
    // Score each academic based on shared taxonomies
    allAcademics.forEach(other => {
        if (other.name === academic.name) return; // Skip self
        if (!other.taxonomies) return; // Skip if no taxonomies
        
        let score = 0;
        
        // Check connections
        if (academic.connections && academic.connections.includes(other.name)) {
            score += 5; // High score for direct connections
        }
        
        // Check shared taxonomies
        for (const category in academic.taxonomies) {
            if (!other.taxonomies[category]) continue;
            
            academic.taxonomies[category].forEach(value => {
                if (other.taxonomies[category].includes(value)) {
                    score += 2; // Add points for each shared taxonomy value
                }
            });
        }
        
        if (score > 0) {
            scoredAcademics.push({ academic: other, score });
        }
    });
    
    // Sort by score and return top results
    scoredAcademics.sort((a, b) => b.score - a.score);
    return scoredAcademics.slice(0, limit).map(item => item.academic);
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
        
        // Check if it should be contributed to GitHub
        const contributeCheckbox = document.getElementById('contribute-to-github');
        if (contributeCheckbox && contributeCheckbox.checked && typeof githubManager !== 'undefined') {
            const githubUsername = document.getElementById('github-username').value;
            
            // Submit to GitHub
            submitToGitHub(academicName, infoType, infoData, githubUsername);
        }
    }
}

/**
 * Submit information to GitHub
 */
function submitToGitHub(academicName, infoType, infoData, username) {
    // Check if GitHub manager exists
    if (typeof githubManager === 'undefined') {
        console.error('GitHub manager not found.');
        return;
    }
    
    // Show contribution modal with loading state
    const contributionModal = document.getElementById('contribution-modal');
    const contributionResult = document.getElementById('contribution-result');
    
    contributionResult.innerHTML = `
        <div class="contribution-loading">
            <div class="loader"></div>
            <p>Submitting contribution to GitHub...</p>
        </div>
    `;
    
    contributionModal.style.display = 'block';
    
    // Submit to GitHub
    githubManager.submitAcademicInfo(academicName, infoType, infoData, username)
        .then(result => {
            if (result.success) {
                contributionResult.innerHTML = `
                    <div class="contribution-success">
                        <p>Your contribution has been submitted successfully!</p>
                        ${result.pullRequest ? `<p>Pull Request #${result.pullRequest.number} created.</p>` : ''}
                        <p>Thank you for contributing to KillPhilosophy!</p>
                    </div>
                `;
            } else {
                contributionResult.innerHTML = `
                    <div class="contribution-error">
                        <p>There was an error submitting your contribution:</p>
                        <p>${result.message}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            contributionResult.innerHTML = `
                <div class="contribution-error">
                    <p>There was an error submitting your contribution:</p>
                    <p>${error.message}</p>
                </div>
            `;
        });
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
 * Handle navigation to novelty view
 */
function navNoveltyHandler() {
    showGlitchEffect();
    hideAllSections();
    populateNoveltyTiles();
    document.getElementById('novelty-tiles-container').style.display = 'block';
    setActiveNavItem('nav-novelty-tiles');
}

/**
 * Handle navigation to database view
 */
function navDatabaseHandler() {
    showGlitchEffect();
    hideAllSections();
    populateDatabaseBrowser();
    document.getElementById('database-browser').style.display = 'block';
    setActiveNavItem('nav-database');
}

/**
 * Handle navigation to deep search view
 */
function navDeepSearchHandler() {
    showGlitchEffect();
    hideAllSections();
    document.getElementById('deep-search-container').style.display = 'block';
    setActiveNavItem('nav-deep-search');
}

/**
 * Handle navigation to about view
 */
function navAboutHandler() {
    showGlitchEffect();
    document.getElementById('about-modal').style.display = 'block';
}

/**
 * Handle navigation to contribute view
 */
function navContributeHandler() {
    // For now, just show about modal with contribution section
    navAboutHandler();
}

/**
 * Populate the database browser
 */
function populateDatabaseBrowser() {
    const academics = databaseManager.getAllAcademics();
    
    // Sort academics alphabetically
    academics.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate database list
    populateDatabaseWithAcademics(academics);
    
    // Update database stats
    updateDatabaseStats();
}

/**
 * Populate the novelty tiles with a fly's eye mosaic structure
 */
function populateNoveltyTiles() {
    const tilesContainer = document.getElementById('novelty-tiles');
    if (!tilesContainer) {
        console.error('Novelty tiles container not found');
        return;
    }
    
    // Update the title to reflect biomimetic theme
    const titleElement = document.querySelector('.novelty-title');
    if (titleElement) {
        titleElement.textContent = 'OMNIDIRECTIONAL_PERCEPTION_FIELD';
    }
    
    // Update placeholder in search box
    const searchBox = document.querySelector('.novelty-search-box');
    if (searchBox) {
        searchBox.placeholder = 'Detect patterns in the perceptual field...';
    }
    
    // Clear container and update class
    tilesContainer.innerHTML = '';
    tilesContainer.className = 'mosaic-grid';
    
    // Get tiles data
    let tiles = databaseManager.getNoveltyTiles();
    
    // Sort tiles by date (newest first)
    tiles = tiles.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Generate placeholder tiles if needed
    if (tiles.length === 0) {
        // Generate some placeholder tiles
        for (let i = 0; i < 20; i++) {
            const placeholderTile = generateBiomimeticTile();
            databaseManager.addNoveltyTile(placeholderTile);
        }
        tiles = databaseManager.getNoveltyTiles();
    }
    
    // Ensure we have minimum number of tiles for the mosaic effect
    const minimumTiles = 48; // Optimal for mosaic grid pattern
    
    if (tiles.length < minimumTiles) {
        const extraTiles = [];
        
        for (let i = tiles.length; i < minimumTiles; i++) {
            extraTiles.push(generateBiomimeticTile());
        }
        
        // Add the extra tiles to the list for display
        tiles = [...tiles, ...extraTiles];
    }
    
    // Add randomness to tile order for more organic look
    tiles = shuffleArray(tiles);
    
    // Create and append tiles with mosaic grid styling
    tiles.forEach((tile, index) => {
        const sensitivity = 0.3 + Math.random() * 0.7; // Random sensitivity for each "receptor"
        const facetElement = document.createElement('div');
        facetElement.className = 'mosaic-facet';
        facetElement.style.setProperty('--facet-index', index);
        facetElement.style.setProperty('--sensitivity', sensitivity);
        facetElement.dataset.originalSensitivity = sensitivity;
        
        // Randomize the "sensitivity" of each tile (filter strength)
        const filterStrength = 0.6 + Math.random() * 0.4;
        facetElement.style.setProperty('--filter-strength', filterStrength);
        facetElement.dataset.originalFilter = filterStrength;
        
        // Format academics list
        let academicsHtml = '';
        if (tile.academics && tile.academics.length > 0) {
            academicsHtml = tile.academics.map((academic, i) => {
                const separator = i < tile.academics.length - 1 ? '<span class="academic-separator">•</span>' : '';
                return `<span class="tile-academic" data-academic="${academic}">${academic}</span>${separator}`;
            }).join(' ');
        } else {
            academicsHtml = '<span class="tile-academic">Unknown</span>';
        }
        
        // Create the facet surface and content
        facetElement.innerHTML = `
            <div class="facet-surface">
                <div class="tile-content">
                    <div class="tile-header">
                        <div class="tile-title">${tile.title}</div>
                        <div class="tile-date">${formatDate(tile.date)}</div>
                    </div>
                    <div class="tile-academics">${academicsHtml}</div>
                    <div class="tile-description">${tile.description}</div>
                </div>
            </div>
            <div class="facet-highlight"></div>
        `;
        
        // Add click event to view academic
        facetElement.addEventListener('click', () => {
            showNoveltyDetail(tile);
        });
        
        tilesContainer.appendChild(facetElement);
    });
    
    // Add event listeners to academic links
    document.querySelectorAll('.tile-academic').forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent tile click
            
            const academicName = element.dataset.academic;
            const academic = databaseManager.getAcademic(academicName);
            
            if (academic) {
                // Display the academic
                displayAcademic(academic);
                
                // Switch to academic profile view with glitch effect
                showGlitchEffect();
                hideAllSections();
                document.getElementById('results-container').style.display = 'block';
            } else {
                // Switch to search view and search for the academic
                navSearchHandler();
                
                const searchBox = document.querySelector('.search-box');
                if (searchBox) {
                    searchBox.value = academicName;
                    handleSearch(academicName);
                }
            }
        });
    });
    
    // Start scanning animation based on selected mode
    const scanMode = document.getElementById('novelty-scan-mode').value || 'random';
    startScanningAnimation(scanMode);
    
    // Apply visual mode
    const visualMode = document.getElementById('novelty-visual-mode').value || 'crt';
    updateVisualMode(visualMode);
}

/**
 * Show novelty tile detail
 */
function showNoveltyDetail(tile) {
    const detailPanel = document.getElementById('novelty-detail-panel');
    const detailContent = document.getElementById('novelty-detail-content');
    
    if (!detailPanel || !detailContent) return;
    
    // Format academics list
    let academicsHtml = '';
    if (tile.academics && tile.academics.length > 0) {
        academicsHtml = tile.academics.map(academic => {
            return `<div class="detail-academic" data-academic="${academic}">${academic}</div>`;
        }).join('');
    } else {
        academicsHtml = '<div class="detail-academic">Unknown</div>';
    }
    
    // Find related tiles
    const allTiles = databaseManager.getNoveltyTiles();
    const relatedTiles = allTiles.filter(t => 
        t !== tile && 
        t.academics.some(a => tile.academics.includes(a))
    ).slice(0, 3);
    
    let relatedHtml = '';
    if (relatedTiles.length > 0) {
        relatedHtml = `
            <div class="detail-section">
                <h4 class="detail-subtitle">Related Patterns</h4>
                <div class="detail-related">
                    ${relatedTiles.map(t => `
                        <div class="detail-related-item">
                            <div class="detail-related-title">${t.title}</div>
                            <div class="detail-related-date">${formatDate(t.date)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Set detail content
    detailContent.innerHTML = `
        <div class="detail-section">
            <h4 class="detail-subtitle">Detection Information</h4>
            <div class="detail-title">${tile.title}</div>
            <div class="detail-date">${formatDate(tile.date)}</div>
        </div>
        
        <div class="detail-section">
            <h4 class="detail-subtitle">Academics</h4>
            <div class="detail-academics">${academicsHtml}</div>
        </div>
        
        <div class="detail-section">
            <h4 class="detail-subtitle">Description</h4>
            <div class="detail-description">${tile.description}</div>
        </div>
        
        ${relatedHtml}
    `;
    
    // Add click event to academic links
    detailContent.querySelectorAll('.detail-academic').forEach(element => {
        element.addEventListener('click', () => {
            const academicName = element.dataset.academic;
            const academic = databaseManager.getAcademic(academicName);
            
            if (academic) {
                // Display the academic
                displayAcademic(academic);
                
                // Switch to academic profile view with glitch effect
                showGlitchEffect();
                hideAllSections();
                document.getElementById('results-container').style.display = 'block';
            } else {
                // Switch to search view and search for the academic
                navSearchHandler();
                
                const searchBox = document.querySelector('.search-box');
                if (searchBox) {
                    searchBox.value = academicName;
                    handleSearch(academicName);
                }
            }
        });
    });
    
    // Add click events to related tiles
    detailContent.querySelectorAll('.detail-related-item').forEach((element, index) => {
        element.addEventListener('click', () => {
            showNoveltyDetail(relatedTiles[index]);
        });
    });
    
    // Show detail panel
    detailPanel.classList.add('visible');
    
    // Apply glitch effect
    showGlitchEffect();
}

/**
 * Generate a biomimetic-themed placeholder tile
 */
function generateBiomimeticTile() {
    // Get random academics from the database
    const academics = databaseManager.getAllAcademics();
    const selectedAcademics = [];
    
    if (academics.length > 0) {
        // Select 1-2 random academics
        const numAcademics = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numAcademics; i++) {
            const randomIndex = Math.floor(Math.random() * academics.length);
            selectedAcademics.push(academics[randomIndex].name);
        }
    } else {
        // Fallback if no academics in database
        const placeholderNames = ['Jacques Derrida', 'Michel Foucault', 'Judith Butler', 'Gilles Deleuze', 'Slavoj Žižek'];
        const randomIndex = Math.floor(Math.random() * placeholderNames.length);
        selectedAcademics.push(placeholderNames[randomIndex]);
    }
    
    // Generate random date (within last year)
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
    const formattedDate = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`;
    
    // Biomimetic tile types
    const tileTypes = [
        {
            type: 'detection',
            title: 'Signal detected in',
            description: 'Perceptual apparatus has identified patterns within'
        },
        {
            type: 'connection',
            title: 'Neural pathway between',
            description: 'Synaptic connections established between'
        },
        {
            type: 'pattern',
            title: 'Pattern recognition in',
            description: 'Recurring motifs identified in the corpus of'
        },
        {
            type: 'stimulus',
            title: 'Reactive threshold in',
            description: 'Significant activation observed in response to'
        }
    ];
    
    const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
    
    // Biomimetic themes
    const themes = [
        'cognitive structures', 
        'theoretical constructs',
        'conceptual mappings', 
        'discursive fields', 
        'philosophical receptors'
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    // Generate tile data
    let title, description;
    
    if (randomType.type === 'connection' && selectedAcademics.length > 1) {
        title = `${randomType.title} ${selectedAcademics[0]} and ${selectedAcademics[1]}`;
        description = `${randomType.description} ${selectedAcademics[0]} and ${selectedAcademics[1]} concerning ${randomTheme}.`;
    } else {
        title = `${randomType.title} ${selectedAcademics[0]}`;
        description = `${randomType.description} ${selectedAcademics[0]}'s work on ${randomTheme}.`;
    }
    
    return {
        title,
        date: formattedDate,
        academics: selectedAcademics,
        description,
        id: Date.now() + Math.random()
    };
}

/**
 * Stop all scanning animations
 */
function stopAllScanningAnimations() {
    if (window.scanningInterval) {
        clearInterval(window.scanningInterval);
        window.scanningInterval = null;
    }
    
    // Remove scanning class from all facets
    document.querySelectorAll('.mosaic-facet.scanning').forEach(facet => {
        facet.classList.remove('scanning');
    });
}

/**
 * Start scanning animation with specified mode
 */
function startScanningAnimation(mode) {
    // Clear any existing scanning animation
    stopAllScanningAnimations();
    
    const facets = document.querySelectorAll('.mosaic-facet');
    if (facets.length === 0) return;
    
    // Apply scanning effect based on mode
    if (mode === 'random') {
        // Random scanning
        window.scanningInterval = setInterval(() => {
            // Pick a random facet
            const randomIndex = Math.floor(Math.random() * facets.length);
            const facet = facets[randomIndex];
            
            // Add scanning class
            facet.classList.add('scanning');
            
            // Remove after random time
            setTimeout(() => {
                facet.classList.remove('scanning');
            }, 180 + Math.random() * 220); // Variable duration for organic feel
        }, 100);
    } else if (mode === 'horizontal') {
        // Horizontal scanning
        let currentRow = 0;
        const columns = Math.ceil(Math.sqrt(facets.length));
        
        window.scanningInterval = setInterval(() => {
            // Scan current row
            for (let i = 0; i < columns; i++) {
                const index = currentRow * columns + i;
                if (index < facets.length) {
                    facets[index].classList.add('scanning');
                    
                    // Remove after a while
                    setTimeout(() => {
                        if (facets[index]) {
                            facets[index].classList.remove('scanning');
                        }
                    }, 180);
                }
            }
            
            // Move to next row, or back to start
            currentRow = (currentRow + 1) % Math.ceil(facets.length / columns);
        }, 300);
    } else if (mode === 'vertical') {
        // Vertical scanning
        let currentCol = 0;
        const columns = Math.ceil(Math.sqrt(facets.length));
        const rows = Math.ceil(facets.length / columns);
        
        window.scanningInterval = setInterval(() => {
            // Scan current column
            for (let i = 0; i < rows; i++) {
                const index = i * columns + currentCol;
                if (index < facets.length) {
                    facets[index].classList.add('scanning');
                    
                    // Remove after a while
                    setTimeout(() => {
                        if (facets[index]) {
                            facets[index].classList.remove('scanning');
                        }
                    }, 180);
                }
            }
            
            // Move to next column, or back to start
            currentCol = (currentCol + 1) % columns;
        }, 300);
    } else if (mode === 'burst') {
        // Burst scanning
        let burstsSinceLastPause = 0;
        
        const doBurst = () => {
            // Pick a random center
            const centerIndex = Math.floor(Math.random() * facets.length);
            const centerFacet = facets[centerIndex];
            
            // Highlight center
            centerFacet.classList.add('scanning');
            
            // Get nearby facets (approximation)
            const columns = Math.ceil(Math.sqrt(facets.length));
            const radius = 1 + Math.floor(Math.random() * 2);
            
            // Highlight neighbors with delay
            for (let r = -radius; r <= radius; r++) {
                for (let c = -radius; c <= radius; c++) {
                    if (r === 0 && c === 0) continue; // Skip center
                    
                    const idx = centerIndex + (r * columns) + c;
                    if (idx >= 0 && idx < facets.length) {
                        setTimeout(() => {
                            facets[idx].classList.add('scanning');
                            
                            // Remove after a while
                            setTimeout(() => {
                                if (facets[idx]) {
                                    facets[idx].classList.remove('scanning');
                                }
                            }, 120 + Math.random() * 80);
                        }, Math.random() * 100);
                    }
                }
            }
            
            // Remove center highlight
            setTimeout(() => {
                centerFacet.classList.remove('scanning');
            }, 200);
            
            burstsSinceLastPause++;
            
            // Pause after several bursts
            if (burstsSinceLastPause >= 3 + Math.floor(Math.random() * 3)) {
                burstsSinceLastPause = 0;
                setTimeout(doBurst, 1500 + Math.random() * 1000);
            } else {
                setTimeout(doBurst, 300 + Math.random() * 200);
            }
        };
        
        // Start first burst
        doBurst();
    }
}

/**
 * Update novelty tiles visual mode
 */
function updateVisualMode(mode) {
    const tilesContainer = document.getElementById('novelty-tiles');
    if (!tilesContainer) return;
    
    // Remove all mode classes
    tilesContainer.classList.remove('crt', 'minimal', 'neuromancer');
    
    // Add selected mode class
    tilesContainer.classList.add(mode);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Shuffle array elements (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Show a visual glitch effect
 */
function showGlitchEffect() {
    const glitchElement = document.createElement('div');
    glitchElement.className = 'screen-glitch';
    document.body.appendChild(glitchElement);
    
    setTimeout(() => {
        glitchElement.remove();
    }, 500);
}

/**
 * Initialize network visualization
 */
function initializeNetworkVisualization() {
    // Load D3.js if not already loaded
    if (typeof d3 === 'undefined') {
        console.warn('D3.js not loaded, skipping network visualization');
        return;
    }
    
    // Initialize when the visualization container is shown
    document.getElementById('nav-database').addEventListener('click', () => {
        // Slight delay to ensure container is visible
        setTimeout(() => {
            createNetworkVisualization();
        }, 100);
    });
}

/**
 * Create the network visualization
 */
function createNetworkVisualization() {
    const container = document.getElementById('network-visualization');
    if (!container) return;
    
    // Check if visualization already exists
    if (container.firstChild) return;
    
    // Get academics data
    const academics = databaseManager.getAllAcademics();
    
    // Prepare nodes and links
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    
    // Define discipline colors
    const disciplineColors = {
        'Philosophy': '#4a9cff',
        'Sociology': '#1efa18',
        'Literary Theory': '#ffb000',
        'Political Science': '#ff7b9c',
        'History': '#c4b6ff',
        'Gender Studies': '#f26419',
        'Anthropology': '#8ac926',
        'Psychology': '#ff7b9c',
        'default': '#e0e0e0'
    };
    
    // Create nodes
    academics.forEach(academic => {
        if (!nodeMap.has(academic.name)) {
            const primaryDiscipline = academic.taxonomies?.discipline?.[0] || 'default';
            const color = disciplineColors[primaryDiscipline] || disciplineColors.default;
            
            nodes.push({
                id: academic.name,
                group: primaryDiscipline,
                color: color
            });
            
            nodeMap.set(academic.name, true);
        }
    });
    
    // Create links
    academics.forEach(academic => {
        if (academic.connections) {
            academic.connections.forEach(connection => {
                // Only create link if both academics exist
                if (nodeMap.has(connection)) {
                    links.push({
                        source: academic.name,
                        target: connection,
                        value: 1
                    });
                }
            });
        }
    });
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = 500;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'rgba(0, 0, 0, 0.8)');
    
    // Add scanline effect
    const scanLines = svg.append('g').attr('class', 'scan-lines');
    for (let i = 0; i < height; i += 2) {
        scanLines.append('line')
            .attr('x1', 0)
            .attr('y1', i)
            .attr('x2', width)
            .attr('y2', i)
            .attr('stroke', 'rgba(0, 0, 0, 0.07)')
            .attr('stroke-width', 1);
    }
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
    
    // Define filter for glow effect
    const defs = svg.append('defs');
    const filter = defs.append('filter')
        .attr('id', 'glow')
        .attr('height', '300%')
        .attr('width', '300%')
        .attr('x', '-100%')
        .attr('y', '-100%');
    
    filter.append('feGaussianBlur')
        .attr('stdDeviation', '2.5')
        .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    // Create links
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#4a9cff')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.value))
        .style('filter', 'url(#glow)');
    
    // Create nodes
    const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // Add circles for nodes
    node.append('circle')
        .attr('r', 8)
        .attr('fill', d => d.color)
        .attr('stroke', '#000')
        .attr('stroke-width', 1);
    
    // Add labels
    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(d => d.id)
        .attr('fill', '#e0e0e0')
        .attr('font-family', 'var(--font-mono)')
        .attr('font-size', '12px')
        .attr('text-shadow', '0 0 3px rgba(74, 156, 255, 0.7)');
    
    // Add click event to nodes
    node.on('click', (event, d) => {
        // Find academic
        const academic = databaseManager.getAcademic(d.id);
        if (academic) {
            // Display academic profile
            displayAcademic(academic);
            
            // Switch to academic profile view
            hideAllSections();
            document.getElementById('results-container').style.display = 'block';
            
            // Show glitch effect
            showGlitchEffect();
        }
    });
    
    // Mouse hover effects
    node.on('mouseover', function() {
        d3.select(this).select('circle')
            .transition()
            .duration(300)
            .attr('r', 12);
    })
    .on('mouseout', function() {
        d3.select(this).select('circle')
            .transition()
            .duration(300)
            .attr('r', 8);
    });
    
    // Update positions on each tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    
    // Store simulation and elements for later reference
    window.networkVisualization = {
        simulation,
        link,
        node
    };
    
    // Create legend
    createNetworkLegend(disciplineColors);
}

/**
 * Create network visualization legend
 */
function createNetworkLegend(disciplineColors) {
    const legendContainer = document.getElementById('network-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '<h3>Academic Disciplines</h3>';
    
    const legendList = document.createElement('div');
    legendList.className = 'legend-list';
    
    // Add legend items for each discipline
    Object.entries(disciplineColors).forEach(([discipline, color]) => {
        if (discipline === 'default') return;
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${color}"></span>
            <span class="legend-label">${discipline}</span>
        `;
        
        legendList.appendChild(legendItem);
    });
    
    legendContainer.appendChild(legendList);
}

/**
 * Highlight a node in the network visualization
 */
function highlightNetworkNode(academicName) {
    if (!window.networkVisualization) return;
    
    const { node, link } = window.networkVisualization;
    
    // Reset all nodes and links
    node.select('circle')
        .attr('r', 8)
        .attr('stroke-width', 1);
    
    link.attr('stroke', '#4a9cff')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.value));
    
    // Highlight selected node and its connections
    node.filter(d => d.id === academicName)
        .select('circle')
        .attr('r', 12)
        .attr('stroke-width', 2);
    
    // Highlight connected links
    link.filter(d => d.source.id === academicName || d.target.id === academicName)
        .attr('stroke', '#1efa18')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', d => Math.sqrt(d.value) * 2);
    
    // Highlight connected nodes
    node.filter(d => {
        return link.filter(l => 
            (l.source.id === academicName && l.target.id === d.id) || 
            (l.target.id === academicName && l.source.id === d.id)
        ).size() > 0;
    })
    .select('circle')
    .attr('r', 10)
    .attr('stroke-width', 2);
}

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
    document.getElementById('nav-novelty-tiles').addEventListener('click', navNoveltyHandler);
    document.getElementById('nav-database').addEventListener('click', navDatabaseHandler);
    document.getElementById('nav-deep-search').addEventListener('click', navDeepSearchHandler);
    document.getElementById('nav-about').addEventListener('click', navAboutHandler);
    document.getElementById('nav-contribute').addEventListener('click', navContributeHandler);
    
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
    
    // Main logo animation trigger
    const mainLogo = document.getElementById('main-logo');
    if (mainLogo) {
        mainLogo.addEventListener('click', () => {
            mainLogo.classList.add('animated');
            setTimeout(() => {
                mainLogo.classList.remove('animated');
            }, 2000);
        });
    }
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
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
        aboutModal.style.display = 'block';
    }
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
    const dbList = document.getElementById('db-list');
    if (!dbList) return;
    
    dbList.innerHTML = '';
    
    const academics = databaseManager.getAllAcademics();
    
    // Sort academics alphabetically
    academics.sort((a, b) => a.name.localeCompare(b.name));
    
    academics.forEach(academic => {
        const dbItem = document.createElement('div');
        dbItem.className = 'db-item';
        dbItem.textContent = academic.name;
        
        dbItem.addEventListener('click', () => {
            displayAcademic(academic);
            hideAllSections();
            document.getElementById('academic-profile').style.display = 'block';
        });
        
        dbList.appendChild(dbItem);
    });
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
        titleElement.textContent = 'Omnidirectional Perception Field';
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
        
        // Randomize the "sensitivity" of each tile (filter strength)
        const filterStrength = 0.6 + Math.random() * 0.4;
        facetElement.style.setProperty('--filter-strength', filterStrength);
        
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
            if (!tile.academics || tile.academics.length === 0) return;
            
            const firstAcademic = tile.academics[0];
            const academic = databaseManager.getAcademic(firstAcademic);
            
            if (academic) {
                // Display the academic
                displayAcademic(academic);
                const searchBox = document.querySelector('.search-box');
                if (searchBox) {
                    searchBox.value = firstAcademic;
                }
                
                // Switch to academic profile view with glitch effect
                showGlitchEffect();
                hideAllSections();
                document.getElementById('academic-profile').style.display = 'block';
            } else {
                // Switch to search view and search for the academic
                setActiveNavItem('nav-search');
                navSearchHandler();
                
                const searchBox = document.querySelector('.search-box');
                if (searchBox) {
                    searchBox.value = firstAcademic;
                    handleSearch(firstAcademic);
                }
            }
        });
        
        tilesContainer.appendChild(facetElement);
    });
    
    // Add async scanning effect after tiles are populated
    setTimeout(() => simulateScanningMosaic(), 1000);
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
 * Create scanning effect across the mosaic grid
 */
function simulateScanningMosaic() {
    const facets = document.querySelectorAll('.mosaic-facet');
    if (facets.length === 0) return;
    
    // Random scan modes
    const scanModes = ['horizontal', 'vertical', 'random', 'burst'];
    const currentMode = scanModes[Math.floor(Math.random() * scanModes.length)];
    
    let activeFacets = new Set();
    
    // Highlight a facet temporarily
    const highlightFacet = (facet) => {
        facet.classList.add('scanning');
        activeFacets.add(facet);
        
        setTimeout(() => {
            facet.classList.remove('scanning');
            activeFacets.delete(facet);
        }, 180 + Math.random() * 220); // Variable duration for organic feel
    };
    
    // Different scan patterns
    const runScanPattern = () => {
        switch(currentMode) {
            case 'horizontal':
                // Simulate row-by-row scanning
                let row = 0;
                const cols = Math.ceil(Math.sqrt(facets.length));
                
                const horizontalInterval = setInterval(() => {
                    if (row * cols >= facets.length) {
                        clearInterval(horizontalInterval);
                        setTimeout(simulateScanningMosaic, 3000 + Math.random() * 2000);
                        return;
                    }
                    
                    for (let i = 0; i < cols; i++) {
                        const index = row * cols + i;
                        if (index < facets.length) {
                            highlightFacet(facets[index]);
                        }
                    }
                    
                    row++;
                }, 120);
                break;
                
            case 'vertical':
                // Simulate column-by-column scanning
                let col = 0;
                const rows = Math.ceil(Math.sqrt(facets.length));
                
                const verticalInterval = setInterval(() => {
                    if (col >= rows) {
                        clearInterval(verticalInterval);
                        setTimeout(simulateScanningMosaic, 3000 + Math.random() * 2000);
                        return;
                    }
                    
                    for (let i = 0; i < rows; i++) {
                        const index = i * rows + col;
                        if (index < facets.length) {
                            highlightFacet(facets[index]);
                        }
                    }
                    
                    col++;
                }, 120);
                break;
                
            case 'random':
                // Highlight random facets
                let count = 0;
                const randomInterval = setInterval(() => {
                    if (count > facets.length * 0.3) { // Only scan about 30% of facets
                        clearInterval(randomInterval);
                        setTimeout(simulateScanningMosaic, 2000 + Math.random() * 3000);
                        return;
                    }
                    
                    const randomIndex = Math.floor(Math.random() * facets.length);
                    highlightFacet(facets[randomIndex]);
                    
                    count++;
                }, 50);
                break;
                
            case 'burst':
                // Bursts of activity in clusters
                const totalBursts = 3 + Math.floor(Math.random() * 3);
                let burstCount = 0;
                
                const doBurst = () => {
                    if (burstCount >= totalBursts) {
                        setTimeout(simulateScanningMosaic, 3000 + Math.random() * 2000);
                        return;
                    }
                    
                    // Pick a center for the burst
                    const centerIndex = Math.floor(Math.random() * facets.length);
                    const centerFacet = facets[centerIndex];
                    highlightFacet(centerFacet);
                    
                    // Highlight neighbors (approximation)
                    const burstRadius = 2 + Math.floor(Math.random() * 3);
                    const rowSize = Math.ceil(Math.sqrt(facets.length));
                    
                    for (let r = -burstRadius; r <= burstRadius; r++) {
                        for (let c = -burstRadius; c <= burstRadius; c++) {
                            if (r === 0 && c === 0) continue; // Skip center, already highlighted
                            
                            const idx = centerIndex + (r * rowSize) + c;
                            if (idx >= 0 && idx < facets.length) {
                                setTimeout(() => {
                                    highlightFacet(facets[idx]);
                                }, Math.random() * 100);
                            }
                        }
                    }
                    
                    burstCount++;
                    setTimeout(doBurst, 500 + Math.random() * 1000);
                };
                
                doBurst();
                break;
        }
    };
    
    runScanPattern();
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

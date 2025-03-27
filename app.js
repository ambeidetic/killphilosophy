// Main application script for KillPhilosophy

// Global references to key DOM elements
let searchBox;
let searchStatus;
let currentAcademic = null;

/**
 * Main function to initialize the application
 */
function initializeApplication() {
    console.log('Initializing KillPhilosophy application...');
    
    // Find important DOM elements
    searchBox = document.querySelector('.search-box');
    searchStatus = document.querySelector('.search-status');
    
    // Verify key DOM elements exist
    const criticalElements = [
        { id: 'academic-profile', name: 'Academic Profile' },
        { id: 'academic-name', name: 'Academic Name' },
        { id: 'papers-list', name: 'Papers List' },
        { id: 'events-list', name: 'Events List' },
        { id: 'connections-list', name: 'Connections List' },
        { id: 'deep-search-container', name: 'Deep Search Container' },
        { id: 'run-deep-search', name: 'Run Deep Search Button' },
        { id: 'novelty-tiles-container', name: 'Novelty Tiles Container' },
        { id: 'novelty-tiles', name: 'Novelty Tiles' }
    ];
    
    let allElementsExist = true;
    criticalElements.forEach(element => {
        const exists = document.getElementById(element.id) !== null;
        if (!exists) {
            console.error(`Critical element missing: ${element.name} (ID: ${element.id})`);
            allElementsExist = false;
        }
    });
    
    if (!allElementsExist) {
        console.error('Some critical elements are missing. The application may not function correctly.');
        alert('KillPhilosophy initialization warning: Some UI elements are missing. Please check the console for details.');
    }
    
    // Verify the database has loaded
    const academicCount = Object.keys(databaseManager.academics).length;
    console.log(`Database contains ${academicCount} academics`);
    
    if (academicCount === 0) {
        console.warn('Database appears to be empty. Attempting to initialize with default data.');
        databaseManager._initializeDefaultData();
        databaseManager.saveToLocalStorage();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Set up deep search functionality
    setupDeepSearch();
    
    // Initialize GitHub status if GitHub module exists
    if (typeof githubManager !== 'undefined') {
        try {
            initializeGitHubStatus();
        } catch (error) {
            console.error('Failed to initialize GitHub status:', error);
        }
    }
    
    // Load initial data - show first academic
    const academics = databaseManager.getAllAcademics();
    if (academics.length > 0) {
        displayAcademic(academics[0]);
        if (searchBox) {
            searchBox.value = academics[0].name;
        }
    }
    
    // Populate novelty tiles
    populateNoveltyTiles();
    
    console.log('KillPhilosophy application initialized successfully!');
}

/**
 * Setup all event listeners for the application
 */
function setupEventListeners() {
    // Main search
    if (searchBox) {
        // Remove any existing listeners (to avoid duplicates)
        const newSearchBox = searchBox.cloneNode(true);
        searchBox.parentNode.replaceChild(newSearchBox, searchBox);
        searchBox = newSearchBox;
        
        // Add the enhanced search functionality
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchBox.value.trim();
                if (!searchTerm) return;
                
                // Show search indicator
                if (searchStatus) {
                    searchStatus.style.display = 'block';
                    const statusText = searchStatus.querySelector('.search-status-text');
                    if (statusText) {
                        statusText.textContent = 'Searching database...';
                    }
                }
                
                // Perform search
                setTimeout(() => {
                    try {
                        // Check for academic in database
                        const academic = databaseManager.getAcademic(searchTerm);
                        
                        if (academic) {
                            // Academic found in database
                            if (searchStatus) searchStatus.style.display = 'none';
                            displayAcademic(academic);
                            
                            // Check for novelty
                            checkForNovelty(academic);
                        } else {
                            // Not found - update status for deep search
                            if (searchStatus) {
                                const statusText = searchStatus.querySelector('.search-status-text');
                                if (statusText) {
                                    statusText.textContent = 'Initiating deep search...';
                                }
                                
                                // Prepare for deep search
                                setTimeout(() => {
                                    searchStatus.style.display = 'none';
                                    initiateDeepSearch(searchTerm);
                                }, 1000);
                            } else {
                                // If status element is missing, just start deep search
                                initiateDeepSearch(searchTerm);
                            }
                        }
                    } catch (error) {
                        console.error('Error during search:', error);
                        alert('An error occurred during the search. Please try again.');
                        if (searchStatus) searchStatus.style.display = 'none';
                    }
                }, 800);
            }
        });
        
        console.log('Search event listener attached');
    } else {
        console.error('Search box element not found');
    }
    
    // Navigation listeners
    const navElements = [
        { id: 'nav-search', handler: navSearchHandler },
        { id: 'nav-database', handler: navDatabaseHandler },
        { id: 'nav-novelty-tiles', handler: navNoveltyTilesHandler },
        { id: 'nav-deep-search', handler: navDeepSearchHandler },
        { id: 'nav-about', handler: navAboutHandler },
        { id: 'nav-contribute', handler: navContributeHandler }
    ];
    
    navElements.forEach(nav => {
        const element = document.getElementById(nav.id);
        if (element) {
            // Remove any existing listeners
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // Add new listener
            newElement.addEventListener('click', function(e) {
                e.preventDefault();
                nav.handler();
            });
        } else {
            console.warn(`Navigation element not found: ${nav.id}`);
        }
    });
    
    console.log('Navigation event listeners attached');
}

/**
 * Function to display an academic profile
 */
function displayAcademic(academic) {
    currentAcademic = academic;
    
    // Make sure we have DOM elements needed
    const academicProfile = document.getElementById('academic-profile');
    const academicName = document.getElementById('academic-name');
    const academicBio = document.getElementById('academic-bio');
    const papersList = document.getElementById('papers-list');
    const eventsList = document.getElementById('events-list');
    const connectionsList = document.getElementById('connections-list');
    
    if (!academicProfile || !academicName || !academicBio || !papersList || !eventsList || !connectionsList) {
        console.error('Missing DOM elements for displaying academic');
        return;
    }
    
    // Hide other sections and show the academic profile
    hideAllSections();
    academicProfile.style.display = 'block';
    
    // Fill in the academic details
    academicName.textContent = academic.name;
    academicBio.textContent = academic.bio;
    
    // Display taxonomies
    const taxonomyContainers = {
        discipline: document.getElementById('taxonomy-discipline'),
        tradition: document.getElementById('taxonomy-tradition'),
        era: document.getElementById('taxonomy-era'),
        methodology: document.getElementById('taxonomy-methodology'),
        theme: document.getElementById('taxonomy-theme')
    };
    
    // Clear and populate taxonomy lists
    for (const category in taxonomyContainers) {
        const container = taxonomyContainers[category];
        if (container) {
            container.innerHTML = '';
            
            if (academic.taxonomies && academic.taxonomies[category]) {
                academic.taxonomies[category].forEach(item => {
                    const badge = document.createElement('span');
                    badge.className = 'taxonomy-badge';
                    badge.textContent = item;
                    container.appendChild(badge);
                });
            }
        }
    }
    
    // Populate papers list
    papersList.innerHTML = '';
    if (academic.papers && academic.papers.length > 0) {
        academic.papers.forEach(paper => {
            const paperItem = document.createElement('div');
            paperItem.className = 'list-item';
            paperItem.innerHTML = `
                <div class="list-item-title">${paper.title}</div>
                <div class="list-item-year">${paper.year}</div>
            `;
            papersList.appendChild(paperItem);
        });
    } else {
        papersList.innerHTML = '<div class="empty-list">No papers found</div>';
    }
    
    // Populate events list
    eventsList.innerHTML = '';
    if (academic.events && academic.events.length > 0) {
        academic.events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'list-item';
            eventItem.innerHTML = `
                <div class="list-item-title">${event.title}</div>
                <div class="list-item-details">${event.year} | ${event.location}</div>
            `;
            eventsList.appendChild(eventItem);
        });
    } else {
        eventsList.innerHTML = '<div class="empty-list">No events found</div>';
    }
    
    // Populate connections list
    connectionsList.innerHTML = '';
    if (academic.connections && academic.connections.length > 0) {
        academic.connections.forEach(connection => {
            const connectionItem = document.createElement('div');
            connectionItem.className = 'list-item connection-item';
            connectionItem.textContent = connection;
            
            // Add click event to view the connected academic
            connectionItem.addEventListener('click', () => {
                const connectedAcademic = databaseManager.getAcademic(connection);
                if (connectedAcademic) {
                    displayAcademic(connectedAcademic);
                    if (searchBox) {
                        searchBox.value = connection;
                    }
                } else {
                    if (confirm(`Information for ${connection} is not in the database yet. Would you like to run a deep search?`)) {
                        initiateDeepSearch(connection);
                    }
                }
            });
            
            connectionsList.appendChild(connectionItem);
        });
    } else {
        connectionsList.innerHTML = '<div class="empty-list">No connections found</div>';
    }
    
    console.log(`Displayed academic: ${academic.name}`);
}

/**
 * Function to hide all main sections
 */
function hideAllSections() {
    const sections = [
        'academic-profile',
        'database-browser',
        'novelty-tiles-container',
        'deep-search-container'
    ];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

/**
 * Function to populate the database browser
 */
function populateDatabaseBrowser() {
    const browserContainer = document.getElementById('database-academics');
    if (!browserContainer) {
        console.error('Database browser container not found');
        return;
    }
    
    browserContainer.innerHTML = '';
    
    // Get all academics and sort by name
    const academics = databaseManager.getAllAcademics().sort((a, b) => a.name.localeCompare(b.name));
    
    if (academics.length === 0) {
        browserContainer.innerHTML = '<div class="empty-list">No academics in database</div>';
        return;
    }
    
    // Create category headers for alphabetical sorting
    let currentLetter = '';
    
    academics.forEach(academic => {
        const firstLetter = academic.name.charAt(0).toUpperCase();
        
        // Add new letter header if needed
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            
            const letterHeader = document.createElement('div');
            letterHeader.className = 'letter-header';
            letterHeader.textContent = currentLetter;
            browserContainer.appendChild(letterHeader);
        }
        
        // Create academic item
        const academicItem = document.createElement('div');
        academicItem.className = 'database-academic-item';
        academicItem.textContent = academic.name;
        
        // Add taxonomies as badges
        const taxonomyStr = [];
        if (academic.taxonomies) {
            for (const category in academic.taxonomies) {
                if (academic.taxonomies[category] && academic.taxonomies[category].length > 0) {
                    taxonomyStr.push(academic.taxonomies[category][0]);
                }
            }
        }
        
        if (taxonomyStr.length > 0) {
            const taxonomyBadges = document.createElement('div');
            taxonomyBadges.className = 'database-taxonomy-badges';
            taxonomyBadges.textContent = taxonomyStr.join(' • ');
            academicItem.appendChild(taxonomyBadges);
        }
        
        // Add click event to view the academic
        academicItem.addEventListener('click', () => {
            displayAcademic(academic);
            if (searchBox) {
                searchBox.value = academic.name;
            }
            navSearchHandler(); // Switch to the search view
        });
        
        browserContainer.appendChild(academicItem);
    });
}

/**
 * Function to populate the novelty tiles
 */
function populateNoveltyTiles() {
    const tilesContainer = document.getElementById('novelty-tiles');
    if (!tilesContainer) {
        console.error('Novelty tiles container not found');
        return;
    }
    
    tilesContainer.innerHTML = '';
    
    let tiles = databaseManager.getNoveltyTiles();
    
    // Sort tiles by date (newest first)
    tiles = tiles.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    if (tiles.length === 0) {
        tilesContainer.innerHTML = '<div class="empty-list">No novelty tiles available. Try searching for academics to generate some!</div>';
        return;
    }
    
    tiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.className = 'novelty-tile';
        
        let academicsHtml = '';
        for (let i = 0; i < tile.academics.length; i++) {
            academicsHtml += '<span class="novelty-academic">' + tile.academics[i] + '</span>';
            if (i < tile.academics.length - 1) {
                academicsHtml += ' • ';
            }
        }
        
        // Enhanced tile HTML with improved formatting and details
        tileElement.innerHTML = `
            <div class="novelty-tile-header">
                <div class="novelty-tile-title">${tile.title}</div>
                <div class="novelty-tile-date">${formatDate(tile.date)}</div>
            </div>
            <div class="novelty-academics">${academicsHtml}</div>
            <div class="novelty-description">${tile.description}</div>
            <div class="novelty-tile-footer">Click to explore</div>
        `;
        
        // Add click event to view the first academic in the tile
        tileElement.addEventListener('click', () => {
            const firstAcademic = tile.academics[0];
            const academic = databaseManager.getAcademic(firstAcademic);
            
            if (academic) {
                // Display the academic
                displayAcademic(academic);
                if (searchBox) {
                    searchBox.value = firstAcademic;
                }
                navSearchHandler(); // Switch to the search view
            } else {
                // Trigger deep search
                if (confirm(`Information for ${firstAcademic} is not in the database yet. Would you like to run a deep search?`)) {
                    initiateDeepSearch(firstAcademic);
                }
            }
        });
        
        tilesContainer.appendChild(tileElement);
    });
}

/**
 * Function to check for novelty for existing academics
 */
function checkForNovelty(academic) {
    console.log(`Checking for novelty content for ${academic.name}...`);
    
    // This would be replaced with actual API calls to YouTube, publication databases, etc.
    // For now, we'll simulate finding new content with random chance
    const foundNewContent = Math.random() > 0.7; // 30% chance of finding new content
    
    if (foundNewContent) {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Randomly select what kind of content we "found"
        const contentTypes = ['lecture', 'paper', 'interview', 'debate', 'YouTube video'];
        const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        
        // Get a random theme from the academic's taxonomy
        let theme = 'recent developments';
        if (academic.taxonomies && academic.taxonomies.theme && academic.taxonomies.theme.length > 0) {
            theme = academic.taxonomies.theme[Math.floor(Math.random() * academic.taxonomies.theme.length)];
        }
        
        // Create a novelty tile
        const tile = {
            title: `New ${contentType}: ${academic.name} on ${theme}`,
            date: formattedDate,
            academics: [academic.name],
            description: `${academic.name} has published a new ${contentType} discussing ${theme} in relation to contemporary discourse.`
        };
        
        databaseManager.addNoveltyTile(tile);
        console.log(`Added novelty tile for new ${contentType}:`, tile);
        
        // Notify the user about the new content
        setTimeout(() => {
            alert(`New content from ${academic.name} has been detected and added to Novelty Tiles!`);
        }, 1500);
    }
}

/**
 * Function to initiate deep search
 */
function initiateDeepSearch(searchTerm) {
    // Hide other sections
    hideAllSections();
    
    // Show deep search container
    const deepSearchContainer = document.getElementById('deep-search-container');
    if (!deepSearchContainer) {
        console.error('Deep search container not found');
        return;
    }
    
    deepSearchContainer.style.display = 'block';
    
    // Fill in search form
    const academicInput1 = document.getElementById('search-academic1');
    if (academicInput1) {
        academicInput1.value = searchTerm;
    }
    
    // Focus on the deep search section
    deepSearchContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-trigger search instead of asking with confirm
    const runDeepSearchBtn = document.getElementById('run-deep-search');
    if (runDeepSearchBtn) {
        runDeepSearchBtn.click();
    } else {
        console.error('Run deep search button not found');
    }
}

/**
 * Setup deep search functionality
 */
function setupDeepSearch() {
    const runDeepSearchBtn = document.getElementById('run-deep-search');
    const resultsContainer = document.getElementById('deep-search-results');
    const searchStatusContainer = document.querySelector('.search-status-container');
    
    if (!runDeepSearchBtn || !resultsContainer) {
        console.error('Deep search elements not found');
        return;
    }
    
    runDeepSearchBtn.addEventListener('click', () => {
        const academic1 = document.getElementById('search-academic1')?.value.trim() || '';
        const academic2 = document.getElementById('search-academic2')?.value.trim() || '';
        const searchDepth = document.getElementById('search-depth')?.value || 'standard';
        
        if (!academic1) {
            alert('Please enter at least one academic name to search.');
            return;
        }
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Show search status
        if (searchStatusContainer) {
            searchStatusContainer.style.display = 'block';
            const progressText = document.getElementById('search-progress-text');
            const progressBar = document.querySelector('.deep-search-progress-bar');
            let progress = 0;
            
            // Update the progress text based on search stage
            const progressStages = [
                "Initiating research engine...",
                "Searching academic databases...",
                "Analyzing publication networks...",
                "Mapping intellectual connections...",
                "Extracting key conceptual frameworks...",
                "Synthesizing search results...",
                "Checking for recent content..."
            ];
            
            let currentStage = 0;
            if (progressText) {
                progressText.textContent = progressStages[currentStage];
            }
            
            // Simulate API call with progress updates
            const progressInterval = setInterval(() => {
                progress += 2;
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                // Update stage text at certain progress points
                if (progress % 15 === 0 && currentStage < progressStages.length - 1) {
                    currentStage++;
                    if (progressText) {
                        progressText.textContent = progressStages[currentStage];
                    }
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Generate a mock academic record
                    const generatedAcademic = databaseManager.generateMockAcademic(academic1, academic2);
                    
                    // Now check for novelty content (YouTube videos, recent papers, etc.)
                    createNoveltyTileForNewAcademic(generatedAcademic);
                    
                    setTimeout(() => {
                        // Hide progress indicators
                        if (searchStatusContainer) {
                            searchStatusContainer.style.display = 'none';
                        }
                        
                        // Display results and option to add to database
                        displaySearchResults(academic1, academic2, searchDepth, generatedAcademic);
                    }, 500);
                }
            }, 100);
        } else {
            // If status container is missing, just generate results directly
            const generatedAcademic = databaseManager.generateMockAcademic(academic1, academic2);
            createNoveltyTileForNewAcademic(generatedAcademic);
            displaySearchResults(academic1, academic2, searchDepth, generatedAcademic);
        }
    });
    
    console.log('Deep search functionality set up');
}

/**
 * Function to create novelty tiles for newly discovered academics
 */
function createNoveltyTileForNewAcademic(academic) {
    if (!academic) return;
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Always create at least one novelty tile for a new academic
    // This simulates finding a recent lecture, paper, or video
    const contentTypes = ['YouTube lecture', 'recent publication', 'podcast appearance', 'conference presentation'];
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    // Get a theme from the academic's taxonomy
    let theme = 'contemporary theory';
    if (academic.taxonomies && academic.taxonomies.theme && academic.taxonomies.theme.length > 0) {
        theme = academic.taxonomies.theme[Math.floor(Math.random() * academic.taxonomies.theme.length)];
    }
    
    // Create a novelty tile for the discovered content
    const tile = {
        title: `Discovered ${contentType}: ${academic.name} on ${theme}`,
        date: formattedDate,
        academics: [academic.name],
        description: `Our deep search has uncovered a recent ${contentType} where ${academic.name} discusses ${theme} through the lens of ${academic.taxonomies.discipline[0]}.`
    };
    
    databaseManager.addNoveltyTile(tile);
    console.log('Added novelty tile for new academic:', tile);
}

/**
 * Function to display deep search results
 */
function displaySearchResults(academic1, academic2, searchDepth, generatedAcademic) {
    const resultsContainer = document.getElementById('deep-search-results');
    if (!resultsContainer) {
        console.error('Deep search results container not found');
        return;
    }
    
    if (!generatedAcademic) {
        resultsContainer.innerHTML = '<div class="search-error">Error generating results. Please try again.</div>';
        return;
    }
    
    // Create the results display
    const resultsElement = document.createElement('div');
    resultsElement.className = 'deep-search-result';
    
    // Generate a summary of the academic
    const taxonomySummary = [];
    for (const category in generatedAcademic.taxonomies) {
        if (generatedAcademic.taxonomies[category] && generatedAcademic.taxonomies[category].length > 0) {
            taxonomySummary.push(`${category}: ${generatedAcademic.taxonomies[category].join(', ')}`);
        }
    }
    
    resultsElement.innerHTML = `
        <h2 class="result-title">${generatedAcademic.name}</h2>
        <div class="result-bio">${generatedAcademic.bio}</div>
        <div class="result-taxonomies">
            <h3>Academic Profile</h3>
            <ul>
                ${taxonomySummary.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        <div class="result-works">
            <h3>Key Works</h3>
            <ul>
                ${generatedAcademic.papers.map(paper => `
                    <li>${paper.title} (${paper.year})</li>
                `).join('')}
            </ul>
        </div>
        <div class="result-connections">
            <h3>Intellectual Connections</h3>
            <ul>
                ${generatedAcademic.connections.map(connection => `
                    <li>${connection}</li>
                `).join('')}
            </ul>
        </div>
        <div class="result-actions">
            <button id="add-to-database" class="button primary-button">Add to Database</button>
            <button id="modify-before-adding" class="button secondary-button">Modify Before Adding</button>
            <button id="discard-results" class="button tertiary-button">Discard Results</button>
        </div>
    `;
    
    resultsContainer.appendChild(resultsElement);
    
    // Add event listeners to the buttons
    document.getElementById('add-to-database')?.addEventListener('click', () => {
        databaseManager.addAcademic(generatedAcademic);
        alert(`${generatedAcademic.name} has been added to the database.`);
        
        // Show the academic profile
        displayAcademic(generatedAcademic);
        if (searchBox) {
            searchBox.value = generatedAcademic.name;
        }
        navSearchHandler(); // Switch to the search view
    });
    
    document.getElementById('modify-before-adding')?.addEventListener('click', () => {
        // Show modification form
        const modificationForm = document.getElementById('modification-form');
        if (!modificationForm) {
            alert('Modification form not found. Please add directly to database.');
            return;
        }
        
        // Fill in the form with the generated data
        fillModificationForm(generatedAcademic);
        
        // Show the form
        modificationForm.style.display = 'block';
        modificationForm.scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('discard-results')?.addEventListener('click', () => {
        // Clear the results
        resultsContainer.innerHTML = '';
        
        // Show the search form again
        const searchForm = document.querySelector('.deep-search-form');
        if (searchForm) {
            searchForm.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/**
 * Function to fill in the modification form with generated data
 */
function fillModificationForm(academic) {
    const form = document.getElementById('modification-form');
    if (!form) {
        console.error('Modification form not found');
        return;
    }
    
    // Fill in the basic fields
    const nameInput = form.querySelector('#modify-name');
    const bioInput = form.querySelector('#modify-bio');
    
    if (nameInput) nameInput.value = academic.name;
    if (bioInput) bioInput.value = academic.bio;
    
    // Fill in taxonomy fields
    for (const category in academic.taxonomies) {
        const container = form.querySelector(`#modify-${category}`);
        if (container) {
            // Clear existing checkboxes
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Check the appropriate boxes
            academic.taxonomies[category].forEach(value => {
                const checkbox = container.querySelector(`input[value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }
    
    // Add papers
    const papersContainer = form.querySelector('#modify-papers');
    if (papersContainer) {
        papersContainer.innerHTML = '';
        
        academic.papers.forEach((paper, index) => {
            const paperRow = document.createElement('div');
            paperRow.className = 'paper-row';
            paperRow.innerHTML = `
                <input type="text" placeholder="Paper Title" value="${paper.title}" class="paper-title">
                <input type="number" placeholder="Year" value="${paper.year}" class="paper-year">
                <button class="remove-paper" data-index="${index}">Remove</button>
            `;
            papersContainer.appendChild(paperRow);
        });
        
        // Add button to add more papers
        const addPaperButton = document.createElement('button');
        addPaperButton.className = 'add-paper';
        addPaperButton.textContent = 'Add Paper';
        addPaperButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            const paperRow = document.createElement('div');
            paperRow.className = 'paper-row';
            paperRow.innerHTML = `
                <input type="text" placeholder="Paper Title" class="paper-title">
                <input type="number" placeholder="Year" class="paper-year">
                <button class="remove-paper">Remove</button>
            `;
            papersContainer.insertBefore(paperRow, addPaperButton);
        });
        
        papersContainer.appendChild(addPaperButton);
        
        // Add event listeners for remove buttons
        const removeButtons = papersContainer.querySelectorAll('.remove-paper');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.target.parentElement.remove();
            });
        });
    }
    
    // Add event listener to save button
    const saveButton = form.querySelector('#save-modifications');
    if (saveButton) {
        // Remove existing listeners
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        
        newSaveButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Collect the modified data
            const modifiedAcademic = {
                name: nameInput?.value || academic.name,
                bio: bioInput?.value || academic.bio,
                taxonomies: {},
                papers: [],
                events: academic.events, // Keep original events
                connections: academic.connections // Keep original connections
            };
            
            // Collect taxonomies
            for (const category in academic.taxonomies) {
                const container = form.querySelector(`#modify-${category}`);
                if (container) {
                    modifiedAcademic.taxonomies[category] = [];
                    
                    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                    checkboxes.forEach(checkbox => {
                        modifiedAcademic.taxonomies[category].push(checkbox.value);
                    });
                } else {
                    // Use original values if container not found
                    modifiedAcademic.taxonomies[category] = academic.taxonomies[category];
                }
            }
            
            // Collect papers
            const paperRows = papersContainer?.querySelectorAll('.paper-row');
            if (paperRows) {
                paperRows.forEach(row => {
                    const title = row.querySelector('.paper-title')?.value.trim();
                    const year = parseInt(row.querySelector('.paper-year')?.value || '0');
                    
                    if (title && year > 0) {
                        modifiedAcademic.papers.push({
                            title,
                            year,
                            coauthors: []
                        });
                    }
                });
            } else {
                // Use original papers if container not found
                modifiedAcademic.papers = academic.papers;
            }
            
            // Add to database
            databaseManager.addAcademic(modifiedAcademic);
            alert(`${modifiedAcademic.name} has been added to the database.`);
            
            // Hide the form
            form.style.display = 'none';
            
            // Show the academic profile
            displayAcademic(modifiedAcademic);
            if (searchBox) {
                searchBox.value = modifiedAcademic.name;
            }
            navSearchHandler(); // Switch to the search view
        });
    }
}

// Navigation Handlers
function navSearchHandler() {
    hideAllSections();
    const academicProfile = document.getElementById('academic-profile');
    if (!academicProfile) {
        console.error('Academic profile section not found');
        return;
    }
    
    // Check if we have an academic name displayed
    const academicName = document.getElementById('academic-name');
    if (academicName && academicName.textContent) {
        academicProfile.style.display = 'block';
    } else {
        // Show first academic if none selected
        const academics = databaseManager.getAllAcademics();
        if (academics.length > 0) {
            displayAcademic(academics[0]);
            if (searchBox) {
                searchBox.value = academics[0].name;
            }
        }
    }
}

function navDatabaseHandler() {
    populateDatabaseBrowser();
    hideAllSections();
    const databaseBrowser = document.getElementById('database-browser');
    if (databaseBrowser) {
        databaseBrowser.style.display = 'block';
    } else {
        console.error('Database browser section not found');
    }
}

function navNoveltyTilesHandler() {
    populateNoveltyTiles();
    hideAllSections();
    const noveltyTilesContainer = document.getElementById('novelty-tiles-container');
    if (noveltyTilesContainer) {
        noveltyTilesContainer.style.display = 'block';
    } else {
        console.error('Novelty tiles container not found');
    }
}

function navDeepSearchHandler() {
    hideAllSections();
    const deepSearchContainer = document.getElementById('deep-search-container');
    if (deepSearchContainer) {
        deepSearchContainer.style.display = 'block';
    } else {
        console.error('Deep search container not found');
    }
}

function navAboutHandler() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
        aboutModal.style.display = 'block';
    } else {
        console.error('About modal not found');
    }
}

function navContributeHandler() {
    // First check if we have an academic selected
    const academicName = document.getElementById('academic-name');
    if (!academicName || !academicName.textContent) {
        // Show first academic if none selected
        const academics = databaseManager.getAllAcademics();
        if (academics.length > 0) {
            displayAcademic(academics[0]);
            if (searchBox) {
                searchBox.value = academics[0].name;
            }
        }
    }
    
    const addInfoForm = document.getElementById('add-info-form');
    if (addInfoForm) {
        addInfoForm.style.display = 'block';
    }
    
    hideAllSections();
    const academicProfile = document.getElementById('academic-profile');
    if (academicProfile) {
        academicProfile.style.display = 'block';
    }
}

/**
 * Helper function to format dates nicely
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString; // Fallback to original string if parsing fails
    }
}

// Call the initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // The original initialization code will run first
    // Then our enhanced initialization will run after a short delay
    setTimeout(initializeApplication, 500);
});

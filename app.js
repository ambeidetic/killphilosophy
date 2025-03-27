// Main application script for KillPhilosophy

// Global references to key DOM elements
let searchBox;
let noveltySearchBox;
let searchStatus;
let currentAcademic = null;
let activeNavItem = null;

/**
 * Main function to initialize the application
 */
function initializeApplication() {
    console.log('Initializing KillPhilosophy application...');
    
    // Find important DOM elements
    searchBox = document.querySelector('.search-box');
    noveltySearchBox = document.querySelector('.novelty-search-box');
    searchStatus = document.querySelector('.search-status');
    
    // Verify key DOM elements exist
    const criticalElements = [
        { id: 'academic-profile', name: 'Academic Profile' },
        { id: 'search-container', name: 'Search Container' },
        { id: 'papers-list', name: 'Papers List' },
        { id: 'events-list', name: 'Events List' },
        { id: 'connections-list', name: 'Connections List' },
        { id: 'novelty-tiles-container', name: 'Novelty Tiles Container' },
        { id: 'novelty-tiles', name: 'Novelty Tiles' },
        { id: 'database-browser', name: 'Database Browser' }
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
        showToast('Warning', 'Some UI elements are missing. The application may not function correctly.', 'warning');
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
    
    // Initialize GitHub status if GitHub module exists
    if (typeof githubManager !== 'undefined') {
        try {
            initializeGitHubStatus();
        } catch (error) {
            console.error('Failed to initialize GitHub status:', error);
        }
    }
    
    // Populate novelty tiles (default view)
    populateNoveltyTiles();
    
    // Set active nav item
    setActiveNavItem('nav-novelty');
    
    // Show the novelty tiles section (default view)
    hideAllSections();
    document.getElementById('novelty-tiles-container').style.display = 'block';
    
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
                handleSearch(searchBox.value);
            }
        });
        
        console.log('Main search event listener attached');
    } else {
        console.error('Main search box element not found');
    }
    
    // Novelty search
    if (noveltySearchBox) {
        // Remove any existing listeners
        const newNoveltySearchBox = noveltySearchBox.cloneNode(true);
        noveltySearchBox.parentNode.replaceChild(newNoveltySearchBox, noveltySearchBox);
        noveltySearchBox = newNoveltySearchBox;
        
        // Add novelty search functionality
        noveltySearchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNoveltySearch(noveltySearchBox.value);
            }
        });
        
        console.log('Novelty search event listener attached');
        
        // Setup novelty search type radio buttons
        const searchTypeRadios = document.querySelectorAll('input[name="novelty-search-type"]');
        searchTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'discover') {
                    noveltySearchBox.placeholder = 'Discover academic insights and connections...';
                } else if (radio.value === 'contribute') {
                    noveltySearchBox.placeholder = 'Contribute new academic connections to the network...';
                }
            });
        });
    } else {
        console.error('Novelty search box element not found');
    }
    
    // Navigation listeners
    const navElements = [
        { id: 'nav-novelty', handler: navNoveltyHandler },
        { id: 'nav-search', handler: navSearchHandler },
        { id: 'nav-database', handler: navDatabaseHandler },
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
                setActiveNavItem(nav.id);
                nav.handler();
            });
        } else {
            console.warn(`Navigation element not found: ${nav.id}`);
        }
    });
    
    console.log('Navigation event listeners attached');
    
    // Mobile navigation toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileNavToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });
        
        // Close mobile menu when clicking on a nav item
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileNavToggle.textContent = '☰';
            });
        });
        
        console.log('Mobile navigation event listeners attached');
    }
    
    // About modal close button
    const closeAboutModal = document.getElementById('close-about-modal');
    const aboutModal = document.getElementById('about-modal');
    
    if (closeAboutModal && aboutModal) {
        closeAboutModal.addEventListener('click', () => {
            closeModal(aboutModal);
        });
        
        // Close modal when clicking outside the content
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                closeModal(aboutModal);
            }
        });
        
        console.log('About modal event listeners attached');
    }
    
    // Toast notification close button
    const toastClose = document.querySelector('.toast-close');
    const toastNotification = document.getElementById('toast-notification');
    
    if (toastClose && toastNotification) {
        toastClose.addEventListener('click', () => {
            toastNotification.classList.remove('active');
        });
    }
    
    // Contribution form type switching
    const contributionTypeRadios = document.querySelectorAll('input[name="contribution-type"]');
    const paperForm = document.getElementById('paper-form');
    const eventForm = document.getElementById('event-form');
    const connectionForm = document.getElementById('connection-form');
    
    if (contributionTypeRadios.length && paperForm && eventForm && connectionForm) {
        contributionTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                paperForm.style.display = 'none';
                eventForm.style.display = 'none';
                connectionForm.style.display = 'none';
                
                if (radio.id === 'contribute-paper') {
                    paperForm.style.display = 'block';
                } else if (radio.id === 'contribute-event') {
                    eventForm.style.display = 'block';
                } else if (radio.id === 'contribute-connection') {
                    connectionForm.style.display = 'block';
                }
            });
        });
        
        console.log('Contribution form type switching event listeners attached');
    }
    
    // Contribution form submission
    const contributionForm = document.getElementById('contribution-form');
    const cancelContribution = document.getElementById('cancel-contribution');
    
    if (contributionForm) {
        contributionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitContribution();
        });
        
        if (cancelContribution) {
            cancelContribution.addEventListener('click', () => {
                document.getElementById('add-info-form').style.display = 'none';
            });
        }
        
        console.log('Contribution form event listeners attached');
    }
    
    // Modification form
    const modifyForm = document.getElementById('modify-academic-form');
    const saveModifications = document.getElementById('save-modifications');
    const cancelModifications = document.getElementById('cancel-modifications');
    
    if (modifyForm && saveModifications && cancelModifications) {
        saveModifications.addEventListener('click', (e) => {
            e.preventDefault();
            saveAcademicModifications();
        });
        
        cancelModifications.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('modification-form').style.display = 'none';
        });
        
        console.log('Modification form event listeners attached');
    }
    
    // Add paper button in modification form
    const addPaperButton = document.createElement('button');
    addPaperButton.className = 'add-paper button secondary-button';
    addPaperButton.textContent = 'Add Paper';
    addPaperButton.type = 'button';
    
    const modifyPapers = document.getElementById('modify-papers');
    if (modifyPapers) {
        modifyPapers.appendChild(addPaperButton);
        
        addPaperButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            const paperRow = document.createElement('div');
            paperRow.className = 'paper-row';
            paperRow.innerHTML = `
                <input type="text" placeholder="Paper Title" class="paper-title">
                <input type="number" placeholder="Year" class="paper-year">
                <button type="button" class="remove-paper button">Remove</button>
            `;
            
            const removeButton = paperRow.querySelector('.remove-paper');
            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                paperRow.remove();
            });
            
            modifyPapers.insertBefore(paperRow, addPaperButton);
        });
    }
}

/**
 * Set the active navigation item
 */
function setActiveNavItem(id) {
    // Remove active class from current active item
    if (activeNavItem) {
        document.getElementById(activeNavItem).classList.remove('active');
    }
    
    // Set new active item
    const navItem = document.getElementById(id);
    if (navItem) {
        navItem.classList.add('active');
        activeNavItem = id;
    }
}

/**
 * Handle search input
 */
function handleSearch(searchTerm) {
    searchTerm = searchTerm.trim();
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
                
                // Switch to academic profile view
                hideAllSections();
                document.getElementById('academic-profile').style.display = 'block';
            } else {
                // Not found - update status for deep search
                if (searchStatus) {
                    const statusText = searchStatus.querySelector('.search-status-text');
                    if (statusText) {
                        statusText.textContent = 'Initiating deep search...';
                    }
                }
                
                // Prepare for deep search
                setTimeout(() => {
                    if (searchStatus) searchStatus.style.display = 'none';
                    performDeepSearch(searchTerm);
                }, 800);
            }
        } catch (error) {
            console.error('Error during search:', error);
            showToast('Error', 'An error occurred during the search. Please try again.', 'error');
            if (searchStatus) searchStatus.style.display = 'none';
        }
    }, 600);
}

/**
 * Handle novelty search input
 */
function handleNoveltySearch(searchTerm) {
    searchTerm = searchTerm.trim();
    if (!searchTerm) return;
    
    // Get the selected search type
    const searchType = document.querySelector('input[name="novelty-search-type"]:checked').value;
    
    // Show search status
    const noveltySearchStatus = document.querySelector('.novelty-search-status');
    if (noveltySearchStatus) {
        noveltySearchStatus.style.display = 'block';
        const statusText = noveltySearchStatus.querySelector('.novelty-search-status-text');
        if (statusText) {
            statusText.textContent = searchType === 'discover' ? 'Discovering insights...' : 'Processing contribution...';
        }
    }
    
    setTimeout(() => {
        if (searchType === 'discover') {
            // For discovery mode, try to find academics first
            const academic = databaseManager.getAcademic(searchTerm);
            
            if (academic) {
                // If found, display the academic and check for novelty
                displayAcademic(academic);
                checkForNovelty(academic);
                
                // Switch to academic profile view
                hideAllSections();
                document.getElementById('academic-profile').style.display = 'block';
            } else {
                // If not found, use deep search with enhanced novelty detection
                performDeepSearch(searchTerm, true);
            }
        } else {
            // For contribution mode
            processNoveltyContribution(searchTerm);
        }
        
        // Hide search status
        if (noveltySearchStatus) {
            noveltySearchStatus.style.display = 'none';
        }
    }, 800);
}

/**
 * Process a contribution from novelty search
 */
function processNoveltyContribution(input) {
    // Parse the input to extract potential connections or information
    // Format could be "Academic A is influenced by Academic B" or similar patterns
    const connectionPattern = /([^:]+)\s+(is influenced by|influences|connects to|collaborated with|critiques)\s+([^:]+)/i;
    const match = input.match(connectionPattern);
    
    if (match) {
        const academic1 = match[1].trim();
        const relationshipType = match[2].toLowerCase();
        const academic2 = match[3].trim();
        
        // Check if both academics exist
        const academicObj1 = databaseManager.getAcademic(academic1);
        const academicObj2 = databaseManager.getAcademic(academic2);
        
        // Create novelty tile for the contribution
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const tile = {
            title: `New Connection: ${academic1} ${relationshipType} ${academic2}`,
            date: formattedDate,
            academics: [academic1, academic2],
            description: `A new intellectual connection has been identified: ${academic1} ${relationshipType} ${academic2}. This contributes to our understanding of the academic network.`
        };
        
        databaseManager.addNoveltyTile(tile);
        
        // Update connections if the academics exist
        if (academicObj1 && !academicObj1.connections.includes(academic2)) {
            academicObj1.connections.push(academic2);
            databaseManager.updateAcademic(academic1, academicObj1);
        }
        
        if (academicObj2 && !academicObj2.connections.includes(academic1)) {
            academicObj2.connections.push(academic1);
            databaseManager.updateAcademic(academic2, academicObj2);
        }
        
        // If either academic doesn't exist, generate them
        if (!academicObj1 || !academicObj2) {
            if (!academicObj1) {
                const generatedAcademic = databaseManager.generateMockAcademic(academic1, academic2);
                databaseManager.addAcademic(generatedAcademic);
            }
            
            if (!academicObj2) {
                const generatedAcademic = databaseManager.generateMockAcademic(academic2, academic1);
                databaseManager.addAcademic(generatedAcademic);
            }
        }
        
        // Refresh novelty tiles and show success message
        populateNoveltyTiles();
        showToast('Success', 'Your contribution has been added to the academic network!', 'success');
    } else {
        // If the input doesn't match the pattern, show help message
        showToast('Info', 'Please use format: "Academic A is influenced by Academic B" or similar patterns.', 'info');
    }
}

/**
 * Perform a deep search for an academic
 */
function performDeepSearch(searchTerm, enhancedNovelty = false) {
    // Show deep search progress
    const searchStatusContainer = document.querySelector('.search-status-container');
    
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
                const generatedAcademic = databaseManager.generateMockAcademic(searchTerm);
                
                // Generate novelty content
                if (enhancedNovelty) {
                    // Create multiple novelty tiles for enhanced novelty mode
                    createEnhancedNoveltyTiles(generatedAcademic);
                } else {
                    // Create a single novelty tile for regular deep search
                    createNoveltyTileForNewAcademic(generatedAcademic);
                }
                
                setTimeout(() => {
                    // Hide progress indicators
                    if (searchStatusContainer) {
                        searchStatusContainer.style.display = 'none';
                    }
                    
                    // Display results in the search container
                    displaySearchResults(searchTerm, generatedAcademic, enhancedNovelty);
                    
                    // For enhanced novelty, show a toast notification
                    if (enhancedNovelty) {
                        showToast('Discovery', `Discovered new content related to ${searchTerm}!`, 'info');
                    }
                }, 500);
            }
        }, 100);
    } else {
        // If status container is missing, just generate results directly
        const generatedAcademic = databaseManager.generateMockAcademic(searchTerm);
        
        if (enhancedNovelty) {
            createEnhancedNoveltyTiles(generatedAcademic);
        } else {
            createNoveltyTileForNewAcademic(generatedAcademic);
        }
        
        displaySearchResults(searchTerm, generatedAcademic, enhancedNovelty);
    }
}

/**
 * Create enhanced novelty tiles for novelty search discoveries
 */
function createEnhancedNoveltyTiles(academic) {
    if (!academic) return;
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Create multiple tiles with different content types
    const contentTypes = [
        {
            type: 'YouTube lecture',
            title: `Discovered lecture: ${academic.name} on `,
            description: `A recent lecture where ${academic.name} discusses `
        },
        {
            type: 'publication',
            title: `New paper: ${academic.name}'s work on `,
            description: `A significant publication where ${academic.name} explores `
        },
        {
            type: 'intellectual connection',
            title: `New connection: ${academic.name} and `,
            description: `Our analysis has uncovered an important intellectual connection between ${academic.name} and `
        }
    ];
    
    // Select random content types (1-3)
    const numTiles = Math.floor(Math.random() * 3) + 1;
    const selectedTypes = [];
    for (let i = 0; i < numTiles; i++) {
        const randomIndex = Math.floor(Math.random() * contentTypes.length);
        if (!selectedTypes.includes(randomIndex)) {
            selectedTypes.push(randomIndex);
        }
    }
    
    // Create a tile for each selected content type
    selectedTypes.forEach(index => {
        const contentType = contentTypes[index];
        
        // Get a theme from the academic's taxonomy
        let theme = 'contemporary theory';
        if (academic.taxonomies && academic.taxonomies.theme && academic.taxonomies.theme.length > 0) {
            theme = academic.taxonomies.theme[Math.floor(Math.random() * academic.taxonomies.theme.length)];
        }
        
        // For connection tiles, pick another academic
        let connectedAcademic = null;
        if (contentType.type === 'intellectual connection') {
            const academics = databaseManager.getAllAcademics();
            if (academics.length > 0) {
                connectedAcademic = academics[Math.floor(Math.random() * academics.length)];
            }
        }
        
        // Create the tile
        const tile = {
            title: contentType.type === 'intellectual connection' && connectedAcademic
                ? `${contentType.title}${connectedAcademic.name}`
                : `${contentType.title}${theme}`,
            date: formattedDate,
            academics: contentType.type === 'intellectual connection' && connectedAcademic
                ? [academic.name, connectedAcademic.name]
                : [academic.name],
            description: contentType.type === 'intellectual connection' && connectedAcademic
                ? `${contentType.description}${connectedAcademic.name}, particularly in the area of ${theme}.`
                : `${contentType.description}${theme} through the lens of ${academic.taxonomies.discipline[0]}.`
        };
        
        databaseManager.addNoveltyTile(tile);
    });
}

/**
 * Create a novelty tile for a newly discovered academic
 */
function createNoveltyTileForNewAcademic(academic) {
    if (!academic) return;
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Select a content type
    const contentTypes = ['YouTube lecture', 'recent publication', 'podcast appearance', 'conference presentation'];
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    // Get a theme from the academic's taxonomy
    let theme = 'contemporary theory';
    if (academic.taxonomies && academic.taxonomies.theme && academic.taxonomies.theme.length > 0) {
        theme = academic.taxonomies.theme[Math.floor(Math.random() * academic.taxonomies.theme.length)];
    }
    
    // Create a novelty tile
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
 * Display deep search results
 */
function displaySearchResults(searchTerm, generatedAcademic, enhancedNovelty = false) {
    const resultsContainer = document.getElementById('deep-search-results');
    if (!resultsContainer) {
        console.error('Deep search results container not found');
        return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
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
            <button id="view-novelty" class="button secondary-button">View Novelty Tiles</button>
            <button id="discard-results" class="button tertiary-button">Discard Results</button>
        </div>
    `;
    
    resultsContainer.appendChild(resultsElement);
    
    // Add event listeners to the buttons
    document.getElementById('add-to-database')?.addEventListener('click', () => {
        databaseManager.addAcademic(generatedAcademic);
        showToast('Success', `${generatedAcademic.name} has been added to the database!`, 'success');
        
        // Show the academic profile
        displayAcademic(generatedAcademic);
        if (searchBox) {
            searchBox.value = generatedAcademic.name;
        }
        
        // Switch to academic profile view
        hideAllSections();
        document.getElementById('academic-profile').style.display = 'block';
    });
    
    document.getElementById('modify-before-adding')?.addEventListener('click', () => {
        // Show modification form
        fillModificationForm(generatedAcademic);
        
        // Show the form
        document.getElementById('modification-form').style.display = 'block';
        document.getElementById('modification-form').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('view-novelty')?.addEventListener('click', () => {
        // Switch to novelty tiles view
        setActiveNavItem('nav-novelty');
        navNoveltyHandler();
    });
    
    document.getElementById('discard-results')?.addEventListener('click', () => {
        // Clear the results
        resultsContainer.innerHTML = '';
        
        // If enhanced novelty search, return to novelty view
        if (enhancedNovelty) {
            setActiveNavItem('nav-novelty');
            navNoveltyHandler();
        }
    });
    
    // Show the search results section
    hideAllSections();
    document.getElementById('search-container').style.display = 'block';
}

/**
 * Fill the modification form with academic data
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
        // Clear existing paper rows (except the Add Paper button)
        const existingRows = papersContainer.querySelectorAll('.paper-row');
        existingRows.forEach(row => row.remove());
        
        // Add paper rows
        const addPaperButton = papersContainer.querySelector('.add-paper');
        
        academic.papers.forEach(paper => {
            const paperRow = document.createElement('div');
            paperRow.className = 'paper-row';
            paperRow.innerHTML = `
                <input type="text" placeholder="Paper Title" value="${paper.title}" class="paper-title">
                <input type="number" placeholder="Year" value="${paper.year}" class="paper-year">
                <button type="button" class="remove-paper button">Remove</button>
            `;
            
            const removeButton = paperRow.querySelector('.remove-paper');
            removeButton.addEventListener('click', () => {
                paperRow.remove();
            });
            
            if (addPaperButton) {
                papersContainer.insertBefore(paperRow, addPaperButton);
            } else {
                papersContainer.appendChild(paperRow);
            }
        });
    }
}

/**
 * Save modifications to an academic
 */
function saveAcademicModifications() {
    const form = document.getElementById('modification-form');
    if (!form) return;
    
    // Get the basic information
    const name = form.querySelector('#modify-name').value.trim();
    const bio = form.querySelector('#modify-bio').value.trim();
    
    if (!name) {
        showToast('Error', 'Name is required', 'error');
        return;
    }
    
    // Create the academic object
    const academic = {
        name,
        bio,
        taxonomies: {},
        papers: [],
        events: [],
        connections: []
    };
    
    // Collect taxonomies
    for (const category of ['discipline', 'tradition', 'era', 'methodology', 'theme']) {
        const container = form.querySelector(`#modify-${category}`);
        if (container) {
            academic.taxonomies[category] = [];
            
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                academic.taxonomies[category].push(checkbox.value);
            });
        }
    }
    
    // Collect papers
    const paperRows = form.querySelectorAll('.paper-row');
    paperRows.forEach(row => {
        const title = row.querySelector('.paper-title').value.trim();
        const yearInput = row.querySelector('.paper-year').value.trim();
        const year = yearInput ? parseInt(yearInput) : null;
        
        if (title && year) {
            academic.papers.push({
                title,
                year,
                coauthors: []
            });
        }
    });
    
    // Add to database
    const result = databaseManager.addAcademic(academic);
    
    if (result) {
        showToast('Success', `${academic.name} has been added to the database!`, 'success');
        
        // Hide the form
        form.style.display = 'none';
        
        // Show the academic profile
        displayAcademic(academic);
        if (searchBox) {
            searchBox.value = academic.name;
        }
        
        // Switch to academic profile view
        hideAllSections();
        document.getElementById('academic-profile').style.display = 'block';
    } else {
        showToast('Error', 'Failed to add academic to database', 'error');
    }
}

/**
 * Function to display an academic profile
 */
function displayAcademic(academic) {
    if (!academic) return;
    
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
                    if (confirm(`Information for ${connection} is not in the database yet. Would you like to search for it?`)) {
                        // Switch to search view and perform search
                        setActiveNavItem('nav-search');
                        navSearchHandler();
                        
                        if (searchBox) {
                            searchBox.value = connection;
                            handleSearch(connection);
                        }
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
        'search-container',
        'database-browser',
        'novelty-tiles-container'
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
            
            // Switch to academic profile view
            hideAllSections();
            document.getElementById('academic-profile').style.display = 'block';
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
                
                // Switch to academic profile view
                hideAllSections();
                document.getElementById('academic-profile').style.display = 'block';
            } else {
                // Switch to search view and search for the academic
                setActiveNavItem('nav-search');
                navSearchHandler();
                
                if (searchBox) {
                    searchBox.value = firstAcademic;
                    handleSearch(firstAcademic);
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
        showToast('New Content', `New content from ${academic.name} has been detected and added to Novelty Tiles!`, 'info');
    }
}

/**
 * Submit a contribution
 */
function submitContribution() {
    // Get the current academic
    if (!currentAcademic) {
        showToast('Error', 'No academic selected', 'error');
        return;
    }
    
    // Get the contribution type
    const contributionType = document.querySelector('input[name="contribution-type"]:checked').id;
    
    // Process based on type
    let contributionData = null;
    let contributionDescription = '';
    
    if (contributionType === 'contribute-paper') {
        const title = document.getElementById('paper-title').value.trim();
        const yearInput = document.getElementById('paper-year').value.trim();
        const year = yearInput ? parseInt(yearInput) : null;
        const coauthorsInput = document.getElementById('paper-coauthors').value.trim();
        const coauthors = coauthorsInput ? coauthorsInput.split(',').map(a => a.trim()) : [];
        
        if (!title || !year) {
            showToast('Error', 'Paper title and year are required', 'error');
            return;
        }
        
        contributionData = { title, year, coauthors };
        contributionDescription = `Paper: "${title}" (${year})`;
        
        // Add to academic's papers
        currentAcademic.papers.push(contributionData);
    } else if (contributionType === 'contribute-event') {
        const title = document.getElementById('event-title').value.trim();
        const yearInput = document.getElementById('event-year').value.trim();
        const year = yearInput ? parseInt(yearInput) : null;
        const location = document.getElementById('event-location').value.trim();
        
        if (!title || !year || !location) {
            showToast('Error', 'Event title, year, and location are required', 'error');
            return;
        }
        
        contributionData = { title, year, location };
        contributionDescription = `Event: "${title}" (${year}, ${location})`;
        
        // Add to academic's events
        currentAcademic.events.push(contributionData);
    } else if (contributionType === 'contribute-connection') {
        const connectionName = document.getElementById('connection-name').value.trim();
        
        if (!connectionName) {
            showToast('Error', 'Connection name is required', 'error');
            return;
        }
        
        contributionData = connectionName;
        contributionDescription = `Connection to: ${connectionName}`;
        
        // Add to academic's connections if not already there
        if (!currentAcademic.connections.includes(connectionName)) {
            currentAcademic.connections.push(connectionName);
        }
        
        // Create or update the connected academic to include a connection back
        const connectedAcademic = databaseManager.getAcademic(connectionName);
        if (connectedAcademic) {
            if (!connectedAcademic.connections.includes(currentAcademic.name)) {
                connectedAcademic.connections.push(currentAcademic.name);
                databaseManager.updateAcademic(connectionName, connectedAcademic);
            }
        } else {
            // If the connected academic doesn't exist, generate one
            const generatedAcademic = databaseManager.generateMockAcademic(connectionName, currentAcademic.name);
            databaseManager.addAcademic(generatedAcademic);
            
            // Create a novelty tile for this new academic
            createNoveltyTileForNewAcademic(generatedAcademic);
        }
    }
    
    // Update the academic in the database
    databaseManager.updateAcademic(currentAcademic.name, currentAcademic);
    
    // Create a novelty tile for the contribution
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const tile = {
        title: `New contribution to ${currentAcademic.name}`,
        date: formattedDate,
        academics: [currentAcademic.name],
        description: `A new contribution has been added to ${currentAcademic.name}'s profile: ${contributionDescription}`
    };
    
    databaseManager.addNoveltyTile(tile);
    
    // Refresh the academic display
    displayAcademic(currentAcademic);
    
    // Hide the form
    document.getElementById('add-info-form').style.display = 'none';
    
    // Show success message
    showToast('Success', `Your contribution to ${currentAcademic.name} has been added!`, 'success');
}

/**
 * Show a toast notification
 */
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    if (!toast || !toastTitle || !toastMessage || !toastIcon) return;
    
    // Set the content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set the icon based on type
    switch (type) {
        case 'success':
            toastIcon.textContent = '✓';
            toastIcon.style.color = 'var(--success-color)';
            break;
        case 'error':
            toastIcon.textContent = '✗';
            toastIcon.style.color = 'var(--danger-color)';
            break;
        case 'warning':
            toastIcon.textContent = '⚠';
            toastIcon.style.color = 'var(--accent-color)';
            break;
        case 'info':
        default:
            toastIcon.textContent = 'ℹ';
            toastIcon.style.color = 'var(--info-color)';
            break;
    }
    
    // Show the toast
    toast.classList.add('active');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

/**
 * Open a modal
 */
function openModal(modal) {
    if (!modal) return;
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

/**
 * Close a modal
 */
function closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
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

// Navigation Handlers
function navNoveltyHandler() {
    hideAllSections();
    populateNoveltyTiles();
    document.getElementById('novelty-tiles-container').style.display = 'block';
}

function navSearchHandler() {
    hideAllSections();
    document.getElementById('search-container').style.display = 'block';
    
    // Clear any previous results
    document.getElementById('deep-search-results').innerHTML = '';
    
    // Focus the search box
    if (searchBox) {
        searchBox.focus();
    }
}

function navDatabaseHandler() {
    hideAllSections();
    populateDatabaseBrowser();
    document.getElementById('database-browser').style.display = 'block';
}

function navAboutHandler() {
    openModal(document.getElementById('about-modal'));
}

function navContributeHandler() {
    // First check if we have an academic selected
    if (!currentAcademic) {
        // Show first academic if none selected
        const academics = databaseManager.getAllAcademics();
        if (academics.length > 0) {
            displayAcademic(academics[0]);
            if (searchBox) {
                searchBox.value = academics[0].name;
            }
        } else {
            showToast('Error', 'No academics available for contribution', 'error');
            return;
        }
    }
    
    // Show the academic profile
    hideAllSections();
    document.getElementById('academic-profile').style.display = 'block';
    
    // Show the contribution form
    document.getElementById('add-info-form').style.display = 'block';
    document.getElementById('add-info-form').scrollIntoView({ behavior: 'smooth' });
    
    // Reset the form
    document.getElementById('contribute-paper').checked = true;
    document.getElementById('paper-form').style.display = 'block';
    document.getElementById('event-form').style.display = 'none';
    document.getElementById('connection-form').style.display = 'none';
    
    document.getElementById('paper-title').value = '';
    document.getElementById('paper-year').value = '';
    document.getElementById('paper-coauthors').value = '';
}

// Call the initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeApplication, 500);
});

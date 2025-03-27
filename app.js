/**
 * KillPhilosophy Main Application
 * 
 * This is the main JavaScript file that coordinates all functionality for the
 * KillPhilosophy website. It handles UI interactions, data display, and integrates
 * with the database and GitHub managers.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchBox = document.querySelector('.search-box');
    const searchStatus = document.querySelector('.search-status');
    const academicProfile = document.getElementById('academic-profile');
    const academicName = document.getElementById('academic-name');
    const academicDates = document.getElementById('academic-dates');
    const academicBio = document.getElementById('academic-bio');
    const papersList = document.getElementById('papers-list');
    const eventsList = document.getElementById('events-list');
    const connectionsList = document.getElementById('connections-list');
    const taxonomiesList = document.getElementById('taxonomies-list');
    const addInfoBtn = document.getElementById('add-info-btn');
    const addInfoForm = document.getElementById('add-info-form');
    const infoTypeSelect = document.getElementById('info-type');
    const submitInfoBtn = document.getElementById('submit-info');
    const databaseBrowser = document.getElementById('database-browser');
    const dbList = document.getElementById('db-list');
    const githubStatusPanel = document.getElementById('github-status-panel');
    const githubIndicator = document.getElementById('github-indicator');
    const githubStatusText = document.getElementById('github-status-text');
    const repoLink = document.getElementById('repo-link');
    const aboutRepoLink = document.getElementById('about-repo-link');
    
    // Navigation elements
    const navSearch = document.getElementById('nav-search');
    const navDatabase = document.getElementById('nav-database');
    const navNoveltyTiles = document.getElementById('nav-novelty-tiles');
    const navDeepSearch = document.getElementById('nav-deep-search');
    const navAbout = document.getElementById('nav-about');
    const navContribute = document.getElementById('nav-contribute');
    const navAdmin = document.getElementById('nav-admin');
    
    // Modals
    const aboutModal = document.getElementById('about-modal');
    const closeAboutModal = document.getElementById('close-about-modal');
    const contributionModal = document.getElementById('contribution-modal');
    const closeContributionModal = document.getElementById('close-contribution-modal');

    // Initialize GitHub check
    initializeGitHubStatus();
    
    // Function to initialize GitHub status
    async function initializeGitHubStatus() {
        // Update repo links
        const repoUrl = `https://github.com/${githubManager.repoOwner}/${githubManager.repoName}`;
        repoLink.href = repoUrl;
        aboutRepoLink.href = repoUrl;
        
        // Check GitHub repository status
        if (githubManager.repoOwner && githubManager.repoName) {
            githubIndicator.className = 'indicator-circle indicator-connecting';
            githubStatusText.textContent = 'Connecting to GitHub...';
            
            try {
                const repoExists = await githubManager.checkRepository();
                
                if (repoExists) {
                    githubIndicator.className = 'indicator-circle indicator-online';
                    githubStatusText.textContent = `Connected to ${githubManager.repoOwner}/${githubManager.repoName}`;
                    
                    // If we're authenticated, show admin link
                    if (githubManager.isAuthenticated) {
                        navAdmin.style.display = 'inline-block';
                    }
                    
                    // Try to sync database
                    if (githubManager.isAuthenticated) {
                        syncDatabaseWithGitHub();
                    }
                } else {
                    githubIndicator.className = 'indicator-circle indicator-offline';
                    githubStatusText.textContent = 'Repository not found or inaccessible';
                }
            } catch (error) {
                githubIndicator.className = 'indicator-circle indicator-offline';
                githubStatusText.textContent = 'Failed to connect to GitHub';
                githubManager.log(`GitHub connection error: ${error.message}`, 'error');
            }
        } else {
            githubIndicator.className = 'indicator-circle indicator-offline';
            githubStatusText.textContent = 'Not connected to GitHub';
        }
    }
    
    // Sync local database with GitHub repo
    async function syncDatabaseWithGitHub() {
        if (!githubManager.isAuthenticated) return;
        
        try {
            const result = await githubManager.syncDatabase(databaseManager);
            
            if (result.success) {
                githubManager.log(`Database sync: ${result.message}`, 'success');
                
                // If we received a database from GitHub, update our local one
                if (result.operation === 'pull' || result.operation === 'merge') {
                    if (result.database.academics) {
                        databaseManager.academics = result.database.academics;
                    }
                    
                    if (result.database.noveltyTiles) {
                        databaseManager.noveltyTiles = result.database.noveltyTiles;
                    }
                    
                    if (result.database.taxonomyCategories) {
                        databaseManager.taxonomyCategories = result.database.taxonomyCategories;
                    }
                    
                    databaseManager.saveToLocalStorage();
                    githubManager.log('Local database updated from GitHub', 'success');
                }
            } else {
                githubManager.log(`Database sync failed: ${result.message}`, 'error');
            }
        } catch (error) {
            githubManager.log(`Database sync error: ${error.message}`, 'error');
        }
    }
    
    // Function to hide all main content sections
    function hideAllSections() {
        academicProfile.style.display = 'none';
        databaseBrowser.style.display = 'none';
        document.getElementById('novelty-tiles-container').style.display = 'none';
        document.getElementById('deep-search-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'none';
        githubStatusPanel.style.display = 'none';
    }
    
    // Function to display academic information
    function displayAcademic(academicData) {
        academicName.textContent = academicData.name;
        academicDates.textContent = academicData.dates || '';
        academicBio.textContent = academicData.bio || '';
        
        // Display taxonomies if they exist
        taxonomiesList.innerHTML = '';
        
        if (academicData.taxonomies) {
            for (const category in academicData.taxonomies) {
                if (academicData.taxonomies.hasOwnProperty(category)) {
                    const tags = academicData.taxonomies[category];
                    const categoryElement = document.createElement('div');
                    categoryElement.className = 'taxonomy-category';
                    
                    // Format the category name (capitalize first letter, replace hyphens with spaces)
                    const formattedCategory = category.charAt(0).toUpperCase() + 
                        category.slice(1).replace(/-/g, ' ');
                    
                    categoryElement.innerHTML = '<span class="taxonomy-category-name">' + formattedCategory + ':</span> ';
                    
                    // Add tags
                    for (let i = 0; i < tags.length; i++) {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'taxonomy-tag';
                        tagElement.textContent = tags[i];
                        categoryElement.appendChild(tagElement);
                    }
                    
                    taxonomiesList.appendChild(categoryElement);
                }
            }
        }
        
        // Display papers
        papersList.innerHTML = '';
        const papers = academicData.papers || [];
        if (papers.length === 0) {
            papersList.innerHTML = '<div class="empty-list">No papers or publications listed.</div>';
        } else {
            for (let i = 0; i < papers.length; i++) {
                const paper = papers[i];
                const paperElement = document.createElement('div');
                paperElement.className = 'paper-item';
                paperElement.innerHTML = 
                    '<div class="paper-title">' + paper.title + '</div>' +
                    '<div class="paper-metadata">' + (paper.year || 'n/a') + ' | ' + (paper.journal || 'n/a') + '</div>';
                papersList.appendChild(paperElement);
            }
        }
        
        // Display events
        eventsList.innerHTML = '';
        const events = academicData.events || [];
        if (events.length === 0) {
            eventsList.innerHTML = '<div class="empty-list">No event appearances listed.</div>';
        } else {
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = 
                    '<div class="event-title">' + event.title + '</div>' +
                    '<div class="event-metadata">' + (event.date || 'n/a') + ' | ' + (event.location || 'n/a') + '</div>' +
                    (event.description ? '<div class="event-description">' + event.description + '</div>' : '');
                eventsList.appendChild(eventElement);
            }
        }
        
        // Display connections
        connectionsList.innerHTML = '';
        const connections = academicData.connections || [];
        if (connections.length === 0) {
            connectionsList.innerHTML = '<div class="empty-list">No connections listed.</div>';
        } else {
            for (let i = 0; i < connections.length; i++) {
                const connection = connections[i];
                const connectionElement = document.createElement('div');
                connectionElement.className = 'connection-item';
                connectionElement.innerHTML = 
                    '<span class="connection-name">' + connection.name + '</span>' +
                    '<span class="connection-type">(' + (connection.type || 'connection') + ')</span>' +
                    (connection.description ? '<div class="connection-description">' + connection.description + '</div>' : '');
                
                // Use closure to preserve reference to connection
                (function(conn) {
                    connectionElement.querySelector('.connection-name').addEventListener('click', function() {
                        const academic = databaseManager.getAcademic(conn.name);
                        if (academic) {
                            displayAcademic(academic);
                            searchBox.value = conn.name;
                        } else {
                            // Trigger deep search for this academic
                            if (confirm('Information for ' + conn.name + ' is not in the database yet. Would you like to run a deep search to find information?')) {
                                initiateDeepSearch(conn.name);
                            }
                        }
                    });
                })(connection);
                
                connectionsList.appendChild(connectionElement);
            }
        }
        
        // Hide other sections and show the academic profile
        hideAllSections();
        academicProfile.style.display = 'block';
    }

    // Enhanced search functionality with dual capabilities
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchBox.value.trim();
            if (!searchTerm) return;
            
            // Show search indicator
            searchStatus.style.display = 'block';
            searchStatus.querySelector('.search-status-text').textContent = 'Searching database...';
            
            // Simulate search delay
            setTimeout(() => {
                // Check for academic in database
                const academic = databaseManager.getAcademic(searchTerm);
                
                if (academic) {
                    // Academic found in database
                    searchStatus.style.display = 'none';
                    displayAcademic(academic);
                } else {
                    // Not found - update status for deep search
                    searchStatus.querySelector('.search-status-text').textContent = 'Initiating deep search...';
                    
                    // Simulate deep search preparation
                    setTimeout(() => {
                        // Hide search status and initiate deep search
                        searchStatus.style.display = 'none';
                        initiateDeepSearch(searchTerm);
                    }, 1000);
                }
            }, 800);
        }
    });

    // Function to initiate deep search
    function initiateDeepSearch(searchTerm) {
        // Hide other sections
        hideAllSections();
        
        // Show deep search container
        document.getElementById('deep-search-container').style.display = 'block';
        
        // Fill in search form
        document.getElementById('search-academic1').value = searchTerm;
        
        // Focus on the deep search section
        document.getElementById('deep-search-container').scrollIntoView({ behavior: 'smooth' });
        
        // Optional: Auto-trigger search
        if (confirm('No academic found with the name "' + searchTerm + '" in our database. Would you like to run a deep search to find information?')) {
            document.getElementById('run-deep-search').click();
        }
    }

    // Toggle form visibility
    addInfoBtn.addEventListener('click', () => {
        // Check for GitHub field visibility
        const githubField = document.querySelector('.github-field');
        const githubIdentity = document.querySelector('.github-identity');
        
        // Show GitHub fields if we have a repository configured
        if (githubManager.repoOwner && githubManager.repoName) {
            githubField.style.display = 'block';
            githubIdentity.style.display = 'block';
        } else {
            githubField.style.display = 'none';
            githubIdentity.style.display = 'none';
        }
        
        addInfoForm.style.display = addInfoForm.style.display === 'none' ? 'block' : 'none';
    });

    // Form type toggle
    infoTypeSelect.addEventListener('change', () => {
        const selectedType = infoTypeSelect.value;
        document.querySelectorAll('.paper-field, .event-field, .connection-field, .taxonomy-field').forEach(field => {
            field.style.display = 'none';
        });
        
        document.querySelectorAll(`.${selectedType}-field`).forEach(field => {
            field.style.display = 'block';
        });
    });

    // Submit new information
    submitInfoBtn.addEventListener('click', async () => {
        const currentAcademic = academicName.textContent;
        if (!currentAcademic) {
            alert('Please select an academic first.');
            return;
        }
        
        const infoType = infoTypeSelect.value;
        let validInput = true;
        let infoData = null;
        
        // Validate and collect data based on info type
        if (infoType === 'paper') {
            const title = document.getElementById('paper-title').value;
            const year = document.getElementById('paper-year').value;
            const journal = document.getElementById('paper-journal').value;
            
            if (!title) {
                alert('Please enter a paper title.');
                validInput = false;
            } else {
                infoData = {
                    title: title,
                    year: year || 'n/a',
                    journal: journal || 'n/a',
                    url: document.getElementById('paper-url').value || '#'
                };
            }
        } else if (infoType === 'event') {
            const title = document.getElementById('event-title').value;
            const date = document.getElementById('event-date').value;
            const location = document.getElementById('event-location').value;
            
            if (!title) {
                alert('Please enter an event title.');
                validInput = false;
            } else {
                infoData = {
                    title: title,
                    date: date || 'n/a',
                    location: location || 'n/a',
                    description: document.getElementById('event-description').value || ''
                };
            }
        } else if (infoType === 'connection') {
            const connName = document.getElementById('connection-name').value;
            const connType = document.getElementById('connection-type').value;
            
            if (!connName) {
                alert('Please enter an academic name for the connection.');
                validInput = false;
            } else {
                infoData = {
                    name: connName,
                    type: connType,
                    description: document.getElementById('connection-description').value || ''
                };
            }
        } else if (infoType === 'taxonomy') {
            const category = document.getElementById('taxonomy-category').value;
            const value = document.getElementById('taxonomy-value').value;
            let finalCategory = category;
            
            if (category === 'custom') {
                finalCategory = document.getElementById('taxonomy-custom-category').value;
                if (!finalCategory) {
                    alert('Please enter a custom category name.');
                    validInput = false;
                }
            }
            
            if (!value) {
                alert('Please enter a taxonomy value.');
                validInput = false;
            } else if (validInput) {
                infoData = {
                    category: finalCategory,
                    value: value
                };
            }
        }
        
        if (validInput && infoData) {
            // Check if GitHub contribution is requested
            const contributeToGitHub = document.getElementById('contribute-to-github').checked;
            const username = document.getElementById('github-username').value || 'anonymous';
            
            // First add to local database
            const result = databaseManager.addAcademicInfo(
                currentAcademic, 
                infoType, 
                infoData, 
                { submitToGitHub: contributeToGitHub, username }
            );
            
            if (!result) {
                alert('Failed to add information to the database.');
                return;
            }
            
            // If GitHub contribution is requested and repository is configured
            if (contributeToGitHub && githubManager.repoOwner && githubManager.repoName) {
                // Show loading state
                submitInfoBtn.disabled = true;
                submitInfoBtn.textContent = 'Submitting...';
                
                try {
                    // Submit to GitHub
                    const githubResult = await githubManager.submitAcademicInfo(
                        currentAcademic,
                        infoType,
                        infoData,
                        username
                    );
                    
                    // Show contribution modal with result
                    const contributionResult = document.getElementById('contribution-result');
                    contributionModal.style.display = 'block';
                    
                    if (githubResult.success) {
                        if (githubResult.simulated) {
                            contributionResult.innerHTML = `
                                <p>${githubResult.message}</p>
                                <p>Your contribution has been saved locally and will be included in the next sync with GitHub.</p>
                                <p>Contribution details:</p>
                                <ul>
                                    <li><strong>Academic:</strong> ${currentAcademic}</li>
                                    <li><strong>Type:</strong> ${infoType}</li>
                                </ul>
                            `;
                        } else {
                            contributionResult.innerHTML = `
                                <p>${githubResult.message}</p>
                                <p>Thank you for your contribution! Your pull request has been created and will be reviewed by the maintainers.</p>
                                <p>Contribution details:</p>
                                <ul>
                                    <li><strong>Academic:</strong> ${currentAcademic}</li>
                                    <li><strong>Type:</strong> ${infoType}</li>
                                    <li><strong>Pull Request:</strong> <a href="${githubResult.pullRequest.html_url}" target="_blank">#${githubResult.pullRequest.number}</a></li>
                                </ul>
                            `;
                        }
                    } else {
                        contributionResult.innerHTML = `
                            <p>Error: ${githubResult.message}</p>
                            <p>Your contribution has been saved locally, but could not be submitted to GitHub.</p>
                        `;
                    }
                } catch (error) {
                    alert(`Error submitting to GitHub: ${error.message}`);
                } finally {
                    // Reset button state
                    submitInfoBtn.disabled = false;
                    submitInfoBtn.textContent = 'Submit';
                }
            } else {
                // Just show success message for local addition
                alert(`Information added to ${currentAcademic}'s profile.`);
            }
            
            // Refresh display
            const academic = databaseManager.getAcademic(currentAcademic);
            if (academic) {
                displayAcademic(academic);
            }
            
            // Hide form and clear fields
            addInfoForm.style.display = 'none';
            document.querySelectorAll('input, textarea').forEach(field => {
                field.value = '';
            });
        }
    });

    // Database browser functionality
    function populateDatabaseBrowser() {
        dbList.innerHTML = '';
        const academics = databaseManager.getAllAcademics();
        
        // Sort academics by name
        academics.sort((a, b) => a.name.localeCompare(b.name));
        
        academics.forEach(academic => {
            const dbItem = document.createElement('div');
            dbItem.className = 'db-item';
            dbItem.textContent = `${academic.name} ${academic.dates ? `(${academic.dates})` : ''}`;
            dbItem.addEventListener('click', () => {
                displayAcademic(academic);
                searchBox.value = academic.name;
            });
            dbList.appendChild(dbItem);
        });
    }

    // Function to populate novelty tiles
    function populateNoveltyTiles() {
        const tilesContainer = document.getElementById('novelty-tiles');
        tilesContainer.innerHTML = '';
        
        const tiles = databaseManager.getNoveltyTiles();
        
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
            
            tileElement.innerHTML = `
                <div class="novelty-tile-header">
                    <div class="novelty-tile-title">${tile.title}</div>
                    <div class="novelty-tile-date">${tile.date}</div>
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
                    searchBox.value = firstAcademic;
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
    
    // Function to set up deep search mock
    function setupDeepSearch() {
        const runDeepSearchBtn = document.getElementById('run-deep-search');
        const resultsContainer = document.getElementById('deep-search-results');
        const searchStatusContainer = document.querySelector('.search-status-container');
        
        runDeepSearchBtn.addEventListener('click', () => {
            const academic1 = document.getElementById('search-academic1').value.trim();
            const academic2 = document.getElementById('search-academic2').value.trim();
            const searchDepth = document.getElementById('search-depth').value;
            
            if (!academic1) {
                alert('Please enter at least one academic name to search.');
                return;
            }
            
            // Clear previous results
            resultsContainer.innerHTML = '';
            
            // Show search status
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
                "Synthesizing search results..."
            ];
            
            let currentStage = 0;
            progressText.textContent = progressStages[currentStage];
            
            // Simulate API call with progress updates
            const progressInterval = setInterval(() => {
                progress += 2;
                progressBar.style.width = `${progress}%`;
                
                // Update stage text at certain progress points
                if (progress % 20 === 0 && currentStage < progressStages.length - 1) {
                    currentStage++;
                    progressText.textContent = progressStages[currentStage];
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Create a mock academic record if the search was for a new academic
                    const existingAcademic = databaseManager.getAcademic(academic1);
                    if (!existingAcademic) {
                        databaseManager.generateMockAcademic(academic1, academic2);
                    }
                    
                    setTimeout(() => {
                        // Hide progress indicators
                        searchStatusContainer.style.display = 'none';
                        
                        // Display results and option to add to database
                        displaySearchResults(academic1, academic2, searchDepth);
                    }, 500);
                }
            }, 100);
        });
        
        // API key configuration
        document.getElementById('api-key-link').addEventListener('click', (e) => {
            e.preventDefault();
            const apiKey = prompt('Enter your Gemini API key:');
            if (apiKey) {
                localStorage.setItem('killphilosophy_gemini_api_key', apiKey);
                alert('API key saved successfully.');
            }
        });
    }
    
    // Function to display deep search results
    function displaySearchResults(academic1, academic2, searchDepth) {
        const resultsContainer = document.getElementById('deep-search-results');
        
        // Generate a confidence score based on search depth
        let confidenceScore;
        switch(searchDepth) {
            case 'deep': confidenceScore = 'High (87%)'; break;
            case 'medium': confidenceScore = 'Medium (72%)'; break;
            default: confidenceScore = 'Basic (58%)'; break;
        }
        
        resultsContainer.innerHTML = `
            <h3>Deep Search Results</h3>
            <p>${academic2 ? 'Analyzed connection between ' + academic1 + ' and ' + academic2 : 'Analyzed data for ' + academic1}</p>
            
            <div class="connection-discovery">
                <h4>Data Confidence</h4>
                <p><span class="connection-strength connection-strength-high"></span> ${confidenceScore} confidence in results</p>
                <p>Data sources: ${Math.floor(Math.random() * 30) + 20} academic publications, ${Math.floor(Math.random() * 15) + 5} institutional archives</p>
            </div>
            
            <div class="connection-discovery">
                <h4>Key Findings</h4>
                <ul>
                    <li>Identified ${Math.floor(Math.random() * 8) + 3} major works and intellectual contributions</li>
                    <li>${academic2 ? 'Detected conceptual overlap in theoretical frameworks' : 'Mapped primary academic influences and areas of impact'}</li>
                    <li>Extracted taxonomy classifications based on publication patterns</li>
                </ul>
            </div>
            
            <button class="submit-btn" id="view-academic-btn">View Profile</button>
        `;
        
        // View profile functionality
        document.getElementById('view-academic-btn').addEventListener('click', () => {
            // Get the academic from the database
            const academic = databaseManager.getAcademic(academic1);
            
            if (academic) {
                // Display the academic profile
                displayAcademic(academic);
                searchBox.value = academic1;
            }
        });
    }
    
    // Function to set up admin panel
    function setupAdminPanel() {
        // Get admin tabs and panels
        const adminTabs = document.querySelectorAll('.admin-tab');
        const adminPanels = document.querySelectorAll('.admin-panel');
        
        // Add click event to admin login
        navAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if GitHub is authenticated
            if (!githubManager.isAuthenticated) {
                const token = prompt('Enter GitHub token for admin access:');
                
                if (token) {
                    // Save token and update auth status
                    githubManager.saveSettings(githubManager.repoOwner, githubManager.repoName, token);
                    githubManager.isAuthenticated = true;
                    
                    // Initialize GitHub elements
                    initializeGitHubStatus();
                    
                    // Show admin panel
                    showAdminPanel();
                } else {
                    alert('GitHub token is required for admin access.');
                    return;
                }
            } else {
                showAdminPanel();
            }
        });
        
        // Function to show admin panel
        function showAdminPanel() {
            // Hide other sections
            hideAllSections();
            
            // Show admin container
            document.getElementById('admin-container').style.display = 'block';
            
            // Initialize admin panels
            initializeAdminPanels();
        }
        
        // Initialize admin panel content
        function initializeAdminPanels() {
            // Populate submissions table
            const submissions = databaseManager.getPendingSubmissions();
            const submissionsTableBody = document.getElementById('submissions-table-body');
            
            submissionsTableBody.innerHTML = '';
            if (submissions.length === 0) {
                submissionsTableBody.innerHTML = '<tr><td colspan="5">No pending submissions</td></tr>';
            } else {
                submissions.forEach(submission => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${new Date(submission.date).toLocaleDateString()}</td>
                        <td>${submission.type}</td>
                        <td>${submission.academic}</td>
                        <td>${submission.submittedBy}</td>
                        <td>
                            <button class="small-btn approve-btn">Approve</button>
                            <button class="small-btn reject-btn">Reject</button>
                        </td>
                    `;
                    
                    // Add event listeners to buttons
                    row.querySelector('.approve-btn').addEventListener('click', () => {
                        // In a real implementation, this would submit to GitHub
                        alert(`Approved submission for ${submission.academic}`);
                        // Remove from list
                        row.remove();
                    });
                    
                    row.querySelector('.reject-btn').addEventListener('click', () => {
                        if (confirm(`Reject submission for ${submission.academic}?`)) {
                            row.remove();
                        }
                    });
                    
                    submissionsTableBody.appendChild(row);
                });
            }
            
            // Initialize taxonomy panel
            const taxonomyCategories = document.getElementById('taxonomy-categories');
            const taxonomies = databaseManager.getTaxonomies();
            
            taxonomyCategories.innerHTML = '';
            for (const category in taxonomies) {
                if (taxonomies.hasOwnProperty(category)) {
                    const tags = taxonomies[category];
                    
                    // Format the category name (capitalize first letter, replace hyphens with spaces)
                    const formattedCategory = category.charAt(0).toUpperCase() + 
                        category.slice(1).replace(/-/g, ' ');
                    
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'taxonomy-category';
                    categoryDiv.innerHTML = `<h4>${formattedCategory}</h4>`;
                    
                    const tagsDiv = document.createElement('div');
                    tagsDiv.className = 'taxonomy-tags';
                    
                    tags.forEach(tag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'taxonomy-tag';
                        tagSpan.textContent = tag;
                        tagsDiv.appendChild(tagSpan);
                    });
                    
                    // Add "Add New" tag
                    const addNewTag = document.createElement('span');
                    addNewTag.className = 'taxonomy-tag';
                    addNewTag.textContent = '+ Add New';
                    addNewTag.style.cursor = 'pointer';
                    
                    addNewTag.addEventListener('click', () => {
                        const newTag = prompt(`Add new tag to ${formattedCategory}:`);
                        if (newTag && newTag.trim()) {
                            databaseManager.addTaxonomyValue(category, newTag.trim());
                            // Refresh the panel
                            initializeAdminPanels();
                        }
                    });
                    
                    tagsDiv.appendChild(addNewTag);
                    categoryDiv.appendChild(tagsDiv);
                    taxonomyCategories.appendChild(categoryDiv);
                }
            }
            
            // Initialize GitHub panel
            if (githubManager.isAuthenticated) {
                document.querySelector('.github-operations').style.display = 'block';
                document.getElementById('github-repo').value = `${githubManager.repoOwner}/${githubManager.repoName}`;
                document.getElementById('github-token').value = '••••••••••••••••';
                
                // Update log display
                githubManager._updateLogDisplay();
                
                // Connect GitHub operations
                document.getElementById('sync-database').addEventListener('click', () => {
                    syncDatabaseWithGitHub();
                });
                
                document.getElementById('pull-changes').addEventListener('click', async () => {
                    try {
                        githubManager.log('Pulling changes from GitHub...', 'info');
                        const result = await githubManager.getDatabase();
                        
                        if (result.academics) {
                            databaseManager.academics = result.academics;
                            databaseManager.saveToLocalStorage();
                            githubManager.log('Successfully pulled database from GitHub', 'success');
                        }
                    } catch (error) {
                        githubManager.log(`Failed to pull changes: ${error.message}`, 'error');
                    }
                });
                
                document.getElementById('view-submissions').addEventListener('click', async () => {
                    try {
                        githubManager.log('Fetching pull requests...', 'info');
                        const pullRequests = await githubManager.getPullRequests();
                        
                        if (pullRequests && pullRequests.length > 0) {
                            githubManager.log(`Found ${pullRequests.length} open pull requests`, 'success');
                            const prList = pullRequests.map(pr => `- #${pr.number}: ${pr.title} (by ${pr.user.login})`).join('\n');
                            githubManager.log('Open pull requests:\n' + prList, 'info');
                        } else {
                            githubManager.log('No open pull requests found', 'info');
                        }
                    } catch (error) {
                        githubManager.log(`Failed to fetch pull requests: ${error.message}`, 'error');
                    }
                });
            } else {
                document.querySelector('.github-operations').style.display = 'none';
            }
            
            // Save settings functionality
            document.getElementById('save-settings').addEventListener('click', () => {
                const siteName = document.getElementById('site-name').value;
                const siteDescription = document.getElementById('site-description').value;
                const apiKey = document.getElementById('admin-api-key').value;
                
                // Save to localStorage
                localStorage.setItem('killphilosophy_site_name', siteName);
                localStorage.setItem('killphilosophy_site_description', siteDescription);
                
                if (apiKey) {
                    localStorage.setItem('killphilosophy_gemini_api_key', apiKey);
                }
                
                alert('Settings saved successfully');
            });
        }
        
        // GitHub connection handling
        document.getElementById('connect-github').addEventListener('click', () => {
            const repoInput = document.getElementById('github-repo').value;
            const token = document.getElementById('github-token').value;
            
            if (!repoInput) {
                alert('Please enter a GitHub repository in the format username/repo');
                return;
            }
            
            const [owner, name] = repoInput.split('/');
            
            if (!owner || !name) {
                alert('Invalid repository format. Please use format: username/repo');
                return;
            }
            
            // Save settings
            githubManager.saveSettings(owner, name, token);
            
            // Update GitHub status
            initializeGitHubStatus();
            
            // Reinitialize admin panels
            initializeAdminPanels();
            
            alert('GitHub settings saved. The repository status has been updated.');
        });
        
        // Tab switching
        adminTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                adminTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all panels
                adminPanels.forEach(p => p.classList.remove('active'));
                
                // Show corresponding panel
                const panelId = 'panel-' + tab.getAttribute('data-tab');
                document.getElementById(panelId).classList.add('active');
            });
        });
    }
    
    // Navigation
    navSearch.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        if (academicName.textContent) {
            academicProfile.style.display = 'block';
        } else {
            // Show first academic if none selected
            const academics = databaseManager.getAllAcademics();
            if (academics.length > 0) {
                displayAcademic(academics[0]);
                searchBox.value = academics[0].name;
            }
        }
    });

    navDatabase.addEventListener('click', (e) => {
        e.preventDefault();
        populateDatabaseBrowser();
        hideAllSections();
        databaseBrowser.style.display = 'block';
    });
    
    // Novelty Tiles nav
    navNoveltyTiles.addEventListener('click', (e) => {
        e.preventDefault();
        populateNoveltyTiles();
        hideAllSections();
        document.getElementById('novelty-tiles-container').style.display = 'block';
    });
    
    // Deep Search nav
    navDeepSearch.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('deep-search-container').style.display = 'block';
    });

    navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });

    navContribute.addEventListener('click', (e) => {
        e.preventDefault();
        
        // First check if we have an academic selected
        if (!academicName.textContent) {
            // Show first academic if none selected
            const academics = databaseManager.getAllAcademics();
            if (academics.length > 0) {
                displayAcademic(academics[0]);
                searchBox.value = academics[0].name;
            }
        }
        
        addInfoForm.style.display = 'block';
        hideAllSections();
        academicProfile.style.display = 'block';
    });

    closeAboutModal.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });
    
    if (closeContributionModal) {
        closeContributionModal.addEventListener('click', () => {
            contributionModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
        if (e.target === contributionModal) {
            contributionModal.style.display = 'none';
        }
    });
    
    // GitHub status panel toggle
    document.querySelector('.github-link').addEventListener('click', (e) => {
        // Only intercept if it's the containing link element
        if (e.target.classList.contains('github-link') || e.target.closest('.github-link') === e.target) {
            e.preventDefault();
            hideAllSections();
            githubStatusPanel.style.display = 'block';
        }
    });
    
    document.getElementById('close-github-status').addEventListener('click', () => {
        githubStatusPanel.style.display = 'none';
    });

    // Initialize the page
    setupDeepSearch();
    setupAdminPanel();
    
    // Default to showing first academic in database
    const academics = databaseManager.getAllAcademics();
    if (academics.length > 0) {
        displayAcademic(academics[0]);
        searchBox.value = academics[0].name;
    }
});

// Main application script for KillPhilosophy

// Modified function to populate the novelty tiles for the new grid-based layout
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
        // Generate some placeholder tiles if none exist
        for (let i = 0; i < 20; i++) {
            const placeholderTile = generatePlaceholderTile();
            databaseManager.addNoveltyTile(placeholderTile);
        }
        tiles = databaseManager.getNoveltyTiles();
    }
    
    // For grid-like perception layout, we want to ensure a minimum number of tiles
    // Add duplicates or generate random placeholder tiles if needed to fill the grid
    const minimumTiles = 32; // Makes a dense grid for eye-like perception
    
    if (tiles.length < minimumTiles) {
        const extraTiles = [];
        
        for (let i = tiles.length; i < minimumTiles; i++) {
            // Either duplicate an existing tile or generate a placeholder
            if (tiles.length > 0 && Math.random() > 0.5) {
                const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
                extraTiles.push({...randomTile, id: Date.now() + i});
            } else {
                extraTiles.push(generatePlaceholderTile());
            }
        }
        
        // Add the extra tiles to the list for display
        tiles = [...tiles, ...extraTiles];
    }
    
    // Shuffle the tiles for a more randomized, eye-like perception
    tiles = shuffleArray(tiles);
    
    tiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.className = 'novelty-tile';
        
        let academicsHtml = '';
        if (tile.academics && tile.academics.length > 0) {
            for (let i = 0; i < tile.academics.length; i++) {
                academicsHtml += '<span class="novelty-academic">' + tile.academics[i] + '</span>';
                if (i < tile.academics.length - 1) {
                    academicsHtml += ' • ';
                }
            }
        } else {
            academicsHtml = '<span class="novelty-academic">Unknown</span>';
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
            if (!tile.academics || tile.academics.length === 0) return;
            
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
 * Generate a placeholder tile for filling the grid
 */
function generatePlaceholderTile() {
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
    
    // Random tile types
    const tileTypes = [
        {
            type: 'lecture',
            title: 'Recently discovered lecture on',
            description: 'A digitized recording of a previously unknown lecture discussing'
        },
        {
            type: 'connection',
            title: 'Unexpected connection between',
            description: 'Research has revealed an unexpected intellectual connection between'
        },
        {
            type: 'citation',
            title: 'New citation analysis of',
            description: 'A comprehensive citation network analysis reveals patterns in'
        },
        {
            type: 'publication',
            title: 'Obscure publication by',
            description: 'A rarely discussed publication that demonstrates early formulations of'
        }
    ];
    
    const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
    
    // Random themes
    const themes = ['power structures', 'feminist theory', 'post-structuralism', 'dialectical materialism', 
                    'phenomenology', 'subject formation', 'discourse analysis', 'cultural critique'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    // Generate tile data
    let title, description;
    
    if (randomType.type === 'connection' && selectedAcademics.length > 1) {
        title = `${randomType.title} ${selectedAcademics[0]} and ${selectedAcademics[1]}`;
        description = `${randomType.description} ${selectedAcademics[0]} and ${selectedAcademics[1]} regarding ${randomTheme}.`;
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
 * Shuffle an array using Fisher-Yates algorithm
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
 * Show a visual glitch effect when transitioning between sections
 */
function showGlitchEffect() {
    const glitchElement = document.createElement('div');
    glitchElement.className = 'screen-glitch';
    document.body.appendChild(glitchElement);
    
    setTimeout(() => {
        glitchElement.remove();
    }, 500);
}

// Enhanced navigation handlers with glitch effect
function navNoveltyHandler() {
    showGlitchEffect();
    hideAllSections();
    populateNoveltyTiles();
    document.getElementById('novelty-tiles-container').style.display = 'block';
}

function navSearchHandler() {
    showGlitchEffect();
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
    showGlitchEffect();
    hideAllSections();
    populateDatabaseBrowser();
    document.getElementById('database-browser').style.display = 'block';
}

// Add event listener for novelty tile toggle
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Add logo animation trigger
    const mainLogo = document.getElementById('main-logo');
    if (mainLogo) {
        mainLogo.addEventListener('click', () => {
            mainLogo.classList.add('animated');
            setTimeout(() => {
                mainLogo.classList.remove('animated');
            }, 2000);
        });
    }
});

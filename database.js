/**
 * Database Manager for KillPhilosophy
 * Handles academic data, persistence, and search functionality
 */
class DatabaseManager {
    constructor() {
        this.academics = {};
        this.noveltyTiles = [];
        this.favorites = [];
        this.taxonomyCategories = {
            discipline: ["Philosophy", "Sociology", "Literary Theory", "Political Science", 
                       "History", "Gender Studies", "Anthropology", "Psychology"],
            tradition: ["Existentialism", "Post-structuralism", "Phenomenology", 
                      "Critical Theory", "Marxism", "Hermeneutics", "Pragmatism"],
            era: ["20th Century", "21st Century", "Contemporary", "Modern", "Ancient", "Medieval"],
            methodology: ["Textual Analysis", "Dialectical Method", "Genealogy", 
                        "Deconstruction", "Ethnography", "Discourse Analysis"],
            theme: ["Power", "Identity", "Language", "Justice", "Ethics", "Consciousness", 
                  "Embodiment", "Capitalism", "Democracy", "Technology"]
        };
        this.pendingSubmissions = [];
        this.vectorData = {}; // Store for structured vector data from contributions
        
        // Check localStorage support
        this.localStorageSupported = this._checkLocalStorageSupport();
        
        // Initialize with default data first
        this._initializeDefaultData();
        
        // Then try to load from localStorage, which will override defaults if exists
        if (this.localStorageSupported) {
            this._loadFromLocalStorage();
        }
        
        // Check if we have any academics at all
        if (Object.keys(this.academics).length === 0) {
            console.warn('No academics found in database. Reinitializing with defaults.');
            this._initializeDefaultData();
            if (this.localStorageSupported) {
                this.saveToLocalStorage();
            }
        } else {
            console.log(`Database initialized with ${Object.keys(this.academics).length} academics.`);
        }
    }

    /**
     * Check if localStorage is supported
     * @private
     */
    _checkLocalStorageSupport() {
        try {
            const testKey = 'test';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage not supported. Data will not be saved between sessions.');
            return false;
        }
    }

    /**
     * Initialize with default data if nothing is in localStorage
     * @private
     */
    _initializeDefaultData() {
        console.log('Initializing database with default data...');
        
        // Try to load academics from the JSON file if available
        try {
            // For testing, we'll check if academics are already loaded
            if (Object.keys(this.academics).length === 0) {
                // If we're in a browser, we could try to fetch the academics.json file
                // For simplicity, we'll just add a sample academic if no data is loaded from localStorage
                this.academics = {
                    "sample-academic": {
                        name: "Sample Academic",
                        bio: "This is a sample academic entry.",
                        taxonomies: {
                            discipline: ["Philosophy"],
                            tradition: ["Critical Theory"],
                            era: ["Contemporary"],
                            methodology: ["Textual Analysis"],
                            theme: ["Power"]
                        },
                        papers: [
                            { title: "Sample Paper", year: 2020, coauthors: [] }
                        ],
                        events: [
                            { title: "Sample Event", year: 2021, location: "Virtual Conference" }
                        ],
                        connections: ["Jacques Derrida", "Michel Foucault"]
                    }
                };
                
                // Also try to load the provided academics.json data if we're in a browser context
                try {
                    fetch('academics.json')
                        .then(response => response.json())
                        .then(data => {
                            if (data && Object.keys(data).length > 0) {
                                this.academics = data;
                                console.log(`Loaded ${Object.keys(data).length} academics from academics.json`);
                                this.saveToLocalStorage();
                            }
                        })
                        .catch(error => {
                            console.log('Could not load academics.json, using default data');
                        });
                } catch (fetchError) {
                    // Fetch might not be available or we might not be in a browser
                    console.log('Could not fetch academics.json, using default data');
                }
            }
        } catch (error) {
            console.error('Error initializing default data:', error);
        }
    }

    /**
     * Enhanced load from localStorage with better error handling
     */
    _loadFromLocalStorage() {
        if (!this.localStorageSupported) return;
        
        try {
            const savedAcademics = localStorage.getItem('killphilosophy_academics');
            const savedNoveltyTiles = localStorage.getItem('killphilosophy_noveltyTiles');
            const savedFavorites = localStorage.getItem('killphilosophy_favorites');
            const savedVectorData = localStorage.getItem('killphilosophy_vectorData');
            
            if (savedAcademics) {
                try {
                    const parsed = JSON.parse(savedAcademics);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        this.academics = parsed;
                        console.log(`Loaded ${Object.keys(parsed).length} academics from localStorage`);
                    } else {
                        console.warn('Academics data in localStorage appears invalid');
                    }
                } catch (parseError) {
                    console.error('Error parsing academics from localStorage:', parseError);
                }
            } else {
                console.log('No academics found in localStorage');
            }
            
            // Load novelty tiles
            if (savedNoveltyTiles) {
                try {
                    const parsed = JSON.parse(savedNoveltyTiles);
                    if (Array.isArray(parsed)) {
                        this.noveltyTiles = parsed;
                        console.log(`Loaded ${parsed.length} novelty tiles from localStorage`);
                    }
                } catch (parseError) {
                    console.error('Error parsing novelty tiles from localStorage:', parseError);
                }
            }
            
            // Load favorites
            if (savedFavorites) {
                try {
                    const parsed = JSON.parse(savedFavorites);
                    if (Array.isArray(parsed)) {
                        this.favorites = parsed;
                        console.log(`Loaded ${parsed.length} favorites from localStorage`);
                    }
                } catch (parseError) {
                    console.error('Error parsing favorites from localStorage:', parseError);
                }
            }
            
            // Load vector data
            if (savedVectorData) {
                try {
                    const parsed = JSON.parse(savedVectorData);
                    if (parsed && typeof parsed === 'object') {
                        this.vectorData = parsed;
                        console.log('Loaded vector data from localStorage');
                    }
                } catch (parseError) {
                    console.error('Error parsing vector data from localStorage:', parseError);
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    /**
     * Create a backup of data before saving to localStorage
     * @private
     */
    _createBackup() {
        if (!this.localStorageSupported) return;
        
        try {
            const currentData = localStorage.getItem('killphilosophy_academics');
            if (currentData) {
                localStorage.setItem('killphilosophy_academics_backup', currentData);
                console.log('Created backup of academics data');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    
    /**
     * Restore data from backup if save fails
     * @private
     */
    _restoreFromBackup() {
        if (!this.localStorageSupported) return;
        
        try {
            const backupData = localStorage.getItem('killphilosophy_academics_backup');
            if (backupData) {
                localStorage.setItem('killphilosophy_academics', backupData);
                console.log('Restored academics data from backup');
                
                // Reload data from localStorage
                try {
                    this.academics = JSON.parse(backupData);
                } catch (parseError) {
                    console.error('Error parsing backup data:', parseError);
                }
            }
        } catch (error) {
            console.error('Error restoring from backup:', error);
        }
    }

    /**
     * Enhanced save to localStorage with verification and backup
     */
    saveToLocalStorage() {
        if (!this.localStorageSupported) {
            console.warn('localStorage not supported. Data will not be saved.');
            return;
        }
        
        try {
            // Create backup of existing data first
            this._createBackup();
            
            // Save academics data
            localStorage.setItem('killphilosophy_academics', JSON.stringify(this.academics));
            
            // Save novelty tiles (keep only most recent 50 to save space)
            const sortedTiles = [...this.noveltyTiles].sort((a, b) => new Date(b.date) - new Date(a.date));
            const recentTiles = sortedTiles.slice(0, 50);
            localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(recentTiles));
            
            // Save favorites
            localStorage.setItem('killphilosophy_favorites', JSON.stringify(this.favorites));
            
            // Save vector data
            localStorage.setItem('killphilosophy_vectorData', JSON.stringify(this.vectorData));
            
            // Verify academics data was saved properly
            try {
                const savedAcademics = localStorage.getItem('killphilosophy_academics');
                const parsed = JSON.parse(savedAcademics);
                if (parsed && typeof parsed === 'object') {
                    console.log(`Successfully saved ${Object.keys(parsed).length} academics to localStorage`);
                } else {
                    console.error('Verification failed: academics not properly saved');
                    this._restoreFromBackup();
                }
            } catch (verifyError) {
                console.error('Error verifying saved data:', verifyError);
                this._restoreFromBackup();
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            // If localStorage is full, try to clear space
            if (error.name === 'QuotaExceededError') {
                try {
                    console.warn('localStorage quota exceeded, attempting to free space');
                    
                    // Trim novelty tiles
                    if (this.noveltyTiles.length > 20) {
                        console.warn('Trimming novelty tiles to save space');
                        const sortedTiles = [...this.noveltyTiles].sort((a, b) => new Date(b.date) - new Date(a.date));
                        this.noveltyTiles = sortedTiles.slice(0, 20);
                        localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(this.noveltyTiles));
                    }
                    
                    // Try again with reduced data
                    localStorage.setItem('killphilosophy_academics', JSON.stringify(this.academics));
                    console.log('Successfully saved academics after freeing space');
                } catch (fallbackError) {
                    console.error('Error in fallback save operation:', fallbackError);
                }
            }
        }
    }
    
    /**
     * Get a specific academic by name
     * @param {string} name - Academic name
     * @returns {Object|null} - Academic object or null if not found
     */
    getAcademic(name) {
        if (!name) return null;
        
        // Look for exact match first
        if (this.academics[name]) {
            return this.academics[name];
        }
        
        // Then try case-insensitive match
        const lowerName = name.toLowerCase();
        for (const [key, academic] of Object.entries(this.academics)) {
            if (academic.name.toLowerCase() === lowerName) {
                return academic;
            }
        }
        
        // Finally try finding a normalized version of the name
        const normalizedName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return this.academics[normalizedName] || null;
    }
    
    /**
     * Search academics based on criteria
     * @param {Object} criteria - Search criteria (name, discipline, etc.)
     * @returns {Array} - Array of matching academics
     */
    searchAcademics(criteria = {}) {
        const results = [];
        
        for (const academic of Object.values(this.academics)) {
            let match = true;
            
            // Check name search (partial match)
            if (criteria.name && !academic.name.toLowerCase().includes(criteria.name.toLowerCase())) {
                match = false;
            }
            
            // Check discipline
            if (criteria.discipline && 
                (!academic.taxonomies?.discipline || 
                 !academic.taxonomies.discipline.some(d => d.toLowerCase() === criteria.discipline.toLowerCase()))) {
                match = false;
            }
            
            // Check tradition
            if (criteria.tradition && 
                (!academic.taxonomies?.tradition || 
                 !academic.taxonomies.tradition.some(t => t.toLowerCase() === criteria.tradition.toLowerCase()))) {
                match = false;
            }
            
            // Check era
            if (criteria.era && 
                (!academic.taxonomies?.era || 
                 !academic.taxonomies.era.some(e => e.toLowerCase() === criteria.era.toLowerCase()))) {
                match = false;
            }
            
            // Check theme
            if (criteria.theme && 
                (!academic.taxonomies?.theme || 
                 !academic.taxonomies.theme.some(t => t.toLowerCase() === criteria.theme.toLowerCase()))) {
                match = false;
            }
            
            // Add to results if all criteria match
            if (match) {
                results.push(academic);
            }
        }
        
        return results;
    }
    
    /**
     * Get all academics as an array
     * @returns {Array} - Array of all academic objects
     */
    getAllAcademics() {
        return Object.values(this.academics);
    }
    
    /**
     * Add or update an academic
     * @param {Object} academic - Academic object
     * @returns {boolean} - Success indicator
     */
    addOrUpdateAcademic(academic) {
        if (!academic || !academic.name) {
            console.error('Cannot add academic without a name');
            return false;
        }
        
        try {
            // Normalize the key
            const key = academic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            
            // If academic already exists, merge data
            if (this.academics[key]) {
                const existing = this.academics[key];
                
                // Merge taxonomies
                if (academic.taxonomies) {
                    if (!existing.taxonomies) {
                        existing.taxonomies = {};
                    }
                    
                    for (const category in academic.taxonomies) {
                        if (!existing.taxonomies[category]) {
                            existing.taxonomies[category] = [];
                        }
                        
                        // Add new values that don't already exist
                        academic.taxonomies[category].forEach(value => {
                            if (!existing.taxonomies[category].includes(value)) {
                                existing.taxonomies[category].push(value);
                            }
                        });
                    }
                }
                
                // Merge papers, events, connections
                if (academic.papers) {
                    if (!existing.papers) {
                        existing.papers = [];
                    }
                    
                    academic.papers.forEach(paper => {
                        if (!existing.papers.some(p => p.title === paper.title && p.year === paper.year)) {
                            existing.papers.push(paper);
                        }
                    });
                }
                
                if (academic.events) {
                    if (!existing.events) {
                        existing.events = [];
                    }
                    
                    academic.events.forEach(event => {
                        if (!existing.events.some(e => e.title === event.title && e.year === event.year)) {
                            existing.events.push(event);
                        }
                    });
                }
                
                if (academic.connections) {
                    if (!existing.connections) {
                        existing.connections = [];
                    }
                    
                    academic.connections.forEach(connection => {
                        if (!existing.connections.includes(connection)) {
                            existing.connections.push(connection);
                        }
                    });
                }
                
                // Update basic info if provided
                if (academic.bio && academic.bio !== existing.bio) {
                    existing.bio = academic.bio;
                }
            } else {
                // Add new academic
                this.academics[key] = academic;
            }
            
            // Save changes
            this.saveToLocalStorage();
            
            console.log(`Successfully ${this.academics[key] ? 'updated' : 'added'} academic: ${academic.name}`);
            return true;
        } catch (error) {
            console.error('Error adding/updating academic:', error);
            return false;
        }
    }
    
    /**
     * Add a novelty tile
     * @param {Object} tile - Novelty tile object
     * @returns {boolean} - Success indicator
     */
    addNoveltyTile(tile) {
        if (!tile || !tile.title) {
            console.error('Cannot add novelty tile without a title');
            return false;
        }
        
        try {
            // Add date if not provided
            if (!tile.date) {
                tile.date = new Date().toISOString();
            }
            
            // Add to novelty tiles
            this.noveltyTiles.unshift(tile);
            
            // Keep list manageable
            if (this.noveltyTiles.length > 100) {
                this.noveltyTiles = this.noveltyTiles.slice(0, 100);
            }
            
            // Save changes
            this.saveToLocalStorage();
            
            console.log(`Added novelty tile: ${tile.title}`);
            return true;
        } catch (error) {
            console.error('Error adding novelty tile:', error);
            return false;
        }
    }
    
    /**
     * Get recent novelty tiles
     * @param {number} limit - Maximum number of tiles to return
     * @returns {Array} - Array of novelty tiles
     */
    getRecentNoveltyTiles(limit = 10) {
        return this.noveltyTiles.slice(0, limit);
    }
    
    /**
     * Add an academic to favorites
     * @param {string} academicName - Name of academic to favorite
     * @returns {boolean} - Success indicator
     */
    addToFavorites(academicName) {
        if (!academicName) return false;
        
        try {
            // Check if already in favorites
            if (!this.favorites.includes(academicName)) {
                this.favorites.push(academicName);
                this.saveToLocalStorage();
                console.log(`Added ${academicName} to favorites`);
            }
            return true;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    }
    
    /**
     * Remove an academic from favorites
     * @param {string} academicName - Name of academic to remove
     * @returns {boolean} - Success indicator
     */
    removeFromFavorites(academicName) {
        if (!academicName) return false;
        
        try {
            const index = this.favorites.indexOf(academicName);
            if (index !== -1) {
                this.favorites.splice(index, 1);
                this.saveToLocalStorage();
                console.log(`Removed ${academicName} from favorites`);
            }
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    }
    
    /**
     * Get all favorites
     * @returns {Array} - Array of favorite academic names
     */
    getFavorites() {
        return this.favorites;
    }
    
    /**
     * Get taxonomy categories
     * @param {string} category - Category name
     * @returns {Array} - Array of taxonomy values
     */
    getTaxonomyCategory(category) {
        return this.taxonomyCategories[category] || [];
    }
    
    /**
     * Get all taxonomy categories
     * @returns {Object} - Taxonomy categories object
     */
    getAllTaxonomyCategories() {
        return this.taxonomyCategories;
    }
    
    /**
     * Get academics by connection
     * @param {string} academicName - Name of the academic to find connections for
     * @returns {Array} - Array of connected academics
     */
    getAcademicsByConnection(academicName) {
        if (!academicName) return [];
        
        const connected = [];
        const allAcademics = this.getAllAcademics();
        
        // Find academics that list this academic as a connection
        for (const academic of allAcademics) {
            if (academic.connections && academic.connections.includes(academicName)) {
                connected.push(academic);
            }
        }
        
        return connected;
    }
    
    /**
     * Get network data for visualization
     * @returns {Object} - Network data with nodes and links
     */
    getNetworkData() {
        const nodes = [];
        const links = [];
        const academicMap = new Map();
        
        // Create nodes from academics
        Object.values(this.academics).forEach(academic => {
            if (academic.name) {
                const discipline = academic.taxonomies?.discipline?.[0] || 'Unknown';
                nodes.push({
                    id: academic.name,
                    group: discipline
                });
                academicMap.set(academic.name, academic);
            }
        });
        
        // Create links from connections
        Object.values(this.academics).forEach(academic => {
            if (academic.connections && Array.isArray(academic.connections)) {
                academic.connections.forEach(connection => {
                    // Check if the connected academic exists in our dataset
                    if (academicMap.has(connection)) {
                        links.push({
                            source: academic.name,
                            target: connection,
                            value: 1
                        });
                    }
                });
            }
        });
        
        return { nodes, links };
    }
}

// Initialize the database manager
const databaseManager = new DatabaseManager();

// Make it available globally
window.databaseManager = databaseManager;

// Enhanced DatabaseManager constructor with localStorage feature detection
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
        
        // Rest of the existing method...
    } catch (error) {
        console.error('Error loading from localStorage:', error);
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

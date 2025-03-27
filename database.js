// DatabaseManager class for handling academic data
class DatabaseManager {
    // Enhanced constructor with better initialization
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
        
        // Initialize with default data first
        this._initializeDefaultData();
        
        // Then try to load from localStorage, which will override defaults if exists
        this._loadFromLocalStorage();
        
        // Check if we have any academics at all
        if (Object.keys(this.academics).length === 0) {
            console.warn('No academics found in database. Reinitializing with defaults.');
            this._initializeDefaultData();
            this.saveToLocalStorage();
        } else {
            console.log(`Database initialized with ${Object.keys(this.academics).length} academics.`);
        }
    }

    /**
     * Initialize the database with default academics data
     */
    _initializeDefaultData() {
        // Clear existing data first
        this.academics = {};
        
        // Default academics
        this.addAcademic({
            name: "Jacques Derrida",
            bio: "Jacques Derrida (1930-2004) was a French philosopher known for developing deconstruction, a method of critical analysis that examines the relationship between text and meaning. His work has had a significant impact on literary theory, philosophy, and various other disciplines. Derrida is often associated with post-structuralism and is considered one of the most influential philosophers of the 20th century.",
            taxonomies: {
                discipline: ["Philosophy", "Literary Theory"],
                tradition: ["Post-structuralism"],
                era: ["20th Century"],
                methodology: ["Deconstruction"],
                theme: ["Language", "Identity", "Ethics"]
            },
            papers: [
                { title: "Of Grammatology", year: 1967, coauthors: [] },
                { title: "Writing and Difference", year: 1967, coauthors: [] },
                { title: "Speech and Phenomena", year: 1967, coauthors: [] },
                { title: "Margins of Philosophy", year: 1972, coauthors: [] },
                { title: "Positions", year: 1972, coauthors: [] }
            ],
            events: [
                { title: "Johns Hopkins Conference", year: 1966, location: "Baltimore, USA" },
                { title: "Professor at École Normale Supérieure", year: 1965, location: "Paris, France" },
                { title: "Visiting Professor at Yale", year: 1975, location: "New Haven, USA" }
            ],
            connections: ["Michel Foucault", "Gilles Deleuze", "Emmanuel Levinas", "Jean-François Lyotard", "Judith Butler"]
        });
        
        this.addAcademic({
            name: "Michel Foucault",
            bio: "Michel Foucault (1926-1984) was a French philosopher, historian of ideas, and social theorist whose theories addressed the relationship between power and knowledge and how they are used as a form of social control through societal institutions. He is best known for his critical studies of social institutions, especially psychiatry, medicine, the prison system, and for his work on the history of sexuality.",
            taxonomies: {
                discipline: ["Philosophy", "History", "Sociology"],
                tradition: ["Post-structuralism"],
                era: ["20th Century"],
                methodology: ["Genealogy", "Discourse Analysis"],
                theme: ["Power", "Knowledge", "Sexuality"]
            },
            papers: [
                { title: "The Order of Things", year: 1966, coauthors: [] },
                { title: "The Archaeology of Knowledge", year: 1969, coauthors: [] },
                { title: "Discipline and Punish", year: 1975, coauthors: [] },
                { title: "The History of Sexuality", year: 1976, coauthors: [] },
                { title: "The Birth of the Clinic", year: 1963, coauthors: [] }
            ],
            events: [
                { title: "Collège de France Lectures", year: 1970, location: "Paris, France" },
                { title: "Professor at University of Clermont-Ferrand", year: 1960, location: "Clermont-Ferrand, France" },
                { title: "Visiting Professor at UC Berkeley", year: 1975, location: "Berkeley, USA" }
            ],
            connections: ["Jacques Derrida", "Gilles Deleuze", "Georges Canguilhem", "Jean-Paul Sartre", "Pierre Bourdieu"]
        });
        
        this.addAcademic({
            name: "Judith Butler",
            bio: "Judith Butler (born 1956) is an American philosopher and gender theorist whose work has influenced political philosophy, ethics, and feminist, queer, and literary theory. Butler is best known for their theory of gender performativity, which they introduced in their influential 1990 book 'Gender Trouble'. Their work has had wide-ranging influence on fields including critical theory, cultural studies, and feminist theory.",
            taxonomies: {
                discipline: ["Philosophy", "Gender Studies"],
                tradition: ["Post-structuralism", "Critical Theory"],
                era: ["Contemporary", "20th Century", "21st Century"],
                methodology: ["Textual Analysis", "Genealogy"],
                theme: ["Gender", "Identity", "Ethics"]
            },
            papers: [
                { title: "Gender Trouble", year: 1990, coauthors: [] },
                { title: "Bodies That Matter", year: 1993, coauthors: [] },
                { title: "Precarious Life", year: 2004, coauthors: [] },
                { title: "Excitable Speech", year: 1997, coauthors: [] },
                { title: "Notes Toward a Performative Theory of Assembly", year: 2015, coauthors: [] }
            ],
            events: [
                { title: "Berkeley Faculty", year: 1993, location: "Berkeley, USA" },
                { title: "Adorno Prize", year: 2012, location: "Frankfurt, Germany" },
                { title: "Professor at European Graduate School", year: 2007, location: "Saas-Fee, Switzerland" }
            ],
            connections: ["Michel Foucault", "Jacques Derrida", "Slavoj Žižek", "Donna Haraway", "Sara Ahmed"]
        });
        
        this.addAcademic({
            name: "Gilles Deleuze",
            bio: "Gilles Deleuze (1925-1995) was a French philosopher who wrote on philosophy, literature, film, and fine art. His most popular works were the two volumes of Capitalism and Schizophrenia: Anti-Oedipus and A Thousand Plateaus, both co-written with psychoanalyst Félix Guattari. His work has been influential in diverse fields including philosophy, literary theory, film studies, and art.",
            taxonomies: {
                discipline: ["Philosophy", "Literary Theory"],
                tradition: ["Post-structuralism"],
                era: ["20th Century"],
                methodology: ["Textual Analysis"],
                theme: ["Desire", "Difference", "Immanence"]
            },
            papers: [
                { title: "Difference and Repetition", year: 1968, coauthors: [] },
                { title: "The Logic of Sense", year: 1969, coauthors: [] },
                { title: "Anti-Oedipus", year: 1972, coauthors: ["Félix Guattari"] },
                { title: "A Thousand Plateaus", year: 1980, coauthors: ["Félix Guattari"] },
                { title: "Cinema 1: The Movement-Image", year: 1983, coauthors: [] }
            ],
            events: [
                { title: "Professor at University of Paris VIII", year: 1969, location: "Paris, France" },
                { title: "Professor at Lycée Louis Thuillier", year: 1948, location: "Amiens, France" },
                { title: "Collaboration with Guattari", year: 1969, location: "Paris, France" }
            ],
            connections: ["Félix Guattari", "Michel Foucault", "Jacques Derrida", "Jean-François Lyotard", "Henri Bergson"]
        });
        
        // Create initial novelty tiles
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        this.noveltyTiles = [
            {
                title: "New lecture: Judith Butler on Gender and Performance",
                date: formattedDate,
                academics: ["Judith Butler"],
                description: "A recent talk where Butler revisits their theory of gender performativity in light of new social movements."
            },
            {
                title: "Discovered connection: Michel Foucault and Simone de Beauvoir",
                date: formattedDate,
                academics: ["Michel Foucault", "Simone de Beauvoir"],
                description: "New archival research reveals correspondence between Foucault and Beauvoir discussing concepts of gender and power."
            },
            {
                title: "Recent publication: Analysis of Derrida's later works",
                date: formattedDate,
                academics: ["Jacques Derrida"],
                description: "A comprehensive study examining Derrida's later writings on ethics and their relevance to contemporary political discourse."
            }
        ];
        
        // Initialize vector data with some relationships
        this.vectorData = {
            relationships: [
                { source: "Jacques Derrida", target: "Michel Foucault", type: "contemporaries", strength: 0.8 },
                { source: "Michel Foucault", target: "Judith Butler", type: "influence", strength: 0.9 },
                { source: "Gilles Deleuze", target: "Félix Guattari", type: "collaboration", strength: 1.0 }
            ]
        };
    }

    /**
     * Enhanced load from localStorage with better error handling
     */
    _loadFromLocalStorage() {
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
            
            if (savedNoveltyTiles) {
                try {
                    const parsed = JSON.parse(savedNoveltyTiles);
                    if (Array.isArray(parsed)) {
                        this.noveltyTiles = parsed;
                        console.log(`Loaded ${parsed.length} novelty tiles from localStorage`);
                    } else {
                        console.warn('Novelty tiles data in localStorage appears invalid');
                    }
                } catch (parseError) {
                    console.error('Error parsing novelty tiles from localStorage:', parseError);
                }
            } else {
                console.log('No novelty tiles found in localStorage');
            }
            
            if (savedFavorites) {
                try {
                    const parsed = JSON.parse(savedFavorites);
                    if (Array.isArray(parsed)) {
                        this.favorites = parsed;
                        console.log(`Loaded ${parsed.length} favorites from localStorage`);
                    } else {
                        console.warn('Favorites data in localStorage appears invalid');
                    }
                } catch (parseError) {
                    console.error('Error parsing favorites from localStorage:', parseError);
                }
            } else {
                console.log('No favorites found in localStorage');
            }
            
            if (savedVectorData) {
                try {
                    const parsed = JSON.parse(savedVectorData);
                    if (parsed && typeof parsed === 'object') {
                        this.vectorData = parsed;
                        console.log('Loaded vector data from localStorage');
                    } else {
                        console.warn('Vector data in localStorage appears invalid');
                    }
                } catch (parseError) {
                    console.error('Error parsing vector data from localStorage:', parseError);
                }
            } else {
                console.log('No vector data found in localStorage');
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    /**
     * Enhanced save to localStorage with verification and backup
     */
    saveToLocalStorage() {
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
     * Create a backup of the current data
     * @private
     */
    _createBackup() {
        try {
            localStorage.setItem('killphilosophy_academics_backup', localStorage.getItem('killphilosophy_academics'));
            localStorage.setItem('killphilosophy_noveltyTiles_backup', localStorage.getItem('killphilosophy_noveltyTiles'));
            localStorage.setItem('killphilosophy_favorites_backup', localStorage.getItem('killphilosophy_favorites'));
            localStorage.setItem('killphilosophy_vectorData_backup', localStorage.getItem('killphilosophy_vectorData'));
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    
    /**
     * Restore data from backup
     * @private
     */
    _restoreFromBackup() {
        try {
            console.warn('Attempting to restore data from backup');
            
            const academicsBackup = localStorage.getItem('killphilosophy_academics_backup');
            const noveltyTilesBackup = localStorage.getItem('killphilosophy_noveltyTiles_backup');
            const favoritesBackup = localStorage.getItem('killphilosophy_favorites_backup');
            const vectorDataBackup = localStorage.getItem('killphilosophy_vectorData_backup');
            
            if (academicsBackup) {
                localStorage.setItem('killphilosophy_academics', academicsBackup);
                this.academics = JSON.parse(academicsBackup);
            }
            
            if (noveltyTilesBackup) {
                localStorage.setItem('killphilosophy_noveltyTiles', noveltyTilesBackup);
                this.noveltyTiles = JSON.parse(noveltyTilesBackup);
            }
            
            if (favoritesBackup) {
                localStorage.setItem('killphilosophy_favorites', favoritesBackup);
                this.favorites = JSON.parse(favoritesBackup);
            }
            
            if (vectorDataBackup) {
                localStorage.setItem('killphilosophy_vectorData', vectorDataBackup);
                this.vectorData = JSON.parse(vectorDataBackup);
            }
            
            console.log('Restoration from backup complete');
        } catch (error) {
            console.error('Error restoring from backup:', error);
        }
    }

    /**
     * Add a new academic to the database
     */
    addAcademic(academic) {
        if (!academic || !academic.name) {
            console.error('Invalid academic data:', academic);
            return false;
        }
        
        // Ensure all required fields exist
        academic.bio = academic.bio || '';
        academic.taxonomies = academic.taxonomies || {
            discipline: [],
            tradition: [],
            era: [],
            methodology: [],
            theme: []
        };
        academic.papers = academic.papers || [];
        academic.events = academic.events || [];
        academic.connections = academic.connections || [];
        
        // Store the academic
        this.academics[academic.name] = academic;
        
        // Update vector data for connections
        this._updateVectorData(academic);
        
        // Save changes
        this.saveToLocalStorage();
        console.log(`Added academic: ${academic.name}`);
        return true;
    }

    /**
     * Update an existing academic
     */
    updateAcademic(name, newData) {
        if (!this.academics[name]) {
            console.error(`Academic not found: ${name}`);
            return false;
        }
        
        // Get old connections for vector data update
        const oldConnections = [...(this.academics[name].connections || [])];
        
        // Merge the existing data with new data
        this.academics[name] = {
            ...this.academics[name],
            ...newData
        };
        
        // Update vector data if connections changed
        if (newData.connections && JSON.stringify(oldConnections) !== JSON.stringify(newData.connections)) {
            this._updateVectorData(this.academics[name]);
        }
        
        // Save changes
        this.saveToLocalStorage();
        console.log(`Updated academic: ${name}`);
        return true;
    }
    
    /**
     * Update vector data for an academic
     * @private
     */
    _updateVectorData(academic) {
        if (!academic || !academic.connections) return;
        
        // Initialize relationships array if it doesn't exist
        if (!this.vectorData.relationships) {
            this.vectorData.relationships = [];
        }
        
        // Add or update relationships
        academic.connections.forEach(connection => {
            // Skip if the connection is to itself
            if (connection === academic.name) return;
            
            // Check if relationship already exists
            const existingRelationship = this.vectorData.relationships.find(r => 
                (r.source === academic.name && r.target === connection) ||
                (r.source === connection && r.target === academic.name)
            );
            
            if (existingRelationship) {
                // Update strength
                existingRelationship.strength = Math.min(existingRelationship.strength + 0.1, 1.0);
            } else {
                // Create new relationship
                const connectedAcademic = this.getAcademic(connection);
                let relationshipType = 'connection';
                
                // Determine relationship type if possible
                if (connectedAcademic) {
                    // Check for bidirectional connection
                    const isBidirectional = connectedAcademic.connections && 
                                          connectedAcademic.connections.includes(academic.name);
                    
                    if (isBidirectional) {
                        // Check eras to determine influence direction
                        if (academic.taxonomies && connectedAcademic.taxonomies &&
                            academic.taxonomies.era && connectedAcademic.taxonomies.era) {
                            const academicEra = academic.taxonomies.era[0];
                            const connectedEra = connectedAcademic.taxonomies.era[0];
                            
                            if (academicEra === 'Contemporary' && connectedEra !== 'Contemporary') {
                                relationshipType = 'influenced by';
                            } else if (academicEra !== 'Contemporary' && connectedEra === 'Contemporary') {
                                relationshipType = 'influences';
                            } else {
                                relationshipType = 'contemporaries';
                            }
                        }
                    }
                }
                
                // Add new relationship
                this.vectorData.relationships.push({
                    source: academic.name,
                    target: connection,
                    type: relationshipType,
                    strength: 0.5 // Initial strength
                });
            }
        });
    }

    /**
     * Delete an academic from the database
     */
    deleteAcademic(name) {
        if (!this.academics[name]) {
            console.error(`Academic not found: ${name}`);
            return false;
        }
        
        // Remove the academic
        delete this.academics[name];
        
        // Remove from favorites
        this.favorites = this.favorites.filter(fav => fav !== name);
        
        // Remove from vector data
        if (this.vectorData.relationships) {
            this.vectorData.relationships = this.vectorData.relationships.filter(rel => 
                rel.source !== name && rel.target !== name
            );
        }
        
        // Save changes
        this.saveToLocalStorage();
        console.log(`Deleted academic: ${name}`);
        return true;
    }

    /**
     * Get an academic by name (case-insensitive search with fuzzy matching)
     */
    getAcademic(name) {
        if (!name) return null;
        
        // Check for exact match first
        if (this.academics[name]) {
            return this.academics[name];
        }
        
        // Try case-insensitive search
        const normalizedName = name.toLowerCase();
        for (const key in this.academics) {
            if (key.toLowerCase() === normalizedName) {
                return this.academics[key];
            }
        }
        
        // Try fuzzy matching for partial names
        const academicNames = Object.keys(this.academics);
        const matchingNames = academicNames.filter(academicName => 
            academicName.toLowerCase().includes(normalizedName) || 
            normalizedName.includes(academicName.toLowerCase())
        );
        
        if (matchingNames.length > 0) {
            // Return the closest match (shortest length difference)
            matchingNames.sort((a, b) => 
                Math.abs(a.length - name.length) - Math.abs(b.length - name.length)
            );
            return this.academics[matchingNames[0]];
        }
        
        // Not found
        return null;
    }

    /**
     * Search for academics by criteria
     */
    searchAcademics(criteria) {
        const results = [];
        
        for (const academicName in this.academics) {
            const academic = this.academics[academicName];
            let match = true;
            
            if (criteria.name && !academic.name.toLowerCase().includes(criteria.name.toLowerCase())) {
                match = false;
            }
            
            if (match && criteria.discipline && academic.taxonomies && academic.taxonomies.discipline) {
                if (!academic.taxonomies.discipline.some(d => d.toLowerCase().includes(criteria.discipline.toLowerCase()))) {
                    match = false;
                }
            }
            
            if (match && criteria.tradition && academic.taxonomies && academic.taxonomies.tradition) {
                if (!academic.taxonomies.tradition.some(t => t.toLowerCase().includes(criteria.tradition.toLowerCase()))) {
                    match = false;
                }
            }
            
            if (match && criteria.era && academic.taxonomies && academic.taxonomies.era) {
                if (!academic.taxonomies.era.some(e => e.toLowerCase().includes(criteria.era.toLowerCase()))) {
                    match = false;
                }
            }
            
            if (match && criteria.theme && academic.taxonomies && academic.taxonomies.theme) {
                if (!academic.taxonomies.theme.some(t => t.toLowerCase().includes(criteria.theme.toLowerCase()))) {
                    match = false;
                }
            }
            
            if (match) {
                results.push(academic);
            }
        }
        
        return results;
    }

    /**
     * Get all academics as an array
     */
    getAllAcademics() {
        return Object.values(this.academics);
    }

    /**
     * Add a new novelty tile
     */
    addNoveltyTile(tileData) {
        if (!tileData.title || !tileData.academics || !tileData.academics.length) {
            console.error('Invalid novelty tile data', tileData);
            return false;
        }
        
        // Add current date if not provided
        if (!tileData.date) {
            const now = new Date();
            tileData.date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        }
        
        // Ensure there's no duplicate title (avoid adding same tile twice)
        const existingTile = this.noveltyTiles.find(tile => tile.title === tileData.title);
        if (existingTile) {
            console.log('Duplicate novelty tile prevented:', tileData.title);
            return false;
        }
        
        // Add unique ID to tile
        tileData.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        
        // Add to the beginning of the array
        this.noveltyTiles.unshift(tileData);
        
        // Update vector data if the tile involves connections
        if (tileData.academics.length > 1) {
            for (let i = 0; i < tileData.academics.length; i++) {
                for (let j = i + 1; j < tileData.academics.length; j++) {
                    const academic1 = tileData.academics[i];
                    const academic2 = tileData.academics[j];
                    
                    // Add or strengthen relationship
                    const existingRelationship = this.vectorData.relationships?.find(r => 
                        (r.source === academic1 && r.target === academic2) ||
                        (r.source === academic2 && r.target === academic1)
                    );
                    
                    if (existingRelationship) {
                        existingRelationship.strength = Math.min(existingRelationship.strength + 0.1, 1.0);
                    } else if (this.vectorData.relationships) {
                        this.vectorData.relationships.push({
                            source: academic1,
                            target: academic2,
                            type: tileData.title.toLowerCase().includes('influence') ? 'influence' : 'connection',
                            strength: 0.5
                        });
                    }
                }
            }
        }
        
        this.saveToLocalStorage();
        console.log('Added new novelty tile:', tileData.title);
        return true;
    }

    /**
     * Get all novelty tiles
     */
    getNoveltyTiles() {
        return this.noveltyTiles;
    }
    
    /**
     * Get novelty tiles for a specific academic
     */
    getNoveltyTilesForAcademic(academicName) {
        if (!academicName) return [];
        
        return this.noveltyTiles.filter(tile => 
            tile.academics && tile.academics.includes(academicName)
        );
    }
    
    /**
     * Add an academic to favorites
     */
    addToFavorites(academicName) {
        if (!academicName || !this.academics[academicName]) {
            console.error(`Cannot add to favorites: ${academicName} not found`);
            return false;
        }
        
        if (!this.favorites.includes(academicName)) {
            this.favorites.push(academicName);
            this.saveToLocalStorage();
            console.log(`Added ${academicName} to favorites`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Remove an academic from favorites
     */
    removeFromFavorites(academicName) {
        if (!this.favorites.includes(academicName)) {
            return false;
        }
        
        this.favorites = this.favorites.filter(fav => fav !== academicName);
        this.saveToLocalStorage();
        console.log(`Removed ${academicName} from favorites`);
        return true;
    }
    
    /**
     * Get favorite academics
     */
    getFavorites() {
        return this.favorites.map(fav => this.academics[fav]).filter(Boolean);
    }
    
    /**
     * Check if an academic is in favorites
     */
    isFavorite(academicName) {
        return this.favorites.includes(academicName);
    }

    /**
     * Generate a mock academic profile for deep search results
     * Enhanced to create more realistic and interconnected profiles
     */
    generateMockAcademic(name, relatedName = null) {
        // Create a standardized name format
        const formattedName = name.trim();
        if (!formattedName) return null;
        
        // Generate random taxonomies from the available categories
        const generateRandomTaxonomies = () => {
            const result = {};
            for (const category in this.taxonomyCategories) {
                const allOptions = this.taxonomyCategories[category];
                const numToSelect = Math.floor(Math.random() * 3) + 1; // 1-3 items
                result[category] = [];
                
                // Create a set of already selected items to avoid duplicates
                const selected = new Set();
                
                for (let i = 0; i < numToSelect; i++) {
                    let randomIndex;
                    let randomItem;
                    // Make sure we don't select the same item twice
                    do {
                        randomIndex = Math.floor(Math.random() * allOptions.length);
                        randomItem = allOptions[randomIndex];
                    } while (selected.has(randomItem) && selected.size < allOptions.length);
                    
                    // Add to results if not already selected
                    if (!selected.has(randomItem)) {
                        selected.add(randomItem);
                        result[category].push(randomItem);
                    }
                }
            }
            return result;
        };
        
        // Generate papers with more diverse titles and realistic years
        const generatePapers = (numPapers = 3) => {
            // Base paper titles inspired by academic writing patterns
            const paperTitles = [
                "On the Question of Being", 
                "Critical Perspectives on Modern Society",
                "The Ethics of Difference",
                "Power and Knowledge in Contemporary Discourse",
                "Truth and Method Reconsidered",
                "Language and Reality",
                "The Structures of Social Consciousness",
                "Dialectics of Liberation",
                "Foundations of Critical Theory",
                "Identity and Otherness",
                "Beyond Binaries",
                "Reimagining Political Agency",
                "Towards a New Paradigm",
                "Deconstructing Historical Narratives",
                "The Problem of Representation"
            ];
            
            // Variation patterns to make titles more diverse
            const variationPatterns = [
                { prefix: "", suffix: "" },
                { prefix: "", suffix: ": A New Approach" },
                { prefix: "", suffix: " Revisited" },
                { prefix: "", suffix: ": Critical Perspectives" },
                { prefix: "Beyond ", suffix: "" },
                { prefix: "Rethinking ", suffix: "" },
                { prefix: "Towards a Theory of ", suffix: "" },
                { prefix: "The Politics of ", suffix: "" },
                { prefix: "", suffix: " in Contemporary Thought" },
                { prefix: "", suffix: " and Its Discontents" },
            ];
            
            const papers = [];
            const usedTitles = new Set();
            
            for (let i = 0; i < numPapers; i++) {
                let title;
                do {
                    const baseTitle = paperTitles[Math.floor(Math.random() * paperTitles.length)];
                    const variation = variationPatterns[Math.floor(Math.random() * variationPatterns.length)];
                    title = variation.prefix + baseTitle + variation.suffix;
                } while (usedTitles.has(title));
                
                usedTitles.add(title);
                
                // Generate a plausible year, weighted toward more recent years
                const currentYear = new Date().getFullYear();
                // Random number between 0 and 1, but squared to weight toward 1
                const randomFactor = Math.pow(Math.random(), 2);
                // Map to a year between 1970 and current year, with more weight on recent years
                const year = Math.floor(1970 + randomFactor * (currentYear - 1970));
                
                papers.push({ 
                    title, 
                    year, 
                    coauthors: [] 
                });
            }
            
            return papers;
        };
        
        // Generate realistic events
        const generateEvents = (numEvents = 2) => {
            const eventTypes = [
                "Conference Presentation", 
                "Lecture Series", 
                "Workshop", 
                "Symposium", 
                "Faculty Position",
                "Keynote Address",
                "Panel Discussion",
                "Visiting Professor",
                "Research Fellowship",
                "Book Launch"
            ];
            
            const locations = [
                "Paris, France", 
                "Berlin, Germany", 
                "New York, USA", 
                "London, UK", 
                "Tokyo, Japan", 
                "San Francisco, USA",
                "Oxford, UK",
                "Cambridge, UK",
                "Vienna, Austria",
                "Amsterdam, Netherlands",
                "Copenhagen, Denmark",
                "Toronto, Canada",
                "Sydney, Australia"
            ];
            
            const events = [];
            
            for (let i = 0; i < numEvents; i++) {
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                const location = locations[Math.floor(Math.random() * locations.length)];
                
                // Generate a plausible year, weighted toward more recent years
                const currentYear = new Date().getFullYear();
                const randomFactor = Math.pow(Math.random(), 2);
                const year = Math.floor(1980 + randomFactor * (currentYear - 1980));
                
                // Generate event title
                let title;
                if (eventType === "Faculty Position" || eventType === "Visiting Professor" || eventType === "Research Fellowship") {
                    const institutions = [
                        "University of Paris", "Harvard University", "Oxford University", 
                        "University of Berlin", "New York University", "University of Tokyo",
                        "University of California", "Princeton University", "Cambridge University",
                        "University of Amsterdam", "University of Copenhagen", "University of Toronto"
                    ];
                    const institution = institutions[Math.floor(Math.random() * institutions.length)];
                    title = `${eventType} at ${institution}`;
                } else {
                    const topics = [
                        "Contemporary Theory", 
                        "Critical Discourse", 
                        "Philosophical Debates",
                        "Political Philosophy",
                        "Ethics and Society",
                        "Cultural Studies",
                        "Social Theory",
                        "Identity Politics"
                    ];
                    const topic = topics[Math.floor(Math.random() * topics.length)];
                    title = `${eventType} on ${topic}`;
                }
                
                events.push({
                    title,
                    year,
                    location
                });
            }
            
            return events;
        };
        
        // Generate connections with a mix of existing academics and the related academic
        const generateConnections = () => {
            const connections = [];
            
            // Add the related academic if provided
            if (relatedName) {
                connections.push(relatedName);
            }
            
            // Add some random existing academics
            const existingAcademics = Object.keys(this.academics);
            const maxConnections = Math.min(4, existingAcademics.length);
            const numToAdd = Math.floor(Math.random() * maxConnections) + 1;
            
            const addedSet = new Set(connections);
            
            for (let i = 0; i < numToAdd; i++) {
                let randomAcademic;
                do {
                    randomAcademic = existingAcademics[Math.floor(Math.random() * existingAcademics.length)];
                } while (addedSet.has(randomAcademic) || randomAcademic === formattedName);
                
                connections.push(randomAcademic);
                addedSet.add(randomAcademic);
            }
            
            return connections;
        };
        
        // Generate a plausible bio that uses taxonomies
        const generateBio = (taxonomies) => {
            const discipline = taxonomies.discipline[0] || "Philosophy";
            const tradition = taxonomies.tradition[0] || "Critical Theory";
            const era = taxonomies.era[0] || "Contemporary";
            const methodology = taxonomies.methodology[0] || "Textual Analysis";
            const theme = taxonomies.theme && taxonomies.theme.length > 0 
                ? taxonomies.theme.join(", ").replace(/,([^,]*)$/, " and$1") 
                : "philosophical questions";
            
            // Determine if the academic is contemporary (living) or historical
            const isContemporary = era.includes("Contemporary") || era.includes("21st Century");
            
            // Verb tense based on whether the academic is contemporary
            const verb = isContemporary ? "is" : "was";
            const adj = isContemporary ? "Active" : "Known for work";
            
            // Generate birth year (and death year for historical figures)
            const currentYear = new Date().getFullYear();
            let birthYear, deathYear = "";
            
            if (era === "Ancient") {
                birthYear = Math.floor(Math.random() * 500) + 1;
                deathYear = ` (${birthYear}-${birthYear + Math.floor(Math.random() * 50) + 30})`;
            } else if (era === "Medieval") {
                birthYear = Math.floor(Math.random() * 700) + 500;
                deathYear = ` (${birthYear}-${birthYear + Math.floor(Math.random() * 50) + 30})`;
            } else if (era === "Modern") {
                birthYear = Math.floor(Math.random() * 150) + 1750;
                deathYear = ` (${birthYear}-${birthYear + Math.floor(Math.random() * 50) + 30})`;
            } else if (era === "20th Century" && !isContemporary) {
                birthYear = Math.floor(Math.random() * 60) + 1900;
                deathYear = ` (${birthYear}-${birthYear + Math.floor(Math.random() * 70) + 30})`;
            } else if (isContemporary) {
                birthYear = Math.floor(Math.random() * 50) + 1940;
                if (birthYear < 1960) {
                    deathYear = ` (born ${birthYear})`;
                }
            }
            
            // Generate bio templates
            const bioTemplates = [
                `${formattedName}${deathYear} ${verb} a prominent figure in ${era} ${discipline}, known for their work in ${tradition}. They have pioneered new approaches to ${methodology} and made significant contributions to the study of ${theme}.`,
                
                `${adj} in the field of ${discipline}, ${formattedName}${deathYear} ${verb} primarily associated with ${tradition}. Their work focuses on ${theme} through the lens of ${methodology}.`,
                
                `A leading scholar in ${discipline}, ${formattedName}${deathYear} ${verb} recognized for their innovative contributions to ${tradition}. Their research employs ${methodology} to explore questions related to ${theme}.`,
                
                `${formattedName}${deathYear} ${verb} an influential theorist whose work bridges ${discipline} and ${tradition}. Through rigorous ${methodology}, they have developed critical insights into ${theme}.`,
                
                `As a key figure in ${era} ${tradition}, ${formattedName}${deathYear} ${verb} known for applying ${methodology} to ${discipline}. Their scholarship has reshaped contemporary understandings of ${theme}.`
            ];
            
            // Select a random bio template
            return bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
        };
        
        // Generate the academic profile
        const taxonomies = generateRandomTaxonomies();
        const papers = generatePapers(Math.floor(Math.random() * 3) + 3); // 3-5 papers
        const events = generateEvents(Math.floor(Math.random() * 2) + 1); // 1-2 events
        const connections = generateConnections();
        const bio = generateBio(taxonomies);
        
        const academic = {
            name: formattedName,
            bio,
            taxonomies,
            papers,
            events,
            connections
        };
        
        return academic;
    }
    
    /**
     * Get vector data for visualization
     */
    getVectorData() {
        return this.vectorData;
    }
    
    /**
     * Find path between two academics
     */
    findConnection(academic1, academic2, maxDepth = 3) {
        if (!academic1 || !academic2 || academic1 === academic2) {
            return null;
        }
        
        // BFS to find shortest path
        const queue = [[academic1]];
        const visited = new Set([academic1]);
        
        while (queue.length > 0 && queue[0].length <= maxDepth) {
            const path = queue.shift();
            const currentNode = path[path.length - 1];
            
            // Get the academic object
            const academic = this.academics[currentNode];
            if (!academic || !academic.connections) continue;
            
            for (const connection of academic.connections) {
                if (connection === academic2) {
                    // Found the target
                    return [...path, connection];
                }
                
                if (!visited.has(connection)) {
                    visited.add(connection);
                    queue.push([...path, connection]);
                }
            }
        }
        
        return null; // No path found within maxDepth
    }
    
    /**
     * Get recommended academics based on user's browsing history
     */
    getRecommendedAcademics(browsingHistory = [], maxRecommendations = 5) {
        if (!browsingHistory || browsingHistory.length === 0) {
            // If no browsing history, return some popular academics
            return this.getAllAcademics()
                .sort((a, b) => (b.connections?.length || 0) - (a.connections?.length || 0))
                .slice(0, maxRecommendations);
        }
        
        // Count appearance of taxonomies in browsing history
        const taxonomyCounts = {
            discipline: {},
            tradition: {},
            era: {},
            methodology: {},
            theme: {}
        };
        
        browsingHistory.forEach(academicName => {
            const academic = this.getAcademic(academicName);
            if (!academic || !academic.taxonomies) return;
            
            for (const category in academic.taxonomies) {
                if (!academic.taxonomies[category]) continue;
                
                academic.taxonomies[category].forEach(value => {
                    if (!taxonomyCounts[category][value]) {
                        taxonomyCounts[category][value] = 0;
                    }
                    taxonomyCounts[category][value]++;
                });
            }
        });
        
        // Score all academics based on taxonomy matches
        const scoredAcademics = this.getAllAcademics().map(academic => {
            if (!academic.taxonomies) return { academic, score: 0 };
            
            let score = 0;
            
            for (const category in academic.taxonomies) {
                if (!academic.taxonomies[category]) continue;
                
                academic.taxonomies[category].forEach(value => {
                    if (taxonomyCounts[category][value]) {
                        score += taxonomyCounts[category][value];
                    }
                });
            }
            
            // Boost score for academics with connections to browsing history
            if (academic.connections) {
                academic.connections.forEach(connection => {
                    if (browsingHistory.includes(connection)) {
                        score += 5;
                    }
                });
            }
            
            // Reduce score for academics already in browsing history
            if (browsingHistory.includes(academic.name)) {
                score -= 100; // Effectively excludes them
            }
            
            return { academic, score };
        });
        
        // Sort by score and return top recommendations
        return scoredAcademics
            .sort((a, b) => b.score - a.score)
            .filter(item => item.score > 0)
            .slice(0, maxRecommendations)
            .map(item => item.academic);
    }
}

// Initialize the database manager
const databaseManager = new DatabaseManager();

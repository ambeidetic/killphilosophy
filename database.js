// DatabaseManager class for handling academic data
class DatabaseManager {
    // Enhanced constructor with better initialization
    constructor() {
        this.academics = {};
        this.noveltyTiles = [];
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
            bio: "French philosopher known for developing deconstruction",
            taxonomies: {
                discipline: ["Philosophy", "Literary Theory"],
                tradition: ["Post-structuralism"],
                era: ["20th Century"],
                methodology: ["Deconstruction"],
                theme: ["Language", "Identity"]
            },
            papers: [
                { title: "Of Grammatology", year: 1967, coauthors: [] },
                { title: "Writing and Difference", year: 1967, coauthors: [] },
                { title: "Speech and Phenomena", year: 1967, coauthors: [] }
            ],
            events: [
                { title: "Johns Hopkins Conference", year: 1966, location: "Baltimore, USA" }
            ],
            connections: ["Michel Foucault", "Gilles Deleuze", "Emmanuel Levinas"]
        });
        
        this.addAcademic({
            name: "Michel Foucault",
            bio: "French philosopher known for his work on power, knowledge, and discourse",
            taxonomies: {
                discipline: ["Philosophy", "History", "Sociology"],
                tradition: ["Post-structuralism"],
                era: ["20th Century"],
                methodology: ["Genealogy", "Discourse Analysis"],
                theme: ["Power", "Knowledge", "Sexuality"]
            },
            papers: [
                { title: "The History of Sexuality", year: 1976, coauthors: [] },
                { title: "Discipline and Punish", year: 1975, coauthors: [] },
                { title: "The Order of Things", year: 1966, coauthors: [] }
            ],
            events: [
                { title: "Collège de France Lectures", year: 1970, location: "Paris, France" }
            ],
            connections: ["Jacques Derrida", "Gilles Deleuze", "Georges Canguilhem"]
        });
        
        this.addAcademic({
            name: "Judith Butler",
            bio: "American philosopher and gender theorist",
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
                { title: "Precarious Life", year: 2004, coauthors: [] }
            ],
            events: [
                { title: "Berkeley Faculty", year: 1993, location: "Berkeley, USA" }
            ],
            connections: ["Michel Foucault", "Jacques Derrida", "Slavoj Žižek"]
        });
        
        // Create some initial novelty tiles
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        this.noveltyTiles = [
            {
                title: "New lecture: Judith Butler on Gender and Performance",
                date: formattedDate,
                academics: ["Judith Butler"],
                description: "A recent talk where Butler revisits her theory of gender performativity in light of new social movements."
            },
            {
                title: "Discovered manuscript: Unpublished Foucault lectures",
                date: formattedDate,
                academics: ["Michel Foucault"],
                description: "Recently uncovered lecture notes from Foucault's time at the University of Tunis (1966-1968)."
            }
        ];
    }

    /**
     * Enhanced load from localStorage with better error handling
     */
    _loadFromLocalStorage() {
        try {
            const savedAcademics = localStorage.getItem('killphilosophy_academics');
            const savedNoveltyTiles = localStorage.getItem('killphilosophy_noveltyTiles');
            
            if (savedAcademics) {
                try {
                    const parsed = JSON.parse(savedAcademics);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        // Merge with defaults to ensure we don't lose core data
                        this.academics = {...this.academics, ...parsed};
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
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    /**
     * Enhanced save to localStorage with verification
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('killphilosophy_academics', JSON.stringify(this.academics));
            localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(this.noveltyTiles));
            
            // Verify that data was saved properly
            try {
                const savedAcademics = localStorage.getItem('killphilosophy_academics');
                const parsed = JSON.parse(savedAcademics);
                if (parsed && typeof parsed === 'object') {
                    console.log(`Successfully saved ${Object.keys(parsed).length} academics to localStorage`);
                } else {
                    console.error('Verification failed: academics not properly saved');
                }
            } catch (verifyError) {
                console.error('Error verifying saved data:', verifyError);
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            // If localStorage is full, try to clear old data
            if (error.name === 'QuotaExceededError') {
                try {
                    // Trim novelty tiles to prevent localStorage overflow
                    if (this.noveltyTiles.length > 10) {
                        console.warn('Trimming novelty tiles to save space');
                        this.noveltyTiles = this.noveltyTiles.slice(0, 10);
                        localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(this.noveltyTiles));
                    }
                } catch (fallbackError) {
                    console.error('Error in fallback save operation:', fallbackError);
                }
            }
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
        
        // Merge the existing data with new data
        this.academics[name] = {
            ...this.academics[name],
            ...newData
        };
        
        // Save changes
        this.saveToLocalStorage();
        console.log(`Updated academic: ${name}`);
        return true;
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
        
        // Save changes
        this.saveToLocalStorage();
        console.log(`Deleted academic: ${name}`);
        return true;
    }

    /**
     * Get an academic by name (case-insensitive search)
     */
    getAcademic(name) {
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
        
        // Not found
        return null;
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
        
        // Add to the beginning of the array
        this.noveltyTiles.unshift(tileData);
        
        // Keep only the most recent 20 tiles
        if (this.noveltyTiles.length > 20) {
            this.noveltyTiles = this.noveltyTiles.slice(0, 20);
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
     * Generate a mock academic profile for deep search results
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
        
        // Generate some plausible paper titles
        const generatePapers = (numPapers = 3) => {
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
                "Identity and Otherness"
            ];
            
            const papers = [];
            const usedTitles = new Set();
            
            for (let i = 0; i < numPapers; i++) {
                let title;
                do {
                    const baseTitle = paperTitles[Math.floor(Math.random() * paperTitles.length)];
                    // Add a variation to make titles more unique
                    const variations = ["", ": A New Approach", " Revisited", ": Critical Perspectives"];
                    title = baseTitle + variations[Math.floor(Math.random() * variations.length)];
                } while (usedTitles.has(title));
                
                usedTitles.add(title);
                
                // Generate a plausible year between 1970 and current year
                const currentYear = new Date().getFullYear();
                const year = Math.floor(Math.random() * (currentYear - 1970)) + 1970;
                
                papers.push({ 
                    title, 
                    year, 
                    coauthors: [] 
                });
            }
            
            return papers;
        };
        
        // Generate some plausible events
        const generateEvents = (numEvents = 2) => {
            const eventTypes = ["Conference", "Lecture Series", "Workshop", "Symposium", "Faculty Position"];
            const locations = ["Paris, France", "Berlin, Germany", "New York, USA", "London, UK", "Tokyo, Japan", "San Francisco, USA"];
            
            const events = [];
            
            for (let i = 0; i < numEvents; i++) {
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                const location = locations[Math.floor(Math.random() * locations.length)];
                
                // Generate a plausible year between 1980 and current year
                const currentYear = new Date().getFullYear();
                const year = Math.floor(Math.random() * (currentYear - 1980)) + 1980;
                
                events.push({
                    title: `${eventType} on Contemporary Theory`,
                    year,
                    location
                });
            }
            
            return events;
        };
        
        // Generate connections - include the related academic if provided
        const generateConnections = () => {
            const connections = [];
            
            // Add the related academic if provided
            if (relatedName) {
                connections.push(relatedName);
            }
            
            // Add some random existing academics
            const existingAcademics = Object.keys(this.academics);
            const numToAdd = Math.min(2, existingAcademics.length);
            
            const addedSet = new Set(connections);
            
            for (let i = 0; i < numToAdd; i++) {
                let randomAcademic;
                do {
                    randomAcademic = existingAcademics[Math.floor(Math.random() * existingAcademics.length)];
                } while (addedSet.has(randomAcademic));
                
                connections.push(randomAcademic);
                addedSet.add(randomAcademic);
            }
            
            return connections;
        };
        
        // Generate a plausible bio
        const generateBio = (taxonomies) => {
            const discipline = taxonomies.discipline[0] || "Philosophy";
            const tradition = taxonomies.tradition[0] || "Critical Theory";
            const era = taxonomies.era[0] || "Contemporary";
            const methodology = taxonomies.methodology[0] || "Textual Analysis";
            
            return `${formattedName} is a prominent figure in ${era} ${discipline}, known for their work in ${tradition}. They have pioneered new approaches to ${methodology} and made significant contributions to theoretical discourse.`;
        };
        
        // Generate the academic profile
        const taxonomies = generateRandomTaxonomies();
        const papers = generatePapers();
        const events = generateEvents();
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
}

// Initialize the database manager
const databaseManager = new DatabaseManager();

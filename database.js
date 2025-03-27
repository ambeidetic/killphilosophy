/**
 * KillPhilosophy Database Management
 * 
 * This module handles the database operations for the KillPhilosophy project.
 * It manages loading, saving, and modifying the academic database, which is stored
 * as JSON files in the GitHub repository.
 */

class DatabaseManager {
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
        
        // Initialize with default data
        this._initializeDefaultData();
        
        // Try to load from localStorage for development
        this._loadFromLocalStorage();
    }
    
    /**
     * Initialize with default academic data
     */
    _initializeDefaultData() {
        // Default academics
        this.academics = {
            "michel-foucault": {
                name: "Michel Foucault",
                dates: "1926-1984",
                bio: "French philosopher, historian of ideas, and social theorist. His theories addressed the relationship between power and knowledge, and how they are used as a form of social control through societal institutions.",
                taxonomies: {
                    discipline: ["Philosophy", "History", "Sociology"],
                    tradition: ["Post-structuralism", "Critical Theory"],
                    era: ["20th Century", "Contemporary"],
                    methodology: ["Genealogy", "Archaeology of Knowledge"],
                    theme: ["Power", "Knowledge", "Governmentality", "Biopower", "Sexuality", "Madness"]
                },
                papers: [
                    {
                        title: "The Order of Things",
                        year: "1966",
                        journal: "Éditions Gallimard",
                        url: "#"
                    },
                    {
                        title: "Discipline and Punish",
                        year: "1975",
                        journal: "Éditions Gallimard",
                        url: "#"
                    },
                    {
                        title: "The History of Sexuality",
                        year: "1976-1984",
                        journal: "Éditions Gallimard",
                        url: "#"
                    }
                ],
                events: [
                    {
                        title: "Lectures at the Collège de France",
                        date: "1970-1984",
                        location: "Paris, France",
                        description: "Series of annual lectures on various topics including governmentality, biopolitics, and the history of sexuality."
                    },
                    {
                        title: "Debate with Noam Chomsky",
                        date: "November 1971",
                        location: "Eindhoven, Netherlands",
                        description: "Television debate on human nature and justice, moderated by Fons Elders."
                    }
                ],
                connections: [
                    {
                        name: "Gilles Deleuze",
                        type: "collaboration",
                        description: "Collaborated on political activism and shared theoretical interests in power and institutions."
                    },
                    {
                        name: "Jacques Derrida",
                        type: "critique",
                        description: "Complex intellectual relationship with occasional critiques, particularly regarding Foucault's 'History of Madness'."
                    },
                    {
                        name: "Georges Canguilhem",
                        type: "influence",
                        description: "Canguilhem was Foucault's doctoral advisor and influenced his work in the philosophy of science."
                    }
                ]
            },
            "judith-butler": {
                name: "Judith Butler",
                dates: "1956-present",
                bio: "American philosopher and gender theorist whose work has influenced political philosophy, ethics, and feminist, queer, and literary theory. Known for theory of gender performativity.",
                taxonomies: {
                    discipline: ["Philosophy", "Gender Studies", "Literary Theory"],
                    tradition: ["Post-structuralism", "Feminism", "Queer Theory"],
                    era: ["20th Century", "21st Century", "Contemporary"],
                    methodology: ["Discursive Analysis", "Performativity Theory"],
                    theme: ["Gender", "Sexuality", "Identity", "Performativity", "Ethics"]
                },
                papers: [
                    {
                        title: "Gender Trouble: Feminism and the Subversion of Identity",
                        year: "1990",
                        journal: "Routledge",
                        url: "#"
                    },
                    {
                        title: "Bodies That Matter: On the Discursive Limits of Sex",
                        year: "1993",
                        journal: "Routledge",
                        url: "#"
                    },
                    {
                        title: "Notes Toward a Performative Theory of Assembly",
                        year: "2015",
                        journal: "Harvard University Press",
                        url: "#"
                    }
                ],
                events: [
                    {
                        title: "Adorno Prize Ceremony",
                        date: "September 11, 2012",
                        location: "Frankfurt, Germany",
                        description: "Received the Theodor W. Adorno Award despite controversy over Butler's positions on Israel and Palestine."
                    },
                    {
                        title: "Lecture: 'Why Bodies Matter'",
                        date: "June 2, 2015",
                        location: "UCLA, Los Angeles, CA",
                        description: "Lecture on embodiment, vulnerability, and political assembly."
                    }
                ],
                connections: [
                    {
                        name: "Michel Foucault",
                        type: "influence",
                        description: "Butler's work draws heavily on Foucault's theories of power and discourse."
                    },
                    {
                        name: "Slavoj Žižek",
                        type: "critique",
                        description: "Engaged in public debates around theories of subjectivity and political transformation."
                    },
                    {
                        name: "Donna Haraway",
                        type: "collaboration",
                        description: "Shared intellectual frameworks around feminist theory and the critique of binary categories."
                    }
                ]
            },
            "slavoj-zizek": {
                name: "Slavoj Žižek",
                dates: "1949-present",
                bio: "Slovenian philosopher, cultural critic, and Lacanian psychoanalyst. Known for his use of Hegelian and Lacanian concepts to analyze popular culture and politics.",
                taxonomies: {
                    discipline: ["Philosophy", "Cultural Studies", "Film Theory", "Psychoanalysis"],
                    tradition: ["Marxism", "Hegelianism", "Lacanian Psychoanalysis"],
                    era: ["20th Century", "21st Century", "Contemporary"],
                    methodology: ["Dialectical Analysis", "Psychoanalytic Criticism"],
                    theme: ["Ideology", "Subjectivity", "Popular Culture", "Politics", "Capitalism"]
                },
                papers: [
                    {
                        title: "The Sublime Object of Ideology",
                        year: "1989",
                        journal: "Verso",
                        url: "#"
                    },
                    {
                        title: "Living in the End Times",
                        year: "2010",
                        journal: "Verso",
                        url: "#"
                    },
                    {
                        title: "Less Than Nothing: Hegel and the Shadow of Dialectical Materialism",
                        year: "2012",
                        journal: "Verso",
                        url: "#"
                    }
                ],
                events: [
                    {
                        title: "Debate with Jordan Peterson",
                        date: "April 19, 2019",
                        location: "Sony Centre, Toronto, Canada",
                        description: "Debate on 'Happiness: Capitalism vs. Marxism' moderated by Stephen Blackwood."
                    },
                    {
                        title: "Occupy Wall Street Address",
                        date: "October 9, 2011",
                        location: "Zuccotti Park, New York City",
                        description: "Gave a speech to Occupy Wall Street protesters on global capitalism and resistance."
                    }
                ],
                connections: [
                    {
                        name: "Jacques Lacan",
                        type: "influence",
                        description: "Žižek's work heavily draws on and interprets Lacanian psychoanalysis."
                    },
                    {
                        name: "Alain Badiou",
                        type: "collaboration",
                        description: "Collaborated on discussions of contemporary philosophy and politics."
                    },
                    {
                        name: "Judith Butler",
                        type: "critique",
                        description: "Engaged in critical dialogue around theories of the subject and political transformation."
                    }
                ]
            }
        };
        
        // Default novelty tiles
        this.noveltyTiles = [
            {
                title: "Post-structuralism and Political Theory",
                date: "2025-03-15",
                academics: ["Michel Foucault", "Jacques Derrida", "Gilles Deleuze"],
                description: "Exploration of connections between post-structuralist thought and political theory, with emphasis on power dynamics and institutional critique."
            },
            {
                title: "Gender Theory in the 21st Century",
                date: "2025-03-10",
                academics: ["Judith Butler", "Donna Haraway", "J. Jack Halberstam"],
                description: "Analysis of contemporary gender theory and its applications in understanding identity formation and social structures."
            },
            {
                title: "Marxist Critiques of Neoliberalism",
                date: "2025-03-05",
                academics: ["Slavoj Žižek", "David Harvey", "Nancy Fraser"],
                description: "Critical examination of neoliberal capitalism through various Marxist theoretical frameworks."
            },
            {
                title: "Continental vs. Analytic Philosophy",
                date: "2025-02-28",
                academics: ["Jacques Derrida", "John Searle", "Jürgen Habermas"],
                description: "Historical and conceptual analysis of the divide between continental and analytic philosophical traditions."
            },
            {
                title: "Power and Subjectivity",
                date: "2025-02-20",
                academics: ["Michel Foucault", "Judith Butler", "Giorgio Agamben"],
                description: "Investigation of how power structures shape and determine subjectivity across different theoretical frameworks."
            },
            {
                title: "Psychoanalysis and Critical Theory",
                date: "2025-02-15",
                academics: ["Slavoj Žižek", "Jacques Lacan", "Herbert Marcuse"],
                description: "Exploration of the relationship between psychoanalytic concepts and critical social theory."
            }
        ];
    }
    
    /**
     * Load data from localStorage (for development purposes)
     */
    _loadFromLocalStorage() {
        try {
            const savedAcademics = localStorage.getItem('killphilosophy_academics');
            const savedNoveltyTiles = localStorage.getItem('killphilosophy_noveltyTiles');
            
            if (savedAcademics) {
                const parsed = JSON.parse(savedAcademics);
                // Merge with defaults to ensure we don't lose core data
                this.academics = {...this.academics, ...parsed};
            }
            
            if (savedNoveltyTiles) {
                this.noveltyTiles = JSON.parse(savedNoveltyTiles);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    /**
     * Save data to localStorage (for development)
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('killphilosophy_academics', JSON.stringify(this.academics));
            localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(this.noveltyTiles));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    /**
     * Normalize academic name for use as an ID
     * @param {string} name - Academic name
     * @returns {string} - Normalized name for ID use
     */
    normalizeAcademicName(name) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    
    /**
     * Get an academic by name
     * @param {string} name - Academic name
     * @returns {Object|null} - Academic data or null if not found
     */
    getAcademic(name) {
        const normalizedName = this.normalizeAcademicName(name);
        return this.academics[normalizedName] || null;
    }
    
    /**
     * Add a new academic to the database
     * @param {Object} academicData - Academic data object
     * @returns {boolean} - Success indicator
     */
    addAcademic(academicData) {
        if (!academicData.name) return false;
        
        const normalizedName = this.normalizeAcademicName(academicData.name);
        
        // Initialize with default structure if some parts are missing
        if (!academicData.papers) academicData.papers = [];
        if (!academicData.events) academicData.events = [];
        if (!academicData.connections) academicData.connections = [];
        if (!academicData.taxonomies) academicData.taxonomies = {};
        
        this.academics[normalizedName] = academicData;
        this.saveToLocalStorage();
        return true;
    }
    
    /**
     * Update an existing academic
     * @param {string} name - Academic name
     * @param {Object} updatedData - Updated data object
     * @returns {boolean} - Success indicator
     */
    updateAcademic(name, updatedData) {
        const normalizedName = this.normalizeAcademicName(name);
        if (!this.academics[normalizedName]) return false;
        
        // Merge the updated data with existing data
        this.academics[normalizedName] = {
            ...this.academics[normalizedName],
            ...updatedData
        };
        
        this.saveToLocalStorage();
        return true;
    }
    
    /**
     * Add new information to an academic
     * @param {string} name - Academic name
     * @param {string} infoType - Type of info (paper, event, connection, taxonomy)
     * @param {Object} info - Information to add
     * @param {Object} options - Additional options
     * @returns {boolean} - Success indicator
     */
    addAcademicInfo(name, infoType, info, options = {}) {
        const normalizedName = this.normalizeAcademicName(name);
        const academic = this.academics[normalizedName];
        
        if (!academic) return false;
        
        const { submitToGitHub = false, username = 'anonymous' } = options;
        
        // Add to the appropriate array or object
        switch (infoType) {
            case 'paper':
                academic.papers.push(info);
                break;
            case 'event':
                academic.events.push(info);
                break;
            case 'connection':
                academic.connections.push(info);
                // If this is a new connection, consider adding a reciprocal connection
                this._addReciprocalConnection(name, info);
                break;
            case 'taxonomy':
                const { category, value } = info;
                if (!academic.taxonomies[category]) {
                    academic.taxonomies[category] = [];
                }
                
                if (!academic.taxonomies[category].includes(value)) {
                    academic.taxonomies[category].push(value);
                }
                break;
            default:
                return false;
        }
        
        // If GitHub submission is requested, add to pending submissions
        if (submitToGitHub) {
            this.pendingSubmissions.push({
                type: infoType,
                academic: name,
                data: info,
                date: new Date().toISOString(),
                submittedBy: username
            });
        }
        
        this.saveToLocalStorage();
        return true;
    }
    
    /**
     * Add reciprocal connection to another academic
     * @param {string} sourceName - Source academic name
     * @param {Object} connectionInfo - Connection information
     * @private
     */
    _addReciprocalConnection(sourceName, connectionInfo) {
        const targetNormalizedName = this.normalizeAcademicName(connectionInfo.name);
        const targetAcademic = this.academics[targetNormalizedName];
        
        // If the target academic exists in our database
        if (targetAcademic) {
            // Check if connection already exists
            const existingConnection = targetAcademic.connections.find(
                conn => this.normalizeAcademicName(conn.name) === this.normalizeAcademicName(sourceName)
            );
            
            if (!existingConnection) {
                // Create reciprocal connection (reverse the relationship)
                let reciprocalType = connectionInfo.type;
                
                // Adjust the type for reciprocal connection
                if (connectionInfo.type === 'influence') {
                    reciprocalType = 'influenced by';
                } else if (connectionInfo.type === 'student') {
                    reciprocalType = 'teacher';
                } else if (connectionInfo.type === 'teacher') {
                    reciprocalType = 'student';
                }
                
                // Add the reciprocal connection
                targetAcademic.connections.push({
                    name: sourceName,
                    type: reciprocalType,
                    description: `Reciprocal connection established from ${sourceName}'s profile.`
                });
            }
        }
    }
    
    /**
     * Get all academics as an array
     * @returns {Array} - Array of academic objects
     */
    getAllAcademics() {
        return Object.values(this.academics);
    }
    
    /**
     * Get all novelty tiles
     * @returns {Array} - Array of novelty tile objects
     */
    getNoveltyTiles() {
        return this.noveltyTiles;
    }
    
    /**
     * Add a new novelty tile
     * @param {Object} tileData - Novelty tile data
     * @returns {boolean} - Success indicator
     */
    addNoveltyTile(tileData) {
        if (!tileData.title || !tileData.academics || !tileData.academics.length) {
            return false;
        }
        
        // Add current date if not provided
        if (!tileData.date) {
            const now = new Date();
            tileData.date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        }
        
        this.noveltyTiles.unshift(tileData); // Add to the beginning
        
        // Keep only the most recent 20 tiles
        if (this.noveltyTiles.length > 20) {
            this.noveltyTiles = this.noveltyTiles.slice(0, 20);
        }
        
        this.saveToLocalStorage();
        return true;
    }
    
    /**
     * Get all taxonomy categories and values
     * @returns {Object} - Taxonomy categories and values
     */
    getTaxonomies() {
        return this.taxonomyCategories;
    }
    
    /**
     * Add a new taxonomy value to a category
     * @param {string} category - Category name
     * @param {string} value - Taxonomy value
     * @returns {boolean} - Success indicator
     */
    addTaxonomyValue(category, value) {
        if (!category || !value) return false;
        
        // Create category if it doesn't exist
        if (!this.taxonomyCategories[category]) {
            this.taxonomyCategories[category] = [];
        }
        
        // Add value if it doesn't already exist
        if (!this.taxonomyCategories[category].includes(value)) {
            this.taxonomyCategories[category].push(value);
            this.saveToLocalStorage();
            return true;
        }
        
        return false;
    }
    
    /**
     * Search for academics by name or criteria
     * @param {string} query - Search query
     * @returns {Array} - Array of matching academics
     */
    searchAcademics(query) {
        if (!query) return [];
        
        const normalizedQuery = query.toLowerCase();
        const results = [];
        
        // Search through all academics
        for (const academicId in this.academics) {
            const academic = this.academics[academicId];
            
            // Check name match
            if (academic.name.toLowerCase().includes(normalizedQuery)) {
                results.push(academic);
                continue;
            }
            
            // Check bio match
            if (academic.bio && academic.bio.toLowerCase().includes(normalizedQuery)) {
                results.push(academic);
                continue;
            }
            
            // Check taxonomy matches
            let taxonomyMatch = false;
            if (academic.taxonomies) {
                for (const category in academic.taxonomies) {
                    for (const value of academic.taxonomies[category]) {
                        if (value.toLowerCase().includes(normalizedQuery)) {
                            results.push(academic);
                            taxonomyMatch = true;
                            break;
                        }
                    }
                    if (taxonomyMatch) break;
                }
                if (taxonomyMatch) continue;
            }
            
            // Check paper titles
            let paperMatch = false;
            for (const paper of academic.papers || []) {
                if (paper.title.toLowerCase().includes(normalizedQuery)) {
                    results.push(academic);
                    paperMatch = true;
                    break;
                }
            }
            if (paperMatch) continue;
        }
        
        return results;
    }
    
    /**
     * Generate mock data for an academic (for demo purposes)
     * @param {string} name - Academic name
     * @param {string} relatedName - Related academic name
     * @returns {Object} - Generated academic data
     */
    generateMockAcademic(name, relatedName = null) {
        // Generate random dates (1900-1980 birth year)
        const birthYear = Math.floor(Math.random() * 80) + 1900;
        const isDeceased = Math.random() > 0.6;
        const deathYear = isDeceased ? Math.min(birthYear + Math.floor(Math.random() * 60) + 20, 2024) : null;
        const dates = isDeceased ? `${birthYear}-${deathYear}` : `${birthYear}-present`;
        
        // Pick random taxonomies
        const randomDisciplines = this._getRandomElements(this.taxonomyCategories.discipline, 2);
        const randomTraditions = this._getRandomElements(this.taxonomyCategories.tradition, 2);
        const randomMethodologies = this._getRandomElements(this.taxonomyCategories.methodology, 1);
        const randomThemes = this._getRandomElements(this.taxonomyCategories.theme, 3);
        
        // Generate paper titles
        const paperTitles = this._generatePaperTitles(name, randomDisciplines, randomThemes);
        const papers = paperTitles.map((title, index) => {
            const year = Math.min(birthYear + 25 + (index * 5), 2024);
            return {
                title: title,
                year: year.toString(),
                journal: this._getRandomPublisher(),
                url: "#"
            };
        });
        
        // Generate connections including the related name if provided
        let connections = [];
        if (relatedName) {
            connections.push({
                name: relatedName,
                type: this._getRandomElement(["collaboration", "influence", "critique"]),
                description: `Connection identified through deep search analysis.`
            });
        }
        
        // Add 2-3 more random connections
        const existingAcademics = this.getAllAcademics();
        const randomConnections = this._getRandomElements(
            existingAcademics.map(a => a.name), 
            Math.floor(Math.random() * 2) + 2
        );
        
        randomConnections.forEach(connName => {
            if (connName !== name && connName !== relatedName) {
                connections.push({
                    name: connName,
                    type: this._getRandomElement(["collaboration", "influence", "critique", "student"]),
                    description: this._generateConnectionDescription(name, connName)
                });
            }
        });
        
        // Create the academic object
        const academic = {
            name: name,
            dates: dates,
            bio: this._generateAcademicBio(name, randomDisciplines, randomTraditions, randomThemes),
            taxonomies: {
                discipline: randomDisciplines,
                tradition: randomTraditions,
                methodology: randomMethodologies,
                theme: randomThemes
            },
            papers: papers,
            events: [{
                title: `Lecture series on ${this._getRandomElement(randomThemes)}`,
                date: `${birthYear + 40}`,
                location: this._getRandomLocation(),
                description: `Series of lectures exploring ${name}'s theoretical approaches to ${this._getRandomElement(randomThemes)}.`
            }],
            connections: connections
        };
        
        // Add to database
        this.addAcademic(academic);
        
        // Create reciprocal connections
        connections.forEach(conn => {
            this._addReciprocalConnection(name, conn);
        });
        
        return academic;
    }
    
    /**
     * Helper function to get a random element from an array
     * @param {Array} array - Array of elements
     * @returns {*} - Random element
     * @private
     */
    _getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Helper function to get multiple random elements from an array
     * @param {Array} array - Array of elements
     * @param {number} count - Number of elements to get
     * @returns {Array} - Array of random elements
     * @private
     */
    _getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }
    
    /**
     * Generate a random publisher name
     * @returns {string} - Publisher name
     * @private
     */
    _getRandomPublisher() {
        const publishers = [
            "Oxford University Press", "Cambridge University Press", "Routledge",
            "Harvard University Press", "Yale University Press", "MIT Press",
            "Princeton University Press", "Columbia University Press", "Verso",
            "Duke University Press", "University of Chicago Press"
        ];
        return this._getRandomElement(publishers);
    }
    
    /**
     * Generate a random location
     * @returns {string} - Location
     * @private
     */
    _getRandomLocation() {
        const locations = [
            "Paris, France", "Berlin, Germany", "New York, USA", "London, UK",
            "Vienna, Austria", "Amsterdam, Netherlands", "Berkeley, USA",
            "Chicago, USA", "Frankfurt, Germany", "Copenhagen, Denmark"
        ];
        return this._getRandomElement(locations);
    }
    
    /**
     * Generate a bio for an academic
     * @param {string} name - Academic name
     * @param {Array} disciplines - Disciplines
     * @param {Array} traditions - Traditions
     * @param {Array} themes - Themes
     * @returns {string} - Generated bio
     * @private
     */
    _generateAcademicBio(name, disciplines, traditions, themes) {
        const nationality = this._getRandomElement([
            "French", "German", "American", "British", "Italian", "Canadian", 
            "Dutch", "Swiss", "Austrian", "Belgian", "Danish", "Swedish"
        ]);
        
        const discipline = this._getRandomElement(disciplines);
        const tradition = this._getRandomElement(traditions);
        const theme = this._getRandomElement(themes);
        
        return `${nationality} scholar known for contributions to ${discipline} within the context of ${tradition}. Their work explores ${theme} through various theoretical frameworks and has influenced a wide range of academic discussions.`;
    }
    
    /**
     * Generate paper titles
     * @param {string} name - Academic name
     * @param {Array} disciplines - Disciplines
     * @param {Array} themes - Themes
     * @returns {Array} - Array of paper titles
     * @private
     */
    _generatePaperTitles(name, disciplines, themes) {
        const titles = [
            `The ${this._getRandomElement(themes)} of ${this._getRandomElement(themes)}: Towards a New Theory of ${this._getRandomElement(disciplines)}`,
            `${this._getRandomElement(themes)} and Its Discontents: Rethinking ${this._getRandomElement(disciplines)}`,
            `Beyond ${this._getRandomElement(themes)}: ${this._getRandomElement(themes)} in Contemporary Society`
        ];
        return titles;
    }
    
    /**
     * Generate a connection description
     * @param {string} name1 - First academic name
     * @param {string} name2 - Second academic name
     * @returns {string} - Generated description
     * @private
     */
    _generateConnectionDescription(name1, name2) {
        const descriptions = [
            `Intellectual exchange documented in academic literature and correspondence.`,
            `Shared theoretical frameworks and methodological approaches.`,
            `Mutual influence in developing key concepts within their respective fields.`,
            `Critical engagement with each other's works, particularly regarding theoretical positions on social structures.`
        ];
        return this._getRandomElement(descriptions);
    }
    
    /**
     * Get pending submissions
     * @returns {Array} - Array of pending submissions
     */
    getPendingSubmissions() {
        return this.pendingSubmissions;
    }
    
    /**
     * Clear pending submissions
     */
    clearPendingSubmissions() {
        this.pendingSubmissions = [];
        this.saveToLocalStorage();
    }
    
    /**
     * Export database as JSON
     * @returns {string} - JSON string of the database
     */
    exportDatabase() {
        return JSON.stringify({
            academics: this.academics,
            noveltyTiles: this.noveltyTiles,
            taxonomyCategories: this.taxonomyCategories
        }, null, 2);
    }
    
    /**
     * Import database from JSON
     * @param {string} jsonData - JSON string of the database
     * @returns {boolean} - Success indicator
     */
    importDatabase(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.academics) {
                this.academics = data.academics;
            }
            
            if (data.noveltyTiles) {
                this.noveltyTiles = data.noveltyTiles;
            }
            
            if (data.taxonomyCategories) {
                this.taxonomyCategories = data.taxonomyCategories;
            }
            
            this.saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error importing database:', error);
            return false;
        }
    }
}

// Initialize the database manager
const databaseManager = new DatabaseManager();

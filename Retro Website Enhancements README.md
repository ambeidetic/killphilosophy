# KillPhilosophy.com

[![GitHub stars](https://img.shields.io/github/stars/username/killphilosophy.com?style=social)](https://github.com/username/killphilosophy.com/stargazers)
[![GitHub license](https://img.shields.io/github/license/username/killphilosophy.com)](https://github.com/username/killphilosophy.com/blob/main/LICENSE)

## About The Project

KillPhilosophy is an open-source database mapping the interconnections between academics across disciplines. Our aim is to create a comprehensive resource that reveals the networks of influence, collaboration, and critique that shape intellectual history.

The project takes its provocative name from the notion that philosophy—and academia broadly—thrives not in isolation but in connection. We "kill" the myth of the solitary thinker by exposing the rich tapestry of relationships that generate and transform ideas.

### What Makes This Special

This repository is both the website AND the database. It's a self-documenting, self-growing, practopoietic system where:

1. The website visualizes the connections between academics
2. User contributions are submitted as pull requests
3. The GitHub repository itself stores all the data
4. The entire system evolves through community participation

## Live Demo

Visit [killphilosophy.com](https://username.github.io/killphilosophy.com) to explore the project.

## Features

- **Search & Deep Search**: Find academics by name, or let the system discover information about new academics
- **Technical Brochures**: View comprehensive profiles of academics with their works, events, and connections
- **Novelty Tiles**: Discover interesting connections and emerging academic themes
- **GitHub Integration**: Contribute directly to the database through GitHub pull requests
- **Self-Evolving Database**: The system grows and becomes more intelligent with each contribution

## Built With

- Vanilla JavaScript (no framework dependencies)
- GitHub Pages for hosting
- GitHub API for database management
- LocalStorage for development and offline usage

## Getting Started

### Prerequisites

- GitHub account (for contributions)
- Basic knowledge of JSON (for advanced contributions)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/username/killphilosophy.com.git
   ```

2. Navigate to the project directory:
   ```sh
   cd killphilosophy.com
   ```

3. Open index.html in your browser, or use a local server:
   ```sh
   python -m http.server
   ```

## Usage

### Searching for Academics

Enter an academic's name in the search box. If they're in the database, their profile will display. If not, the system will offer to run a deep search.

### Contributing Information

1. Find or create an academic profile
2. Click "Add Information"
3. Select the type of information (paper, event, connection, or taxonomy)
4. Fill in the details
5. Submit your contribution

### GitHub Integration

Your contributions can be submitted directly to the GitHub repository as pull requests:

1. Check "Contribute this information to the public database"
2. Enter your GitHub username (optional)
3. Submit the form
4. The system will create a pull request with your contribution

## Database Structure

The database is stored in the `database/` directory and consists of JSON files:

- `academics.json`: Contains all academic profiles
- Each academic has:
  - Basic information (name, dates, bio)
  - Taxonomies (disciplines, traditions, methodologies, themes)
  - Papers/publications
  - Event appearances
  - Connections to other academics

## Contributing

Contributions are what make this project special! There are several ways to contribute:

1. **Add new academics**: Submit details about academics not yet in the database
2. **Enhance existing profiles**: Add papers, events, or connections to academics already in the database
3. **Improve the website**: Submit code improvements (UI, performance, features)
4. **Report issues**: Let us know about bugs or problems
5. **Suggest features**: Have ideas for new capabilities? Share them!

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/username/killphilosophy.com](https://github.com/username/killphilosophy.com)

## Acknowledgements

- All contributors and members of the academic community
- GitHub for providing the platform and API
- The open-source community for inspiration

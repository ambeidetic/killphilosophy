# Contributing to KillPhilosophy

Thank you for considering contributing to KillPhilosophy! This project thrives on community contributions, whether they're academic data additions, code improvements, or documentation enhancements.

## How to Contribute

### Adding or Updating Academic Information

The simplest way to contribute is through the website interface:

1. Visit [killphilosophy.com](https://username.github.io/killphilosophy.com)
2. Search for the academic you want to contribute to (or create a new one)
3. Click "Add Information"
4. Choose the type of information and fill in the details
5. Check "Contribute this information to the public database"
6. Submit your contribution

This will create a pull request automatically.

### Direct Contributions to the Repository

For more advanced contributions or multiple changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-contribution`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing contribution'`)
5. Push to the branch (`git push origin feature/amazing-contribution`)
6. Open a Pull Request

### Database Modifications

When manually editing the database files:

1. Academics are stored in `database/academics.json`
2. Follow the existing structure:
   ```json
   {
     "academic-name": {
       "name": "Academic Name",
       "dates": "YYYY-YYYY",
       "bio": "Brief biography...",
       "taxonomies": {
         "discipline": ["Philosophy", "Sociology"],
         "tradition": ["Post-structuralism"],
         "methodology": ["Textual Analysis"],
         "theme": ["Power", "Knowledge"]
       },
       "papers": [...],
       "events": [...],
       "connections": [...]
     }
   }
   ```
3. Ensure your JSON is valid before submitting

## Contribution Guidelines

### Data Quality Standards

1. **Accuracy**: Information should be factually correct
2. **Completeness**: Provide as much context as possible
3. **Citations**: Include sources for controversial or lesser-known information
4. **Originality**: Don't duplicate existing entries

### Code Quality Standards

1. **Follow existing code style**
2. **Comment your code** when adding complex functionality
3. **Test your changes** before submitting
4. **Keep it simple** and focused on the specific contribution

## Types of Contributions

### Academic Data

- **Basic information**: Name, dates, biographical information
- **Papers/Publications**: Academic works with year and publisher
- **Events**: Lectures, debates, conferences, and other appearances
- **Connections**: Relationships between academics (influences, collaborations, critiques)
- **Taxonomies**: Classification of academics by discipline, tradition, methodology, or themes

### Website Improvements

- Bug fixes
- Performance enhancements
- UI/UX improvements
- New features
- Documentation updates

## Pull Request Process

1. Ensure your changes are well-documented and tested
2. Update the README.md if necessary for your changes
3. Your PR should clearly describe what it does and why
4. A maintainer will review your PR and provide feedback
5. Once approved, your PR will be merged

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, issues, and other contributions that are not aligned to this Code of Conduct.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.0, available at https://www.contributor-covenant.org/version/2/0/code_of_conduct.html.

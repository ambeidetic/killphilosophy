/**
 * Network Visualization for KillPhilosophy
 * Handles D3.js visualizations of academic networks
 */

/**
 * Initialize the academic network visualization using D3.js
 */
function initializeNetworkVisualization() {
    console.log('Initializing network visualization...');
    
    // Wait for document to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupVisualization);
    } else {
        setupVisualization();
    }
    
    function setupVisualization() {
        // Check if visualization container exists
        const container = document.getElementById('visualization-container');
        if (!container) {
            console.warn('Visualization container not found in the DOM');
            return;
        }
        
        // Check if D3 is available
        if (typeof d3 === 'undefined') {
            console.error('D3.js is required for network visualization but is not loaded');
            container.innerHTML = '<div class="error-message">D3.js is required for network visualization</div>';
            return;
        }
        
        // Check if database manager exists
        if (typeof databaseManager === 'undefined') {
            console.error('Database manager is required for visualization data');
            return;
        }
        
        // Hide the visualization container until explicitly shown
        container.style.display = 'none';
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-visualization-btn';
        closeButton.textContent = '×';
        closeButton.title = 'Close visualization';
        closeButton.addEventListener('click', () => {
            container.style.display = 'none';
        });
        container.appendChild(closeButton);
        
        // Add a visualization title
        const title = document.createElement('h3');
        title.className = 'visualization-title';
        title.textContent = 'Academic Network';
        container.appendChild(title);
        
        console.log('Network visualization initialized and ready to display');
    }
}

/**
 * Visualize the entire academic network
 */
function visualizeNetwork() {
    console.log('Visualizing academic network...');
    
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    // Show the container
    container.style.display = 'block';
    
    // Clear previous content except for close button and title
    const closeButton = container.querySelector('.close-visualization-btn');
    const title = container.querySelector('.visualization-title');
    container.innerHTML = '';
    if (closeButton) container.appendChild(closeButton);
    if (title) {
        title.textContent = 'Complete Academic Network';
        container.appendChild(title);
    }
    
    // Check if D3 is available
    if (typeof d3 === 'undefined') {
        container.innerHTML += '<div class="error-message">D3.js is required for visualization but is not loaded</div>';
        return;
    }
    
    // Get network data from database manager
    if (typeof databaseManager === 'undefined' || !databaseManager.getNetworkData) {
        container.innerHTML += '<div class="error-message">Database manager with network data support is required</div>';
        return;
    }
    
    // Get network data
    const { nodes, links } = databaseManager.getNetworkData();
    
    if (!nodes || nodes.length === 0) {
        container.innerHTML += '<div class="info-message">No academics data available for visualization</div>';
        return;
    }
    
    // Set up the visualization dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    
    // Create SVG element
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);
    
    // Create a tooltip div
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(20, 20, 20, 0.9)')
        .style('color', '#ddd')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-family', 'monospace')
        .style('font-size', '12px')
        .style('z-index', 1000);
    
    // Create a color scale for the different discipline groups
    const disciplines = [...new Set(nodes.map(d => d.group))];
    const color = d3.scaleOrdinal()
        .domain(disciplines)
        .range(d3.schemeCategory10);
    
    // Set up the force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
    
    // Create a group for all the links
    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', d => Math.sqrt(d.value));
    
    // Create a group for all the nodes
    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', d => color(d.group))
        .call(drag(simulation))
        .on('mouseover', function(event, d) {
            d3.select(this).transition()
                .duration(200)
                .attr('r', 10);
                
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            // Get the academic data
            const academic = databaseManager.getAcademic(d.id);
            let tooltipHTML = `<strong>${d.id}</strong><br/>`;
            tooltipHTML += `Discipline: ${d.group}<br/>`;
            
            if (academic) {
                if (academic.taxonomies?.tradition?.length > 0) {
                    tooltipHTML += `Tradition: ${academic.taxonomies.tradition.join(', ')}<br/>`;
                }
                if (academic.taxonomies?.era?.length > 0) {
                    tooltipHTML += `Era: ${academic.taxonomies.era.join(', ')}<br/>`;
                }
                tooltipHTML += `Connections: ${academic.connections?.length || 0}`;
            }
            
            tooltip.html(tooltipHTML)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 30) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).transition()
                .duration(500)
                .attr('r', 5);
                
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            // When clicking on a node, search for that academic
            if (typeof handleSearch === 'function') {
                handleSearch(d.id);
            }
        });
    
    // Add node labels
    const text = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .text(d => d.id)
        .attr('font-size', 10)
        .attr('dx', 8)
        .attr('dy', 3)
        .style('pointer-events', 'none')
        .style('fill', '#ddd')
        .style('font-family', 'monospace')
        .style('opacity', 0.7);
    
    // Set up the simulation tick function
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
            
        text
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    // Add zoom capability
    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 5])
        .on('zoom', zoomed));
        
    function zoomed(event) {
        link.attr('transform', event.transform);
        node.attr('transform', event.transform);
        text.attr('transform', event.transform);
    }
    
    // Drag functionality for nodes
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    // Add a legend for the disciplines
    const legend = svg.append('g')
        .attr('font-family', 'monospace')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .selectAll('g')
        .data(disciplines)
        .join('g')
        .attr('transform', (d, i) => `translate(10,${i * 20 + 10})`);
        
    legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => color(d));
        
    legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.32em')
        .text(d => d)
        .style('fill', '#ddd');
}

/**
 * Visualize an academic's connections
 * @param {Object} academic - Academic object
 */
function visualizeAcademic(academic) {
    if (!academic || !academic.name) {
        console.error('Invalid academic data for visualization');
        return;
    }
    
    console.log(`Visualizing connections for ${academic.name}...`);
    
    // Ensure there's a visualization container
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    // Show the container
    container.style.display = 'block';
    
    // Clear the container
    container.innerHTML = '';
    
    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-visualization-btn';
    closeButton.textContent = '×';
    closeButton.title = 'Close visualization';
    closeButton.addEventListener('click', () => {
        container.style.display = 'none';
    });
    container.appendChild(closeButton);
    
    // Add a visualization title
    const title = document.createElement('h3');
    title.className = 'visualization-title';
    title.textContent = `Network: ${academic.name}`;
    container.appendChild(title);
    
    // Check if D3 is available
    if (typeof d3 === 'undefined') {
        container.innerHTML += '<div class="error-message">D3.js is required for visualization but is not loaded</div>';
        return;
    }
    
    // Create SVG container for the visualization
    const width = container.clientWidth;
    const height = 500;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);
    
    // Collect all nodes and links
    const nodes = [];
    const links = [];
    
    // Add the main academic as the central node
    nodes.push({
        id: academic.name,
        group: 'main'
    });
    
    // Add direct connections
    if (academic.connections) {
        academic.connections.forEach(connection => {
            nodes.push({
                id: connection,
                group: 'connection'
            });
            
            links.push({
                source: academic.name,
                target: connection,
                value: 1
            });
        });
    }
    
    // Add secondary connections if they're in the database
    if (typeof databaseManager !== 'undefined' && databaseManager.getAcademicsByConnection) {
        // Find academics that list this academic as a connection
        const connectedAcademics = databaseManager.getAcademicsByConnection(academic.name);
        
        connectedAcademics.forEach(connectedAcademic => {
            if (!academic.connections || !academic.connections.includes(connectedAcademic.name)) {
                nodes.push({
                    id: connectedAcademic.name,
                    group: 'reverse-connection'
                });
                
                links.push({
                    source: connectedAcademic.name,
                    target: academic.name,
                    value: 1
                });
            }
        });
    }
    
    // Create a tooltip div
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(20, 20, 20, 0.9)')
        .style('color', '#ddd')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-family', 'monospace')
        .style('font-size', '12px')
        .style('z-index', 1000);
    
    // Set up force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
    
    // Create links
    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', d => Math.sqrt(d.value));
    
    // Create nodes with different colors for main, connections, and reverse connections
    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', d => d.group === 'main' ? 10 : 5)
        .attr('fill', d => {
            if (d.group === 'main') return '#ff0';
            if (d.group === 'connection') return '#0f0';
            return '#09f';
        })
        .call(drag(simulation))
        .on('mouseover', function(event, d) {
            d3.select(this).transition()
                .duration(200)
                .attr('r', d.group === 'main' ? 12 : 8);
                
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            let tooltipHTML = `<strong>${d.id}</strong><br/>`;
            
            if (d.group === 'main') {
                tooltipHTML += 'Selected academic';
            } else if (d.group === 'connection') {
                tooltipHTML += 'Direct connection';
            } else {
                tooltipHTML += 'References selected academic';
            }
            
            tooltip.html(tooltipHTML)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 30) + 'px');
        })
        .on('mouseout', function(event, d) {
            d3.select(this).transition()
                .duration(500)
                .attr('r', d.group === 'main' ? 10 : 5);
                
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add node labels
    const text = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .text(d => d.id)
        .attr('font-size', d => d.group === 'main' ? 12 : 10)
        .attr('dx', 8)
        .attr('dy', 3)
        .style('pointer-events', 'none')
        .style('fill', '#ddd')
        .style('font-family', 'monospace')
        .style('font-weight', d => d.group === 'main' ? 'bold' : 'normal')
        .style('opacity', d => d.group === 'main' ? 1 : 0.7);
    
    // Add click event to nodes to navigate to that academic
    node.on('click', function(event, d) {
        if (d.group !== 'main') {
            const connectedAcademic = databaseManager.getAcademic(d.id);
            if (connectedAcademic) {
                displayAcademic(connectedAcademic);
            } else {
                // Try to search for the academic
                if (typeof handleSearch === 'function') {
                    handleSearch(d.id);
                }
            }
        }
    });
    
    // Set up simulation tick function
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
            
        text
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    // Add zoom capability
    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 5])
        .on('zoom', zoomed));
        
    function zoomed(event) {
        link.attr('transform', event.transform);
        node.attr('transform', event.transform);
        text.attr('transform', event.transform);
    }
    
    // Drag function for nodes
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    // Add legend
    const legend = svg.append('g')
        .attr('font-family', 'monospace')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .selectAll('g')
        .data([
            { label: 'Selected Academic', color: '#ff0' },
            { label: 'Direct Connection', color: '#0f0' },
            { label: 'References Selected', color: '#09f' }
        ])
        .join('g')
        .attr('transform', (d, i) => `translate(10,${i * 20 + 10})`);
        
    legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => d.color);
        
    legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.32em')
        .text(d => d.label)
        .style('fill', '#ddd');
}

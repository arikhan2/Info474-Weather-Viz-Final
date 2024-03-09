// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = { t: 20, r: 20, b: 60, l: 60 };

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function (d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate(' + [tx, ty] + ')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
var priceDomain = [0, 223.02];

// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function (dataset) {

    // **** Your JavaScript code goes here ****

    // Parse dates in the dataset
    dataset.forEach(function (d) {
        d.date = parseDate(d.date); 
    });


    var nestedData = d3.nest()
        .key(function (d) { return d.company; }) 
        .entries(dataset);

    console.log(nestedData);



    // Append trellis groupings
    var trellisGroups = svg.selectAll('.trellis')
        .data(nestedData) 
        .enter()
        .append('g') 
        .attr('class', 'trellis')
        .attr('transform', function (d, i) {
            
            var colIndex = i % 2; 
            var rowIndex = Math.floor(i / 2); 

            var tx = colIndex * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = rowIndex * (trellisHeight + padding.t + padding.b) + padding.t;

            return 'translate(' + tx + ',' + ty + ')';
        });



    // Position trellis groups in front of the rectangle backgrounds
    trellisGroups.attr('transform', function (d, i) {
        
        var colIndex = i % 2; 
        var rowIndex = Math.floor(i / 2); 

        var tx = colIndex * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = rowIndex * (trellisHeight + padding.t + padding.b) + padding.t;

        return 'translate(' + tx + ',' + ty + ')';
    });


    // Create scales for our line charts
    var xScale = d3.scaleTime()
        .domain(dateDomain) 
        .range([0, trellisWidth]); 

    var yScale = d3.scaleLinear()
        .domain(priceDomain) 
        .range([trellisHeight, 0]); 

    // Define a line interpolator for the line chart
    var line = d3.line()
        .x(function (d) { return xScale(d.date); }) 
        .y(function (d) { return yScale(d.price); }); 


    // Create the x grid
    var xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0) 
        .tickFormat(''); 

    // Create the y grid
    var yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0) 
        .tickFormat(''); 

    // Append the x grid to the trellisGroups
    trellisGroups.append('g')
        .attr('class', 'x grid') 
        .call(xGrid); 

    // Append the y grid to the trellisGroups
    trellisGroups.append('g')
        .attr('class', 'y grid') 
        .call(yGrid); 

    // Create the line chart
    trellisGroups.append('path')
        .attr('class', 'line-plot') 
        .attr('d', function (d) { 
            return line(d.values);
        })
        .style('stroke', '#333'); 



    // Create axes for each subplot
    trellisGroups.append('g')
        .attr('class', 'x axis') 
        .attr('transform', 'translate(0,' + trellisHeight + ')') 
        .call(d3.axisBottom(xScale)); 

    trellisGroups.append('g')
        .attr('class', 'y axis') 
        .call(d3.axisLeft(yScale)); 


    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(nestedData.map(function (d) { return d.key; }));

    trellisGroups.selectAll('.line-plot')
        .style('stroke', function (d) {
            return colorScale(d.key); 
        });

    // Append company labels
    trellisGroups.append('text')
        .attr('class', 'company-label')
        .attr('x', trellisWidth / 2) 
        .attr('y', trellisHeight / 2) 
        .style('fill', function (d) { return colorScale(d.key); }) 
        .style('font-family', 'Open Sans, sans-serif')
        .text(function (d) { return d.key }); 


    // Label the y-axis
    trellisGroups.append('text')
        .attr('class', 'y axis-label') 
        .attr('transform', 'rotate(-90)') 
        .attr('x', -trellisHeight / 2) 
        .attr('y', -padding.l + 25) 
        .attr('text-anchor', 'middle') 
        .style('font-family', 'Open Sans, sans-serif')
        .text('Stock Price (USD)'); 

    // Label the x-axis
    trellisGroups.append('text')
        .attr('class', 'x axis-label') 
        .attr('x', trellisWidth / 2) 
        .attr('y', trellisHeight + padding.b - 25) 
        .attr('text-anchor', 'middle') 
        .style('font-family', 'Open Sans, sans-serif')
        .text('Date (by Month)'); 

});


// Remember code outside of the data callback function will run before the data loads
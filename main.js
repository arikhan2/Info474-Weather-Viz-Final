// Load the data from CSV files
Promise.all([
    d3.csv("CLT.csv"),
    d3.csv("CQT.csv"),
    d3.csv("IND.csv"),
    d3.csv("JAX.csv"),
    d3.csv("MDW.csv"),
    d3.csv("PHL.csv"),
    d3.csv("PHX.csv")
]).then(function (data) {
    var cltData = data[0];
    var cqtData = data[1];
    var indData = data[2];
    var jaxData = data[3];
    var mdwData = data[4];
    var phlData = data[5];
    var phxData = data[6];
    // Set initial cities
    var city1 = "CQT";
    var city2 = "MDW";
    // Set initial chart dimensions
    var margin = { top: 120, right: 150, bottom: 200, left: 150 };
    var width = 1000 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;
    // Append SVG
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Create scales
    var yTemperatureScale = d3.scaleLinear().range([height, 0]).domain([0, 100]);
    var yPrecipitationScale = d3.scaleLinear().range([height, 0]).domain([0, 4]);

    // Define colors for each city
    var cityColors = {
        "CLT": "blue",
        "CQT": "green",
        "IND": "red",
        "JAX": "purple",
        "MDW": "orange",
        "PHL": "brown",
        "PHX": "teal"
    };
    // Preprocess data to group by month
    function preprocessDataByMonth(data) {
        var dataByMonth = {};
        data.forEach(function (d) {
            var date = new Date(d.date);
            var month = date.getMonth();
            var key = month.toString(); // Use month as the key
            if (!dataByMonth[key]) {
                dataByMonth[key] = [];
            }
            dataByMonth[key].push(d);
        });
        return dataByMonth;
    }
    // Draw the chart
    function drawChart(city1, city2) {
        var selectedData1, selectedData2;
        if (city1 === "CLT") {
            selectedData1 = cltData;
        } else if (city1 === "CQT") {
            selectedData1 = cqtData;
        } else if (city1 === "IND") {
            selectedData1 = indData;
        } else if (city1 === "JAX") {
            selectedData1 = jaxData;
        } else if (city1 === "MDW") {
            selectedData1 = mdwData;
        } else if (city1 === "PHL") {
            selectedData1 = phlData;
        } else {
            selectedData1 = phxData;
        }
        if (city2 === "CLT") {
            selectedData2 = cltData;
        } else if (city2 === "CQT") {
            selectedData2 = cqtData;
        } else if (city2 === "IND") {
            selectedData2 = indData;
        } else if (city2 === "JAX") {
            selectedData2 = jaxData;
        } else if (city2 === "MDW") {
            selectedData2 = mdwData;
        } else if (city2 === "PHL") {
            selectedData2 = phlData;
        } else {
            selectedData2 = phxData;
        }
        // Preprocess data by month
        var selectedDataByMonth1 = preprocessDataByMonth(selectedData1);
        var selectedDataByMonth2 = preprocessDataByMonth(selectedData2);
        // Merge all data into a single array
        var allData = [];
        for (var key in selectedDataByMonth1) {
            allData = allData.concat(selectedDataByMonth1[key]);
        }
        for (var key in selectedDataByMonth2) {
            allData = allData.concat(selectedDataByMonth2[key]);
        }



        // Extracting all unique months from the data
        var allMonths = Array.from(new Set(allData.map(d => d.date.split("-")[2])));

        // Sort the months to ensure they are in order
        allMonths.sort();
        // // Define x-axis scale
        var xScale = d3.scaleBand()
            // .domain(allData.map(function (d) { return d.date; }))
            // .domain(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]) // Months
            .domain(allMonths)
            .range([0, width])
            .padding(0.1); // Adjust padding as needed


        // Get unique dates from both selected data sets
        var allDates = [...new Set(selectedData1.map(d => d.date).concat(selectedData2.map(d => d.date)))];

        // Update x-axis scale domain based on available dates
        xScale.domain(allDates);

        // Remove existing elements
        svg.selectAll("*").remove();
        // Draw X axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)
                .tickFormat(function (d) {
                    // Extract month
                    var dateParts = d.split("-");
                    var month = dateParts[1];
                    // Define an array of month names
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return monthNames[parseInt(month) - 1]; // Display only the month abbreviation
                })
                .tickValues(allData.filter(function (d, i) {
                    // Select the first data point of each month
                    return d.date.split("-")[2] === "1";
                }).map(function (d) {
                    return d.date; // Use date as tick values
                }))
            )
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.5em")
            .attr("dy", "0.5em")
            .attr("transform", "rotate(-45)")
            .style("font-size", "12px");
        // Define the line functions
        var tempLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yTemperatureScale(d.actual_mean_temp); });
        var precipLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yPrecipitationScale(d.actual_precipitation); })
            .curve(d3.curveLinear);
        // Draw temperature lines
        svg.append("path")
            .datum(selectedData1)
            .attr("class", "line temperature city1")
            .attr("d", tempLine)
            .style("stroke", cityColors[city1])
            .style("fill", "none");
        svg.append("path")
            .datum(selectedData2)
            .attr("class", "line temperature city2")
            .attr("d", tempLine)
            .style("stroke", cityColors[city2])
            .style("fill", "none");
        // Draw precipitation lines
        svg.append("path")
            .datum(selectedData1)
            .attr("class", "line precipitation city1")
            .attr("d", precipLine)
            .style("stroke", cityColors[city1])
            .style("fill", "none")
            .style("stroke-dasharray", ("3, 3"));
        svg.append("path")
            .datum(selectedData2)
            .attr("class", "line precipitation city2")
            .attr("d", precipLine)
            .style("stroke", cityColors[city2])
            .style("fill", "none")
            .style("stroke-dasharray", ("3, 3"));
        // Draw left Y axis
        svg.append("g")
            .attr("class", "y axis temperature")
            .call(d3.axisLeft(yTemperatureScale))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-3.5em")
            .attr("text-anchor", "end")
            .text("Temperature");
        // Draw right Y axis
        svg.append("g")
            .attr("class", "y axis precipitation")
            .attr("transform", "translate(" + width + ", 0)")
            .call(d3.axisRight(yPrecipitationScale))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "3.5em")
            .attr("text-anchor", "end")
            .text("Precipitation");

        var centerX = width / 2;

        // Draw X axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", centerX)
            .attr("y", height + margin.bottom - 70)
            .text("Month");

        // Draw left Y axis label
        svg.append("text")
            .attr("class", "y label temperature")
            .attr("text-anchor", "end")
            .attr("y", - margin.left - 1)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Temperature (F°)");
        // Draw right Y axis label
        svg.append("text")
            .attr("class", "y label precipitation")
            .attr("text-anchor", "end")
            .attr("y", width + margin.right - 70)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Precipitation (in″)");

        // Add legend
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0, -120)"); // Adjust y-coordinate

        // Add legend box
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 270)
            .attr("height", 110) // Increased height to accommodate the dotted line
            .style("fill", "rgba(255,255,255,0.8)")
            .style("stroke", "black");

        // Add legend items for Temperature and Precipitation
        legend.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Temperature");

        legend.append("line")
            .attr("x1", 10)
            .attr("y1", 30)
            .attr("x2", 80)
            .attr("y2", 30)
            .style("stroke", "black")
            .style("stroke-width", 2);

        legend.append("text")
            .attr("x", 90)
            .attr("y", 35)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Precipitation");

        legend.append("line")
            .attr("x1", 90)
            .attr("y1", 45)
            .attr("x2", 160)
            .attr("y2", 45)
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("stroke-dasharray", "3,3"); // Adding dashed line for precipitation

        // Add legend items for cities
        var cityLegend = legend.selectAll(".cityLegend")
            .data(Object.keys(cityColors))
            .enter().append("g")
            .attr("class", "cityLegend")
            .attr("transform", function (d, i) { return "translate(" + (10 + i % 3 * 80) + "," + (60 + Math.floor(i / 3) * 20) + ")"; });

        cityLegend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .style("fill", function (d) { return cityColors[d]; });

        cityLegend.append("text")
            .attr("x", 10)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) {
                // Spell out city abbreviations
                switch (d) {
                    case "CLT": return "Charlotte";
                    case "CQT": return "Los Angeles";
                    case "IND": return "Indianapolis";
                    case "JAX": return "Jacksonville";
                    case "MDW": return "Chicago";
                    case "PHL": return "Philadelphia";
                    case "PHX": return "Phoenix";
                    default: return "";
                }
            });
        legend.selectAll("text")
            .style("font-size", "10px"); // Adjust the font size as needed


    }





    // Initial chart rendering
    drawChart(city1, city2);

    // Event listener for dropdowns
    d3.selectAll("select").on("change", function () {
        var city1 = d3.select("#city1").node().value;
        var city2 = d3.select("#city2").node().value;
        drawChart(city1, city2);
    });
}).catch(function (error) {
    console.log(error);
});
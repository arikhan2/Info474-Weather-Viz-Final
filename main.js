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
    var margin = { top: 20, right: 150, bottom: 200, left: 100 };
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
    var xScale = d3.scaleBand().range([0, width]).padding(0.1);
    var yTemperatureScale = d3.scaleLinear().range([height, 0]).domain([0, 100]);
    var yPrecipitationScale = d3.scaleLinear().range([height, 0]).domain([0, 4]);

    // Define the line functions
    var tempLine = d3.line()
        .x(function (d) { return xScale(d.date); })
        .y(function (d) { return yTemperatureScale(d.actual_mean_temp); });

    var precipLine = d3.line()
        .x(function (d) { return xScale(d.date); })
        .y(function (d) { return yPrecipitationScale(d.actual_precipitation); })
        .curve(d3.curveLinear);

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
            var year = date.getFullYear();
            var key = year + "-" + (month + 1); // Adjust month index to start from 1

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


        // Update xScale domain
        xScale.domain(allData.map(function (d) { return d.date; }));

        // Remove existing elements
        svg.selectAll("*").remove();


        // Draw X axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)
                .tickFormat(function (d) {
                    // Extract month and year
                    var dateParts = d.split("-");
                    var month = dateParts[1];
                    var year = dateParts[0];

                    // Define an array of month names
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    // Create a set to store unique months (seenMonths)
                    var seenMonths = new Set();

                    // Check if the month hasn't been seen before (prevents duplicates)
                    if (!seenMonths.has(month)) {
                        seenMonths.add(month);
                        return monthNames[parseInt(month) - 1] + " '" + year.slice(2); // Display "MMM 'YY" format
                    } else {
                        // Return an empty string for duplicate months
                        return "";
                    }
                })
                .ticks(12) // Ensure 12 ticks (one for each month)
            )
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.5em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)")
            .style("font-size", "12px");




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


        // Draw X axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.bottom - 70)
            .text("Date");

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
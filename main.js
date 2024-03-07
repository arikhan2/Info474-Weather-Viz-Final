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
    var city1 = "CLT";
    var city2 = "CQT";

    // Set initial chart dimensions
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = 700 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Append SVG
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales
    var xScale = d3.scaleBand().range([0, width]).padding(0.1);
    var yTemperatureScale = d3.scaleLinear().range([height, 0]);
    var yPrecipitationScale = d3.scaleLinear().range([height, 0]);

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

        // Update yScale domains
        yTemperatureScale.domain([0, d3.max(allData, function (d) { return d.actual_mean_temp; })]);
        yPrecipitationScale.domain([0, d3.max(allData, function (d) { return d.actual_precipitation; })]);

        // Remove existing elements
        svg.selectAll("*").remove();

        // Draw temperature line
        svg.append("path")
            .datum(allData)
            .attr("class", "line temperature city1")
            .attr("d", tempLine)
            .style("stroke", cityColors[city1])
            .style("fill", "none");

        // Draw precipitation line
        svg.append("path")
            .datum(allData)
            .attr("class", "line precipitation city2")
            .attr("d", precipLine)
            .style("stroke", cityColors[city2]) // Assign color based on city
            .style("fill", "none") // Ensure no fill is applied
            .style("stroke-dasharray", ("3, 3")); // Set line style to dotted

        // Draw X axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)
                .tickFormat(function (d) {
                    var yearMonth = d.split("-");
                    return yearMonth[1] + "/" + yearMonth[0]; // Display as MM/YYYY
                })
            );

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
            .attr("y", height + margin.bottom - 10)
            .text("Date");

        // Draw left Y axis label
        svg.append("text")
            .attr("class", "y label temperature")
            .attr("text-anchor", "end")
            .attr("y", -margin.left + 20)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Temperature");

        // Draw right Y axis label
        svg.append("text")
            .attr("class", "y label precipitation")
            .attr("text-anchor", "end")
            .attr("y", width + margin.right - 20)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Precipitation");
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

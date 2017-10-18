/**
 * Displays new time line diagram
 * @param units - current units to be dispayed
 */

function timeLine(units) {
    var numberOfBars = allUnits[units].value;
    var margin = {top: 20, right: 30, bottom: 30, left: 80},
            width = 900 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

    var data = [];
    var selectedValues = [];
    for (var j = 0; j <= numberOfBars; j++) {
        data[j] = {"time": j * valueOfOneBar, "value": Math.random()};
    }

    var numberOfSelected = 0;

    var x = d3.scale.ordinal()
        .rangeBands([0, width], 0.1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function (d) {
            var prefix = d3.formatPrefix(d);
            return prefix.scale(d) + prefix.symbol;
        })
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat(function (d) {
            var prefix = d3.formatPrefix(d);
            return prefix.scale(d) + prefix.symbol;
        })
        .orient("left");

    var chart = d3.select("#timeLineDiv").append("svg")
        .attr("id", "timeLine")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function (d) {
        return d.time;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var bars = chart.selectAll(".bar")
        .data(data)
        .enter().append("g");

    bars.append("rect")
        .attr("class", "bar")
        .attr("selected", false)
        .attr("fill", "steelblue")
        .attr("time", function(d) { return d.time; })       // workaround
        .attr("x", function (d) {
            return x(d.time / 1);
        })
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("width", x.rangeBand())
        .on("mouseover", function () {
            var thisBar = d3.select(this);
            thisBar[0][0].nextSibling.setAttribute("style", "opacity: 1");
            if (thisBar.attr("selected") === "false") { thisBar.attr("fill", "red"); }
        })
        .on("mouseout", function () {
            var thisBar = d3.select(this);
            thisBar[0][0].nextSibling.setAttribute("style", "opacity: 0");
            if (thisBar.attr("selected") === "false") { thisBar.attr("fill", "steelblue"); }
        })
        .on("click", function () {
            var thisBar = d3.select(this);
            if (thisBar.attr("selected") === "false") {
                if (numberOfSelected === 2) {
                    displayGrowl("Unable to select more than 2 bars");
                }
                else {
                    thisBar.attr("selected", true).attr("fill", "green");
                    if (!numberOfSelected) {
                        selectedValues[0] = thisBar.attr("time");
                        dateFrom = setTime(units, thisBar.attr("time"));
                        dateTo = new Date(dateFrom.getTime());
                    }
                    else {
                        selectedValues[1] = thisBar.attr("time");
                        dateTo = setTime(units, thisBar.attr("time"));
                        validateOrder();
                        timeLineDestroy();
                        timeLine(decideUnits(units, selectedValues));
                    }
                    getTime(units);
                    numberOfSelected++;
                }
            }
            else {
                thisBar.attr("selected", false);
                numberOfSelected--;
                selectedValues.pop();
            }
        });

    bars.append("text")
        .attr("x", function (d) {
            return x(d.time / valueOfOneBar);
        })
        .attr("y", -25)
        .attr("dy", "20px")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .style("opacity", 0)
        .text(function (d) {
            return d.value;
    });

    d3.select("#timeLine").attr("height", height + margin.top + margin.bottom + 60)
        .attr("width", width + margin.left + margin.right + 60);

    chart.append("text")
        .attr("x", -(height / 2))
        .attr("y", -45)
        .attr("transform", "rotate(270)")
        .style("text-anchor", "middle")
        .text("Number of messages");

    chart.append("text")                                           // adding axis description
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("id", units)
        .style("text-anchor", "middle")
        .text(units);

    var ticks = d3.selectAll(".tick");
    for (var i = 1; i < numberOfBars + 1; i += 2) {
        ticks[0][i].childNodes[0].setAttribute("y2", 17);
        ticks[0][i].childNodes[1].setAttribute("y", 20);
    }

    var button = chart.append("g");
    button.append("rect")
        .attr("x", width - 60)
        .attr("y", height + 40)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 70)
        .attr("height", 20)
        .attr("fill", "#e6e6e6")
        .attr("border", 2)
        .attr("stroke", "black")
        .attr("id", "button")
        .on("click", function () {
            higher();
        });
    button.append("text")
        .attr("x", width - 40)
        .attr("y", height + 55)
        .attr("fill", "black")
        .style("cursor", "default")
        .text("back")
        .on("click", function () {
            higher();
        });
}

/**
 * Destroys time line diagram
 */
function timeLineDestroy() {
    var element = document.getElementById("timeLine");
    if (element !== null) {
        element.remove();
    }
}
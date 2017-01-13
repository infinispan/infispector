/**
 *   function return highest value from JSON data. Highest value is used as conversion for height of bars
 **/

function getHighestValue(data) {
    var max = 0;
    data.forEach(function (d) {
        if (max < d.numberOfMessages) {
            max = d.numberOfMessages;
        }
    });
    return max;
}

/**
 *   destroys time line graph, so we can recreate it
 **/

function destroyTimeLine() {
    var element = document.getElementById("timeLine");
    if (element !== null) {
        element.remove();
    }
}

/**
 *   graph itself
 *   @arg timeStampsArg - set to 24 or 60 dependig on current time visualization (24 for hours, 60 for minutes)
 *   @arg timeScaleArg - serves as naming of axis. Values - "Hour", "Minute", "Second"
 *   @arg multiplier - selected range (if user selects from 6 to 10, multiplier will be equal to 4)
 **/

function timeLine(timeStampsArg, timeScaleArg, multiplier) {
    var width = 500;
    var height = 100;
    var timeStamps = timeStampsArg;
    var barWidth;                                           // width of 1 bar
    var highestValue;
    timeStamps > 24 ? barWidth = 9.55 : barWidth = 24;      // conversions discovered by method attempt/fault
    var timeScale = timeScaleArg;
    var storage = localStorage.getItem("scales");
    if (storage === null) {
        localStorage.setItem("scales", timeScale);
    } else {
        storage = storage.split(",");
        storage.push(timeScale);
        localStorage.setItem("scales", storage);
    }
    var data = [];
    for (var j = 0; j < timeStamps; j++) {
        data[j] = {"timeStamp": (j + 1) * multiplier, "numberOfMessages": Math.floor(Math.random() * 100)}; //random for now. Will be replaced with druid request
    }
    highestValue = getHighestValue(data);
    var histogram = d3.layout.histogram()
            .bins(timeStamps)(data);            // creating histogram layout
    for (var i = 0; i < timeStamps; i++) {              // filling variable histogram with OUR data
        histogram[i].dx = width / timeStamps;           // width of bar
        histogram[i].x = (data[i].timeStamp / multiplier) * barWidth - barWidth;   // placing on x axis
        histogram[i].y = data[i].numberOfMessages;       // placing on y axis
        histogram[i].d = data[i].timeStamp;             // time
    }
    width += 80;              // now we resize width, so everything fit in

    var x = d3.scale.linear()
            .domain([0, timeStamps * multiplier])
            .range([0, width - 5]);

    var xAxis = d3.svg.axis()           //x axis
            .scale(x)
            .orient("bottom");

    var canvas = d3.select("#timeLineDiv").append("svg")
            .attr("width", width)
            .attr("height", height + 140)                        // need to add some height, so axis and axis description fits in
            .attr("id", "timeLine")
            .append("g")
            .attr("transform", "translate(0,0)");       //creating canvas

    var group = canvas.append("g")
            .attr("transform", "translate(-2.5," + (height) + ")")
            .attr("class", "axis")
            .call(xAxis);                                       // adding axis

    canvas.append("text")                                           // adding axis description
            .attr("x", width / 2)
            .attr("y", height + 30)
            .attr("id", timeScale)
            .style("text-anchor", "middle")
            .text(timeScale);

    var bars = canvas.selectAll(".bar")                 // creating element "g" for each bar
            .data(histogram)
            .enter()
            .append("g");

    bars.append("rect")                                 // creating bars
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return height - (d.y / highestValue * height);
            })      // highest value gets maximum height, others are set opposite to this
            .attr("width", function (d) {
                return d.dx;
            })
            .attr("height", function (d) {
                return d.y / highestValue * height;
            })
            .attr("time", function (d) {
                return d.d;
            })
            .attr("selected", 0)
            .attr("fill", "steelblue")
            .on("mouseover", function () {
                var thisBar = d3.select(this);
                if (parseInt(thisBar.attr("selected"), 10) === 0) {
                    thisBar.transition()
                            .attr("fill", "red");
                }
            })
            .on("mouseout", function () {
                var thisBar = d3.select(this);
                if (parseInt(thisBar.attr("selected"), 10) === 0) {
                    thisBar.transition()
                            .attr("fill", "steelblue");
                }
            })
            .on("click", function () {
                var thisBar = d3.select(this);
                var storage = localStorage.getItem("selectedTime");
                var difference;
                if (parseInt(thisBar.attr("selected"), 10) === 0) {        //bar selected
                    if (parseInt(localStorage.getItem("lowestLayer"), 10) === 1) {
                        alert("Unable to select more than 2 bars");
                        return;
                    }
                    thisBar.attr("selected", 1);
                    thisBar.transition().attr("fill", "green");
                    if (storage === null) {
                        localStorage.setItem("selectedTime", thisBar.attr("time"));
                    } else {
                        //we need to store every selected value, not just the last one
                        storage = storage.split(",");
                        storage.push(thisBar.attr("time"));
                        localStorage.setItem("selectedTime", storage);
                        if ((storage.length % 2) === 0) {        //if storage length is even, we are going to change level (2 values selected)
                            //we need to calculate difference between selected bars, so we can calculate, if change of scale is necessary
                            //first we must sort last 2 selected values
                            if (parseInt(storage[storage.length - 2], 10) > parseInt(storage[storage.length - 1], 10)) {
                                var x = storage[storage.length - 2];
                                storage[storage.length - 2] = storage[storage.length - 1];
                                storage[storage.length - 1] = x;
                                localStorage.setItem("selectedTime", storage);
                            }
                            difference = Math.abs(storage[storage.length - 1] - storage[storage.length - 2]) + (1 * multiplier);
                            clicked(timeScale, difference);
                        }
                    }
                } else {      //bar deselected
                    localStorage.setItem("lowestLayer", 0);
                    thisBar.attr("selected", 0);
                    thisBar.transition().attr("fill", "steelblue");
                    storage = storage.split(",");
                    var index = storage.lastIndexOf(thisBar.attr("time"));  //find index of deselected bar
                    storage.splice(index, 1);   //remove deselected bar from array
                    if (storage.length === 0) {  //no more selected bars (needs to be checked only in hour layer)
                        localStorage.removeItem("selectedTime");
                    } else {
                        localStorage.setItem("selectedTime", storage);
                    }
                }
            });

    //adding text with number of messages to bars 
    bars.append("text")
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return height - (d.y / highestValue * height);
            })
            .attr("dy", "20px")
            .attr("dx", function (d) {
                return d.dx / 2;
            })
            .attr("fill", "#FFF")
            .attr("text-anchor", "middle")
            .attr("font-size", "8px")
            .text(function (d) {
                return d.y;
            });

    //button for returning to higher lvl
    var button = canvas.append("g");
    button.append("rect")
            .attr("x", 504)
            .attr("y", 120)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", 70)
            .attr("height", 20)
            .attr("fill", "#e6e6e6")
            .attr("border", 2)
            .attr("stroke", "black")
            .attr("id", "button")
            .attr("timeStamp", timeScale)
            .on("click", function () {
                higher(d3.select(this).attr("timeStamp"));
            });
    button.append("text")
            .attr("x", 525)
            .attr("y", 135)
            .attr("fill", "black")
            .style("cursor", "default")
            .text("back")
            .on("click", function () {
                higher(d3.select("#button").attr("timeStamp"));
            });

}

/**
 *   function redraw graph with new time scaling
 *   @arg timeScale - past time scale. Needed so we can switch to next
 **/

function clicked(timeScale, multiplierArg) {
    var timeScaleNext;
    var multiplier = multiplierArg;
    var multi = localStorage.getItem("multipliers");
    switch (timeScale) {
        case "Hour":
            timeScaleNext = "Minute";
            break;
        case "Minute":
            //if multiplier is greater than 60, we have no need in changing level
            if (multiplier > 60) {
                multiplier /= 60;   //calculating next range of 1 bar
                timeScaleNext = "Minute";
            } else {
                timeScaleNext = "Second";
            }
            break;
        case "Second":
            //same as for minute
            if (multiplier > 60) {
                multiplier /= 60;
                timeScaleNext = "Second";
            } else {
                timeScaleNext = "Milisecond";
                multiplier *= 16.6666666666;
                /*alert("Unable to go any further");
                 return;*/
            }
            break;
        case "Milisecond":
            if (multiplier > 60) {
                multiplier /= 60;
                timeScaleNext = "Milisecond";
            } else {
                alert("Unable to go any further!");
                localStorage.setItem("lowestLayer", 1);
                return;
            }
    }
    //and now store multiplier, so we can implement returning to higher layer
    if (multi === null) {
        localStorage.setItem("multipliers", multiplier);
    } else {
        multi = multi.split(",");
        multi.push(multiplier);
        localStorage.setItem("multipliers", multi);
    }
    destroyTimeLine();
    timeLine(60, timeScaleNext, multiplier);
}

/**
 *   function redraw graph with time scaling one level higher
 **/

function higher() {
    var element = d3.select("#button");
    var timeScale = element.attr("timeStamp");
    var timeScaleNext;
    var ticks;
    var storage;
    var storage2;
    var multiply;
    var difference;
    var alreadySelected;
    if (timeScale === "Hour") {
        alert("Unable to go higher!");
        return;
    }
    localStorage.setItem("lowestLayer", 0);
    storage = localStorage.getItem("multipliers");
    storage = storage.split(",");
    storage.splice(storage.length - 1, 1);
    if (storage.length === 0) {
        localStorage.removeItem("multipliers");
    } else {
        localStorage.setItem("multipliers", storage);
    }
    multiply = storage[storage.length - 1];
    storage2 = localStorage.getItem("scales");
    storage2 = storage2.split(",");
    timeScaleNext = storage2[storage2.length - 2];
    storage2.splice(storage2.length - 2, 2);
    if (storage2.length === 0) {
        localStorage.removeItem("scales");
    } else {
        localStorage.setItem("scales", storage2);
    }
    storage = localStorage.getItem("selectedTime");
    storage = storage.split(",");
    difference = storage.length - ((storage2.length + 1) * 2);
    alreadySelected = storage.length % 2;
    storage.splice(storage.length - 2 - alreadySelected - difference, 2 + alreadySelected + difference);
    if (storage.length === 0) {
        localStorage.removeItem("selectedTime");
    } else {
        localStorage.setItem("selectedTime", storage);
    }
    timeScaleNext === "Hour" ? ticks = 24 : ticks = 60;
    destroyTimeLine();
    timeLine(ticks, timeScaleNext, multiply);
}

function getSelectedTime() {
    var selectedValues = localStorage.getItem("selectedTime");
    if (selectedValues === null) {
        alert("No time selected!");
        return 1;
    }
    var scales = localStorage.getItem("scales");
    var multipliers = localStorage.getItem("multipliers");
    multipliers = multipliers.split(",");
    var returnArray = [];
    var index;
    var from;
    var to;
    selectedValues = selectedValues.split(",");
    var selectedValuesLength = selectedValues.length;
    scales = scales.split(",");
    if (selectedValues === null) {
        alert("Error! No time selected");
        return null;
    }
    from = (selectedValues[0] - 1) * 3600000;
    //to = from;
    if (selectedValuesLength < 2) {
        to = from + 3600000;
        returnArray[0] = from;
        returnArray[1] = to;
        return returnArray;
    }
    to = (selectedValues[0] - multipliers[0]) * 3600000;
    //to = from;
    index = scales.lastIndexOf("Minute");
    if (index < 0 || selectedValuesLength === 2) {
        returnArray[0] = from;
        returnArray[1] = selectedValues[1] * 3600000;
        return returnArray;
    }
    if ((index * 2 + 1) > selectedValuesLength) {
        returnArray[0] = from + (selectedValues[selectedValuesLength - 2] - multipliers[index - 1]) * 60000;
        returnArray[1] = to + selectedValues[selectedValuesLength - 1] * 60000;
        return returnArray;
    }
    if ((index * 2) === selectedValuesLength - 1) {
        from += (selectedValues[selectedValuesLength - 1] - multipliers[index]) * 60000;
        returnArray[0] = from;
        returnArray[1] = from + (60000 * multipliers[index]);
        return returnArray;
    }
    from += (selectedValues[index * 2] - multipliers[index]) * 60000;
    to += (selectedValues[index * 2 + 1]) * 60000;
    //to = from;
    if ((index * 2 + 2) === selectedValuesLength) {
        returnArray[0] = from;
        returnArray[1] = to;
        return returnArray;
    }
    to = from;
    index = scales.lastIndexOf("Second");
    if ((index * 2 + 1) > selectedValuesLength) {
        returnArray[0] = from + (selectedValues[selectedValuesLength - 2] - multipliers[index - 1]) * 1000;
        returnArray[1] = to + selectedValues[selectedValuesLength - 1] * 1000;
        return returnArray;
    }
    if ((index * 2 + 1) === selectedValuesLength) {
        from += (selectedValues[selectedValuesLength - 1] - multipliers[index]) * 1000;
        returnArray[0] = from;
        returnArray[1] = from + (1000 * multipliers[index]);
        return returnArray;
    }
    from += (selectedValues[index * 2] - multipliers[index]) * 1000;
    to += selectedValues[index * 2 + 1] * 1000;
    //to = from;
    if ((index * 2 + 2) === selectedValuesLength) {
        returnArray[0] = from;
        returnArray[1] = to;
        return returnArray;
    }
    to = from;
    index = scales.lastIndexOf("Milisecond");
    if ((index * 2 + 1) > selectedValuesLength) {
        returnArray[0] = from + (selectedValues[selectedValuesLength - 2] - multipliers[index - 1]);
        returnArray[1] = parseInt(to, 10) + parseInt(selectedValues[selectedValuesLength - 1], 10);
        return returnArray;
    }
    if ((index * 2 + 1) === selectedValuesLength) {
        from += (selectedValues[selectedValuesLength - 1] - multipliers[index]);
        returnArray[0] = from;
        from = parseInt(from, 10) + parseInt(multipliers[index], 10);
        returnArray[1] = from;
        return returnArray;
    }
    from += selectedValues[index * 2] - multipliers[index];
    to += parseInt(selectedValues[(index * 2) + 1], 10);
    returnArray[0] = from;
    returnArray[1] = to;
    return returnArray;
}
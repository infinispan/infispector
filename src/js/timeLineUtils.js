var allUnits = {
    "hours" : {value: 24},
    "minutes" : {value: 60},
    "seconds" : {value: 60},
    "milliseconds" : {value: 50}
};       /** time unit with value which describes number of bars to be displayed */
var unitOrder = ["hours", "minutes", "seconds", "milliseconds"];
var dateFrom = new Date();
var dateTo;
var valueOfOneBar = 1;
var back = [];

/**
 * Method sets specific unit to selected time
 * @param units - units to be changed
 * @param timeSelected - value on which to change selected units
 * @returns {Date} - return date result
 */

function setTime(units, timeSelected) {        // will set new time in localStorage
    var date = new Date(dateFrom.getTime());
    switch (units) {
        case "hours":
            date.setHours(timeSelected);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            break;
        case "minutes":
            date.setMinutes(timeSelected);
            date.setSeconds(0);
            date.setMilliseconds(0);
            break;
        case "seconds":
            date.setSeconds(timeSelected);
            date.setMilliseconds(0);
            break;
        case "milliseconds":
            date.setMilliseconds(timeSelected);
            break;
    }
    return date;
}

/**
 * validates order of selected times. If user selects higher value first, it is stored in variable fromTime and lower value is in toTime. This methods reverts it.
 */

function validateOrder() {
    if (dateFrom > dateTo) {
        dateTo = [dateFrom, dateFrom = dateTo][0];
    }
}

/**
 * Method to decide if new units are necessary
 * @param currentUnits
 * @param selectedValues
 * @returns {*} - return which units should go next
 */

function decideUnits(currentUnits, selectedValues) {   // will decide new units (hours -> minutes -> seconds -> milliseconds)
    var nextUnits;
    back.push(currentUnits + "," + valueOfOneBar.toString());   /** for back button purposes */
    if (currentUnits === "milliseconds") {
        nextUnits = currentUnits;
        if (((Math.abs(selectedValues[0] - selectedValues[1]) + valueOfOneBar) * valueOfOneBar) < allUnits["milliseconds"].value) {
            displayGrowl("Unable to go any further!");
            back.pop();
            return "unable";
        }
        else {
            valueOfOneBar = Math.ceil(valueOfOneBar / allUnits["milliseconds"].value);
        }
    }
    else if (((Math.abs(selectedValues[0] - selectedValues[1]) + valueOfOneBar) * valueOfOneBar) >= allUnits[currentUnits].value) {
        nextUnits = currentUnits;
        valueOfOneBar = Math.ceil(valueOfOneBar / allUnits[currentUnits].value);
    }
    else {
        nextUnits = unitOrder[unitOrder.indexOf(currentUnits) + 1];
        valueOfOneBar = Math.abs(selectedValues[0] - selectedValues[1]) + valueOfOneBar;
        if (nextUnits === "milliseconds") {
            valueOfOneBar *= 1000;
        }
    }
    return nextUnits;
}

/**
 * Method which makes graph to go back to previous layer
 */

function higher() {
    var tmp = back.pop();
    if (tmp === undefined) {
        displayGrowl("Unable to go any higher!");
        return;
    }
    tmp = tmp.split(",");
    timeLineDestroy();
    valueOfOneBar = tmp[1];
    timeLine(tmp[0]);
}

/**
 * Method checks if times are not the same (in case only one bar is selected). If so, it increments value of current units in toTime
 */

function getTime(currentUnits) {
    if (dateFrom === dateTo) {
        switch (currentUnits) {
            case "hours":
                dateTo.setHours(dateFrom.getHours() + 1);
                break;
            case "minutes":
                dateTo.setMinutes(dateFrom.getMinutes() + 1);
                break;
            case "seconds":
                dateTo.setSeconds(dateFrom.getSeconds() + 1);
                break;
            case "milliseconds":
                dateTo.setMilliseconds(dateFrom.getMilliseconds() + 1);
                break;
        }
    }
    console.log(dateFrom);
    console.log(dateTo);
}

var allUnits = {
    "hours" : {value: 24},
    "minutes" : {value: 60},
    "seconds" : {value: 60},
    "milliseconds" : {value: 50}
};
var unitOrder = ["hours", "minutes", "seconds", "milliseconds"];
var dateFrom = new Date();
var dateTo = new Date();
var valueOfOneBar = 1;
var back = [];

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

function validateOrder() {
    if (dateFrom > dateTo) {
        dateTo = [dateFrom, dateFrom = dateTo][0];
    }
}

function decideUnits(currentUnits, selectedValues) {   // will decide new units (hours -> minutes -> seconds -> milliseconds)
    var nextUnits;
    back.push(currentUnits + "," + valueOfOneBar.toString());
    if (currentUnits === "milliseconds") {
        nextUnits = currentUnits;
        if (((Math.abs(selectedValues[0] - selectedValues[1]) + valueOfOneBar) * valueOfOneBar) < 50) {
            displayGrowl("Unable to go any further!");
            back.pop();
            return nextUnits;
        }
        else {
            valueOfOneBar = Math.ceil(valueOfOneBar / 50);
        }
    }
    else if (((Math.abs(selectedValues[0] - selectedValues[1]) + valueOfOneBar) * valueOfOneBar) >= 60) {
        nextUnits = currentUnits;
        valueOfOneBar = Math.ceil(valueOfOneBar / 60);
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

function getTime() {
    console.log(dateFrom);
    console.log(dateTo);
}
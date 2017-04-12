var start_time = document.getElementById("valR").value;
document.getElementById("start_input").value=start_time;
var end_time = document.getElementById("valR2").value;
document.getElementById("end_input").value=end_time;

function showVal(newVal)
{
    document.getElementById("start_input").value=newVal;
    start_time = document.getElementById("valR").value;
}

function changeSlider(sliderValue)
{
    document.getElementById("valR").value=sliderValue;
    start_time = document.getElementById("valR").value;
}

function showVal2(newVal2)
{
    document.getElementById("end_input").value=newVal2;
    end_time = document.getElementById("valR2").value;
}

function changeSlider2(sliderValue2)
{
    document.getElementById("valR2").value=sliderValue2;
    end_time = document.getElementById("valR2").value;
}
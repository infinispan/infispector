var loadingBar = document.getElementById("myBar");
var widthBar = 0;
var cnt = 0;
var requestsRemainingToPercent = 0;

function frame(percentages) {
    widthBar += percentages;
    loadingBar.style.width = widthBar + '%';
    loadingBar.innerHTML = widthBar * 1  + '%';
}
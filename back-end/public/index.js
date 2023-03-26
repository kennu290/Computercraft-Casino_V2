var userCount;
var wins;
var losses;
var winRate;
var alerts;
var currentAlertIndex = 1;

window.onload = function() {
    console.log("Site loaded!")
    reloadData()
};


function reloadData(){
    console.log("Running info update!")
    fetch("/api/data")
    .then(response => response.json())
    .then(data => {
        userCount = data.userCount
        wins = data.wins
        losses = data.losses
        alerts = data.alerts
        winRate = ((wins / (wins + losses)) * 100).toFixed(1);
        document.getElementById("userCountElement").textContent = userCount
        document.getElementById("winElement").textContent = wins
        document.getElementById("lossElement").textContent = losses
        document.getElementById("winRateElement").textContent = winRate + "%"
        if (alerts.length != 0){
            document.getElementById("alertElement").textContent = alerts[0]
            currentAlertIndex = 0
        }else{
            document.getElementById("alertElement").textContent = "No alerts!"
        }
    })
    .catch(error => console.error(error));
}

function changeAlertText() {
    if (alerts.length != 0) {
        document.getElementById("alertElement").textContent = alerts[currentAlertIndex]; // set the text of the element
        currentAlertIndex++
        if (alerts.length == currentAlertIndex){
            currentAlertIndex = 0
        }
    }
}

setInterval(changeAlertText, 5000);
setInterval(reloadData, 60000);
console.log("Intervals on!")
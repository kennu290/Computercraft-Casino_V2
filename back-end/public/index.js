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
    //console.log(`${new Date().toLocaleString()} - Running info update!`);
    fetch("/api/data")
    .then(response => response.json())
    .then(data => {
        userCount = data.userCount
        wins = data.wins
        losses = data.losses
        alerts = data.alerts
        winRate = ((wins / (wins + losses)) * 100).toFixed(1);
        try {
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
        }catch (error) {
            if (error instanceof TypeError) {
              // Handle the specific error here
            } else {
              throw error; // Rethrow the error to let it propagate
            }
          }
    })
    .catch(error => console.error(error));
}

function changeAlertText() {
    if (alerts.length != 0) {
        try {
            document.getElementById("alertElement").textContent = alerts[currentAlertIndex]; // set the text of the element
        } catch (error) {
            if (error instanceof TypeError) {
              // Handle the specific error here
            } else {
              throw error; // Rethrow the error to let it propagate
            }
          }
        currentAlertIndex++
        if (alerts.length == currentAlertIndex){
            currentAlertIndex = 0
        }
    }
}

function dashboard(){
    window.location.href = './'
}

function users(){
    window.location.href = './users.html'
}

function machines(){
    window.location.href = './machines.html'
}

function payments(){
    window.location.href = './payment.html'
}

function settings(){
    window.location.href = './settings.html'
}


function refreshList(){
    console.log(window.location.pathname);
}


setInterval(changeAlertText, 5000);
setInterval(reloadData, 30000);
console.log("Intervals on!")
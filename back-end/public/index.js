const { parse } = require("uuid");

var userCount;
var wins;
var losses;
var winRate;
var alerts;
var currentAlertIndex = 1;
var lastSelectedButton

window.onload = function() {
    console.log("Site loaded!")
    reloadData()
    refreshList()
};


function reloadData(){
    //console.log(`${new Date().toLocaleString()} - Running info update!`);
    fetch("/api/data/overview")
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
    console.log("Refresh of list requested.")
    if (window.location.pathname == "/users.html"){
        fetch("/api/data/users?size=" + Number.MAX_SAFE_INTEGER)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            data.forEach(element => {
                var htmlString = `<li class="list-group-item list-group-item-action border-0 mb-2">
                <div class="d-flex justify-content-between align-items-center py-2">
                  <h4 class="px-3">${element.token}</h4>
                  <div>
                    <i class="icon-edit">
                      <button type="button" class="btn btn-primary" id="iconButton" data-bs-toggle="modal" data-bs-target="#EditModal" onclick="startEditUser('${element.arrayPosition}')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                      </svg>
                      </button>
                    </i>
                    <i class="icon-trash mx-4">
                      <button type="button" class="btn btn-primary" id="iconButton" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="startDeleteUser('${element.arrayPosition}')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                      </svg>
                      </button>
                    </i>
                  </div>
                </div>
              </li>`
                const userListGroup = document.getElementById('userListGroup');
                userListGroup.innerHTML += htmlString;
            });

        })
        .catch(error => console.error(error));
    }
}

function deleteUser() {
    console.log(lastSelectedButton)
    // add your delete logic here
  }

function editUser() {
    console.log(lastSelectedButton)
    // add your edit logic here
}

function startEditUser(selectedButton){
    lastSelectedButton = selectedButton
    // opened user edit menu
}

function startDeleteUser(selectedButton){
    lastSelectedButton = selectedButton
    // opened user delete menu
}

function login(){
    var loginForm = document.forms["login-form"];
    var username = loginForm.elements["username"].value;
    var password = loginForm.elements["password"].value;
    console.log(username)
    console.log(password)
}




setInterval(changeAlertText, 5000);
setInterval(reloadData, 30000);
console.log("Intervals on!")

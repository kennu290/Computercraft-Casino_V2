var port = process.env.port || 80;
var express = require('express');
var handlebars = require('express3-handlebars');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
var application = express();

var userCount = 0;
var winCount = 0;
var loseCount = 0;
var alerts = [];
var users = [];
var machines = [];
let pairingTimer = null;
var machinePairing = false;


application.use(express.static(path.join(__dirname, 'public')));
application.use(bodyParser.json()); // add this line to parse JSON request body

application.engine('handlebars', handlebars({ defaultLayout: 'main' }));


function startMachinePairing() {
  machinePairing = true;
  // Set a timer to turn off machine pairing after 3 minutes of inactivity
  pairingTimer = setTimeout(() => {
    endMachinePairing();
  }, 3 * 60 * 1000); // 3 minutes in milliseconds
}

function endMachinePairing() {
  machinePairing = false;
  clearTimeout(pairingTimer);
  pairingTimer = null;
}

function verifyHash(hash){
  if (hash == undefined){
    return false
  }
  const base64DecodedData = hash;
  hash = Buffer.from(base64DecodedData, 'base64');
  var rehashed = crypto.createHash('sha256').update(hash).digest('hex');
  const contents = fs.readFileSync('hash.txt', 'utf-8');
  // use the contents as the comparing hash value
  const hashValue = contents.trim();
  if (rehashed === hashValue){
    return true;
  }else{
    return false;
  }
}

application.get('/api/data/overview', function(req, res) {
  var data = {
    userCount: userCount,
    wins: winCount,
    losses: loseCount,
    alerts: alerts
  };
  res.status(200).send(data);
});


application.get('/api/data/users', function(req, res) {
  // Get size and position from query parameters, with default values if not provided
  const size = parseInt(req.query.size) || 10;
  const position = parseInt(req.query.position) || 0;

  const data = users.slice(position, position + (size + 1)).map(user => {
    return {
      token: user.token,
      arrayPosition: user.arrayPosition
    };
  });

  res.status(200).send(data);
});


application.get('/api/user/getUser', function(req, res) {
  // Get size and position from query parameters, with default values if not provided
  const id = parseInt(req.query.id);
  const hash = req.query.hash;

  if (verifyHash(hash)){
    if (users[id] !== undefined){
      const data = users[id]
      res.status(200).send(JSON.stringify(data));
    }else{
      res.status(404).send()
    }
  }else{
    res.status(401).send("401 Unauthorized")
  }
});


application.post('/api/dash/login', function(req, res) {
  console.log("Received login request!");
  var { hash } = req.body; // Retrieve the hash value from the request body
  if (verifyHash(hash))
  {
    var data = {
      token: hash,
    };  
    res.status(200).send(data);
  }else{
    res.status(401).send("401 Unauthorized")
  }
});

application.post('/api/user/delete', function(req, res) {
  console.log("Received user delete");
  const { id, hash } = req.body; // Retrieve the hash and id value from the request body
  if (verifyHash(hash))
  {
    if (users[id] !== undefined){
      const deletedUser = users[id];
      const lastUser = users[users.length - 1];
      users[id] = lastUser;
      lastUser.arrayPosition = Number(id);
      users.pop();
      var data = {
        deletedId: deletedUser,
      };  
      userCount--
      res.status(200).send(data);
    } else {
      res.status(404).send({})
    }
  } else {
    res.status(401).send("401 Unauthorized")
  }
});

application.post('/api/alerts', function(req, res) {
  console.warn("Received an alert:");
  const { alert } = req.body; // Retrieve the alert from the request body
  console.warn(alert)
  alerts.push(alert)
  res.status(200).send({});
});

application.post('/api/user/update', function(req, res) {
  console.warn("Received a user update:");

  const hash = req.body.hash;
  var data = req.body.data;
  data = JSON.parse(data)
  if (verifyHash(hash)){
    users[data.arrayPosition] = data;
    res.status(200).send({});
  }else{
    res.status(401).send("401 Unauthorized")
  }
});

application.post('/api/user/create', function(req, res) {
  console.log("Received user creation!");
  newUserUuid = uuidv4();
  var user = {
    token: newUserUuid,
    balance: 0,
    totalWins: 0,
    totalLose: 0,
    isAdmin: false,
    isDisabled: false,
    playedGames: [],
    createdAt: new Date().toISOString().slice(0, 16),
    lastGameAt: null,
    arrayPosition: users.length
  };  
  res.status(200).send({ data: newUserUuid + "." + users.length });
  users[users.length] = user
  userCount = users.length;
  console.log(users)
});

application.post('/api/machine/create', function(req, res) {
  console.log("Received machine creation!");
  if (machinePairing == true){
    endMachinePairing()
    newMachineUuid = uuidv4();
    var machine = {
      token: newMachineUuid,
      machineType: machineType,
      arrayPosition: machines.length
    };  
    res.status(200).send({ data: machine });
    machines[machines.length] = machine
    console.log(machines)
  }else{
    res.status(403).send({})
  }
});

application.post('/api/machine/pair', function(req, res) {
  console.warn("Received a machine pair request");

  const hash = req.body.hash;
  var data = req.body.data;
  data = JSON.parse(data)
  if (verifyHash(hash)){
    console.log(data)
    startMachinePairing()
    machineType = data
    res.status(200).send({});
  }else{
    res.status(401).send("401 Unauthorized")
  }
});


application.listen(port);
console.log("Running site on port " + port);

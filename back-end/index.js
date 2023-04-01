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

restoreData()

application.use(express.static(path.join(__dirname, 'public')));
application.use(bodyParser.json()); // add this line to parse JSON request body

application.engine('handlebars', handlebars({ defaultLayout: 'main' }));


function findMachineByToken(token) {
  for (let i = 0; i < machines.length; i++) {
    if (machines[i].token === token) {
      return machines[i];
    }
  }
  return null; // return null if the token was not found in the array
}


function startMachinePairing() {
  console.log("Machine pairing started..")
  machinePairing = true;
  // Set a timer to turn off machine pairing after 3 minutes of inactivity
  pairingTimer = setTimeout(() => {
    endMachinePairing();
  }, 3 * 60 * 1000); // 3 minutes in milliseconds
}

function endMachinePairing() {
  console.log("Machine pairing ended..")
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

function saveData() {
  const data = { userCount, winCount, loseCount, alerts, users, machines };

  // Convert the data object to a JSON string
  const dataString = JSON.stringify(data);

  // Save the data to a file
  fs.writeFile('data.json', dataString, (err) => {
    if (err) {
      console.error(err);
      return;
    }else{
      console.log('Data saved to file!');
    }
  });
}


function restoreData() {
  // Read the data from the file
  fs.readFile('data.json', (err, data) => {
    if (err) {
      if (err.message.includes('ENOENT')) {
        return;
      }
      console.error(err);
      return;
    }
    
    // Parse the JSON string into an object
    const savedData = JSON.parse(data);

    // Retrieve the saved values
    userCount = savedData.userCount;
    winCount = savedData.winCount;
    loseCount = savedData.loseCount;

    alerts = savedData.alerts;
    users = savedData.users;
    machines = savedData.machines;
    console.log("Data restored!")
  });
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


application.get('/api/data/machines', function(req, res) {
  // Get size and position from query parameters, with default values if not provided
  const size = parseInt(req.query.size) || 10;
  const position = parseInt(req.query.position) || 0;

  const data = machines.slice(position, position + (size + 1)).map(machine => {
    return {
      token: machine.token,
      arrayPosition: machine.arrayPosition
    };
  });

  res.status(200).send(data);
});



application.post('/api/user/exitGame', function(req, res) {
  const machineToken = req.body.machineToken;
  const id = req.body.id;
  const machineType = req.body.machineType
  const data = req.body.data;
  // Check if machine exists and token is valid
  const machine = findMachineByToken(machineToken);
  if (machine) {
    if (id == data.arrayPosition){
      // Update machine state and send response
      console.log("Game ended for player: " + data.token)
      console.log(req.body)
      res.status(200).send();
    }
  } else {
    res.status(401).send("401 Unauthorized");
  }
});




application.get('/api/user/getUser', function(req, res) {
  // Get size and position from query parameters, with default values if not provided
  const id = parseInt(req.query.id);
  const hash = req.query.hash;
  if (verifyHash(hash) || findMachineByToken(hash)){
    if (users[id] !== undefined){
      if (findMachineByToken(hash)){
        users[id].lastGameAt = new Date().toISOString().slice(0, 16);
      }
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

application.delete('/api/user/delete/:id', function(req, res) {
  console.log("Received user delete");
  const { id } = req.params; // Retrieve the id value from the request params
  const { hash } = req.body; // Retrieve the hash value from the request body
  
  // Check if the hash is valid
  if (!verifyHash(hash)) {
    return res.status(401).send("401 Unauthorized");
  }
  
  // Check if the user exists
  if (users[id] === undefined) {
    return res.status(404).send({});
  }

  const deletedUser = users[id];
  const lastUser = users[users.length - 1];
  
  // Swap the deleted user with the last user in the array
  users[id] = lastUser;
  lastUser.arrayPosition = Number(id);
  users.pop();
  
  const data = {
    deletedId: deletedUser,
  };
  
  userCount--;
  return res.status(200).send(data);
});


application.delete('/api/machine/delete/:id', function(req, res) {
  console.log("Received machine delete");
  const { id } = req.params; // Retrieve the id value from the request params
  const { hash } = req.body; // Retrieve the hash value from the request body
  
  // Check if the hash is valid
  if (!verifyHash(hash)) {
    return res.status(401).send("401 Unauthorized");
  }
  
  // Check if the user exists
  if (users[id] === undefined) {
    return res.status(404).send({});
  }

  const deletedMachine = machines[id];
  const lastMachine = machines[machines.length - 1];
  
  // Swap the deleted machine with the last machine in the array
  machines[id] = lastMachine;
  lastMachine.arrayPosition = Number(id);
  machines.pop();
  
  const data = {
    deletedId: deletedMachine,
  };
  
  userCount--;
  return res.status(200).send(data);
});


application.post('/api/alerts', function(req, res) {
  console.log("Received an alert:");
  const { alert } = req.body; // Retrieve the alert from the request body
  
  if (!alert) {
    res.status(400).send('Invalid request: missing alert data');
  } else {
    console.log(alert);
    alerts.push(alert);
    res.status(200).send({});
  }
});


application.put('/api/user/update', function(req, res) {
  console.warn("Received a user update:");

  const hash = req.body.hash;
  var data = req.body.data;
  data = JSON.parse(data);

  if (!hash) {
    return res.status(400).send('Hash is missing.');
  }

  if (!data) {
    return res.status(400).send('Data is missing.');
  }

  if (typeof data.arrayPosition !== 'number' || data.arrayPosition < 0 || data.arrayPosition >= users.length) {
    return res.status(400).send('Invalid arrayPosition.');
  }

  if (!verifyHash(hash)) {
    return res.status(401).send('Unauthorized.');
  }

  users[data.arrayPosition] = data;
  res.status(200).send({});
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
      token: newMachineUuid + "." + "M",
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

application.get('/api/data/machines', function(req, res) {
  // Get size and position from query parameters, with default values if not provided
  const size = parseInt(req.query.size) || 10;
  const position = parseInt(req.query.position) || 0;

  const data = machines.slice(position, position + (size + 1)).map(machine => {
    return {
      token: machine.token,
      arrayPosition: machine.arrayPosition
    };
  });

  res.status(200).send(data);
});

application.get('/api/getStatus', function(req, res) {
  res.status(200).send("200 OK");
});



// Save every 2 minutes
setInterval(saveData, 120000); 

application.listen(port);
console.log("Running site on port " + port);

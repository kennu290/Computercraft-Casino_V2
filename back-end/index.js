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
var users = []

application.use(express.static(path.join(__dirname, 'public')));
application.use(bodyParser.json()); // add this line to parse JSON request body

application.engine('handlebars', handlebars({ defaultLayout: 'main' }));


function verifyHash(hash){
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

application.post('/api/dash/login', function(req, res) {
  console.log("Received login request!");
  const { hash } = req.body; // Retrieve the hash value from the request body
  if (verifyHash(hash))
  {
    var data = {
      token: hash,
    };  
    res.status(200).send(data);
  }else{
    res.status(401).send({})
  }
});


application.post('/api/user', function(req, res) {
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
    createdAt: new Date(),
    lastGameAt: null,
    arrayPosition: users.length
  };  
  res.status(200).send({ data: newUserUuid + "." + users.length });
  users[users.length] = user
  userCount = users.length;
  console.log(users)
});

application.listen(port);
console.log("Running site on port " + port);

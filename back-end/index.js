var port = process.env.port || 80;
var express = require('express');
var handlebars = require('express3-handlebars');
var bodyParser = require('body-parser');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
var application = express();

var userCount = 5;
var winCount = 50;
var loseCount = 50;
var alerts = [];
var users = []

application.use(express.static(path.join(__dirname, 'public')));
application.use(bodyParser.json()); // add this line to parse JSON request body

application.engine('handlebars', handlebars({ defaultLayout: 'main' }));

application.get('/api/data', function(req, res) {
  var data = {
    userCount: userCount,
    wins: winCount,
    losses: loseCount,
    alerts: alerts
  };
  res.status(200).send(data);
});

application.post('/api/user', function(req, res) {
  console.log("Received user creation!");
  newUserUuid = uuidv4();
  var user = {
    Token: newUserUuid,
    balance: 0,
    arrayPosition: users.length
  };
  res.status(200).send({ data: newUserUuid + "." + users.length });
  users[users.length] = user
  userCount++;
  console.log(users)
});

application.listen(port);
console.log("Running site on port " + port);

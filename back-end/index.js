var port = process.env.port || 80;
var express = require('express');
var handlebars = require('express3-handlebars');
var path = require('path');
var application = express();

var userCount = 5
var winCount = 50
var loseCount = 50
var alerts = []

application.use(express.static(path.join(__dirname, 'public')));

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

application.listen(port);
console.log("Running site on port " + port)

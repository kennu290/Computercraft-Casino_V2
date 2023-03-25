var port = process.env.port || 80;
var express = require('express');
var handlebars = require('express3-handlebars');
var path = require('path');
var application = express();


application.use(express.static(path.join(__dirname, 'public')));

application.engine('handlebars', handlebars({ defaultLayout: 'main' }));

application.get('/', function(req, res){
    res.render('index.html', { someProp: 3 });
});

application.listen(port);
console.log("Running site on port " + port)
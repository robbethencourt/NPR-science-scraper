// express
var express = require('express');

// Port
var app = express();
var PORT = process.env.PORT || 3000;


// body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: false
}));


// access to the public folder
app.use(express.static('app/public'));


// handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


// routes
require('./app/routing/html-routes.js')(app);


// listener
app.listen(PORT, function(){
	console.log("App is listening on port: " + PORT)
});
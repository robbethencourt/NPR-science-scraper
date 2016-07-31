// express
var express = require('express');

// Port
var app = express();
var PORT = process.env.PORT || 3000;


// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');


// Database configuration
var mongojs = require('mongojs');
var databaseUrl = "nprnews";
var collections = ["articles"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});


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
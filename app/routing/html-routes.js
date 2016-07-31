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

module.exports = function(app) {
	
	// home page
	app.get('/', function(req, res) {

		// requesting the npr science news page
		request('http://www.npr.org/sections/science/', function(error, response, html) {

				if (error) throw error;
			
				// Load the html into cheerio and save it to a var
  				var $ = cheerio.load(html);

  				// loop through each article
  				$('article').each(function(i, element) {

  					// declare an empty object to pass to mongo
  					var article = {};

  					// grab the title, href and content of each article
  					var title = $(this).find('h2.title').text();
  					var href = $(this).find('a').attr('href');
  					var content = $(this).find('p.teaser').text();

  					// only add article elements that have content for a title
  					if (title !== '') {

  						// build the article object
  						article = {
	  						title: title,
	  						href: href,
	  						content: content,
	  						comments: [{comment: ''}]
	  					}
	  					
	  					// update the db with articles
	  					db.articles.update(article, {upsert: true}, function(err, saved) {
	  						
	  						if (err) {
	  							throw err;
	  						} else {
	  							console.log(saved);
	  						}

	  					})

  					}

  				});

		});
		
		res.render('index',  {
			
		});

	});

} // end module.exports(app)
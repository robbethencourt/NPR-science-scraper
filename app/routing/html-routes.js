// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');;

module.exports = function(app) {
	
	// home page
	app.get('/', function(req, res) {

		// requesting the npr science news page
		request('http://www.npr.org/sections/science/', function(error, response, html) {
			
				// Load the html into cheerio and save it to a var
  				var $ = cheerio.load(html);

  				$('article').each(function(i, element) {

  					var title = $(this).find('h2.title').text();
  					var href = $(this).find('a').attr('href');
  					var content = $(this).find('p.teaser').text();
  					
  					console.log(title, href, content);

  				});

		});
		
		res.render('index',  {
			
		});

	});

} // end module.exports(app)
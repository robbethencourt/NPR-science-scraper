// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');


// Database configuration
var mongojs = require('mongojs');
var databaseUrl = "mongodb://heroku_wz71v7th:nvds2kqifsgo88c1rdug1hnv9d@ds145325.mlab.com:45325/heroku_wz71v7th"; // nprnews
var collections = ["articles"];
// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});

// export the data to the html-routes page
module.exports = function() {
	
	// get data function was not finishing before find was running when grouped in the app.get in the html routes. So I put it here and am requiring it before the get to the home page
	function getData() {
				
		// requesting the npr science news page and displaying the articles to the screen
		request('http://www.npr.org/sections/science/', function(error, response, html) {

			if (error) throw error;
		
			// Load the html into cheerio and save it to a var
			var $ = cheerio.load(html);

			// call the storeDataIntoDv function and pass the html we scraped into the cheerio $ variable
			storeDataIntoDb($);

		}); // end request()

	} // end getData()

	// call getData once we have all the website has been scraped
	getData();

	function storeDataIntoDb(data) {
		
		// loop through each article
		data('article').each(function(i, element) {

			// declare an empty object to pass to mongo
			var article = {};

			// grab the title, href and content of each article
			var title = data(this).find('h2.title').text();
			var href = data(this).find('a').attr('href');
			var slug = data(this).find('.slug').text();
			var slug_href = data(this).find('.slug a').attr('href');
			var affiliation = data(this).find('.affiliation').text();
			var affiliation_href = data(this).find('.affiliation a').attr('href');
			var content = data(this).find('p.teaser').text();

			// only add article elements that have content for a title
			if (title !== '') {
				
				// build the article object
				article = {
					title: title,
					href: href,
					slug: slug,
					slug_href: slug_href,
					affiliation: affiliation,
					affiliation_href: affiliation_href,
					content: content,
					comments: []
				}

				// check if the title is in the database
				db.articles.findOne({title: title}, function(error, doccheck) {

					// if it is...
					if (doccheck) {

						// ...console it out
						// console.log('yes   ' + title);

					// if it's not...
					} else {

						// insert the article into the db
						db.articles.insert(article, function(err, saved) {
							
							if (err) throw err;

							console.log(saved);

						}); // end db.articles.update()
					
					} // end if else

				}); // end db.articles.find()

			} // end if

		}); // end article.each()

	} // end storeDataIntoDb()

} // end module.exports()




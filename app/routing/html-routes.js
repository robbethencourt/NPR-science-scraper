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
						comments: []
					}

					// update the db with articles
					db.articles.update(article, function(err, saved) {
						
						if (err) throw err;

						console.log(saved);

					}); // end db.articles.update()

				} // end if

			}); // end article.each()

		}); // end request()

		// find each of the articles in the database
		db.articles.find({}, function(err, docs) {

			if (err) throw err;

			// articles and comments array to pass to handlebars
			var articles_hb = [];
			var comments_hb = [];

			// article and comments objects to push to arrays listed above
			var article_obj = {};
			var comments_obj = {};

			// loop through each of the returned docs from the database
			docs.forEach(function(article, index, array) {

				// emtpy out the object before each pass
				article_obj = {};
				comments_obj = {};

				// build the article and comments objects
				article_obj = {
					title: article.title,
					href: article.href,
					content: article.content,
					article_id: article._id.toString()
				};
				comments_obj = {
					comment: article.comments
				}

				// push those created objects into the appropriate array
				articles_hb.push(article_obj);
				comments_hb.push(comments_obj);

			}); // end docs.forEach()

			// render the index page and pass the data to handlebars
			res.render('index',  {

				articles: articles_hb,
				comments: comments_hb

			}); // end res.render()
			
		}); // end db.articles.find()

	}); // end app.get('/')

	// submit
	app.post('/submit', function(req, res) {

		var comment = req.body;

		console.log(comment.comment, comment.posted, comment.article_id);

		db.articles.update({"_id": (mongojs.ObjectId(comment.article_id))}, {$addToSet: {comments: {comment: comment.comment, posted: comment.posted}}}, function(err, docs) {
			console.log(docs);
		});

	}); // end app.get('/submit')

} // end module.exports(app)
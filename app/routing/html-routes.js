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

		// requesting the npr science news page and displaying the articles to the screen
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
				var slug = $(this).find('.slug').text();
				var slug_href = $(this).find('.slug a').attr('href');
				var affiliation = $(this).find('.affiliation').text();
				var affiliation_href = $(this).find('.affiliation a').attr('href');
				var content = $(this).find('p.teaser').text();

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

					// I tried to get upsert true going, but no. I had to go query the db to be sure the title isn't there before I add it
					db.articles.find({title: article.title}, function(error, doccheck) {
						
						// if the title isn't already in the db
						if (doccheck[0].title != article.title) {

							// insert the article into the db
							db.articles.insert(article, function(err, saved) {
								
								if (err) throw err;

								console.log(saved);

							}); // end db.articles.update()

						} // end if

					}); // end db.articles.find()

				} // end if

			}); // end article.each()

		}); // end request()

		// find each of the articles in the database and sort so that most recent appear at the top
		db.articles.find({}).sort({_id: 1}, function(err, docs) {

			if (err) throw err;

			// articles and comments array to pass to handlebars. comments array will be passed to the articles object
			var articles_hb = [];
			var comments_hb = [];

			// article objects to push to arrays listed above
			var article_obj = {};

			// loop through each of the returned docs from the database
			docs.forEach(function(article, index, array) {

				// emtpy out the object before each pass
				article_obj = {};

				// empty the comments array for each article to start fresh
				comments_hb = [];

				if (article.comments) {

					// loop through each article's comments
					article.comments.forEach(function(comment, c_index, c_array) {

						// console.log(comment);

						// push the comment object into the comments array
						comments_hb.push(comment);

						// sort the comments to the most recent ones appear at the top
						comments_hb.sort(function(a, b) {
							return b.posted - a.posted;
						});

					}); // end article.comments.forEach()

				}

				

				// build the article and comments objects
				article_obj = {
					title: article.title,
					href: article.href,
					slug: article.slug,
					slug_href: article.slug_href,
					affiliation: article.affiliation,
					affiliation_href: article.affiliation_href,
					content: article.content,
					article_id: article._id,
					comments: comments_hb // this is an array of comment objects
				};
				
				// push those created article objects into the aarticles array
				articles_hb.push(article_obj);

			}); // end docs.forEach()

			// render the index page and pass the data to handlebars
			res.render('index',  {

				articles: articles_hb

			}); // end res.render()
			
		}); // end db.articles.find()

	}); // end app.get('/')

	// submit comment
	app.post('/submit', function(req, res) {

		// store the comment object in a variable
		var comment = req.body;

		console.log(comment.comment, comment.posted, comment.article_id);

		// update the database with the new comment
		db.articles.update({"_id": (mongojs.ObjectId(comment.article_id))}, {$addToSet: {comments: {comment: comment.comment, posted: comment.posted}}}, function(err, docs) {

			console.log(docs);

		}); // end db.articles.update()

	}); // end app.get('/submit')

	// delete comment
	app.post('/delete', function(req, res) {
		
		// set the comment to delete details in a variable
		var comment_to_delete = req.body;

		// delete the comment form the database
		db.articles.update({"_id": (mongojs.ObjectId(comment_to_delete.article_id))}, {$pull: {comments: {posted: comment_to_delete.posted}}}, function(err, docs) {

			console.log(docs);

		}); // end db.articles.update()

	}); // end app.post('/delete')

} // end module.exports(app)
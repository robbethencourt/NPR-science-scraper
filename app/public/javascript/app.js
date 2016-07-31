// functions

// submit comment
function submitComment(article_id) {

	// get the textarea element and the comment and store in a variable
	var comment_box = $('.comment-box[data-role="' + article_id + '"]');
	var comment = $(comment_box).val();

	// clear out the comment details
	var comment_details = {};

	// build the comment object
	comment_details = {
		comment: comment,
		posted: Date.now(),
		article_id: article_id
	}

	console.log(comment_details);

	$.ajax({
		type: 'POST',
		url: '/submit',
		dataType: 'json',
		data: comment_details
	})
	.done(function(data) {
		
		console.log(data);

		$(comment_box).val('');

	});

} // end submitComment()


// click handlers

// submit comment
$('.submit-comment').on('click', function() {

	// grab the data role for this button
	var data_role = $(this).attr('data-role');
	
	// call the submitComment function and pass the article id
	submitComment(data_role);

	return false;
});
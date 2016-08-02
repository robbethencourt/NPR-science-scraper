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

	// ajax post that adds comments to the database
	$.ajax({
		type: 'POST',
		url: '/submit',
		dataType: 'json',
		data: comment_details
	})
	.done(function(data) {
		
		console.log(data);

		// empties out the comment textarea once the comment has been submitted
		$(comment_box).val('');

	}); // end ajax(/submit)

	var comments_display = $('.comments-display[data-role="' + article_id + '"]');
	var comment_div = $('<div class="comment-container">');
	var comment_p = $('<p>' + comment + '</p>').attr('class', comment_details.posted);
	var comment_delete_btn = $('<a class="btn btn-danger delete-comment">Delete Comment</a>').data('role', comment_details.posted);

	
	$(comment_p).appendTo(comment_div);
	$(comment_delete_btn).appendTo(comment_div);
	$(comment_div).prependTo(comments_display);

	console.log(comments_display);

} // end submitComment()

// delete comment
function deleteComment(posted_time, article_id) {

	// build the comment to delete identifiers with the posted time of the comment and the article id
	var comment_to_delete = {
		article_id: article_id,
		posted: posted_time
	}

	// ajax post to delete comment
	$.ajax({
		type: 'POST',
		url: '/delete',
		dataType: 'json',
		data: comment_to_delete
	})
	.done(function(data) {
		
		console.log(data);

	}); // end ajax(/delete)

} // end deleteComment()


// click handlers

// submit comment
$('.submit-comment').on('click', function() {

	// grab the data role for this button
	var data_role = $(this).attr('data-role');
	
	// call the submitComment function and pass the article id
	submitComment(data_role);

	// return false so we don't refresh the page
	return false;

}); // end submit-comment.on()

// delete comment
$('.delete-comment').on('click', function() {

	// grab the posted time for this comment and the article id
	var posted_time = $(this).attr('data-role');
	var article_id = $(this).parents('div.comments-display').attr('data-role');
	
	// call the deleteComment function and pass the posted time of the comment and the article id
	deleteComment(posted_time, article_id);

	// return false so we don't refresh the page
	return false;

}); // end delete-comment.on()
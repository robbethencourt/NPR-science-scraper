// functions

// submit comment
function submitComment(article_id) {

	// get the textarea element and the comment and store in a variable
	var comment_box = $('.comment-box[data-role="' + article_id + '"]');
	var comment = $(comment_box).val().trim();

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

	}); // end ajax(/submit)

	// build the comment elements
	// holds all the comments for that article
	var comments_display = $('.comments-display[data-role="' + article_id + '"]');

	// holds the elements for that specific comment
	var comment_container_div = $('<div class="comment-container">').attr('data-role', comment_details.posted);

	// div that contains the delete button within it
	var comment_delete_container_btn = $('<div class="delete-button-container">');
	var comment_delete_btn = $('<a href="" class="btn btn-danger delete-comment">Delete</a>').attr('data-role', comment_details.posted);

	// commment div that contains the p element, comment within it and the p element with the time posted. In this case I'm just passing in the just posted verbiage
	var comment_div = $('<div class="comment">');
	var comment_p = $('<p>' + comment + '</p>').attr('class', comment_details.posted);
	var comment_time = $('<p class="p-time">').text('just posted');

	// append the elements to each other
	// append p element of comment to the comment div, and the time to that same div
	$(comment_p).appendTo(comment_div);
	$(comment_time).appendTo(comment_div);

	// append the delete button to the containing div element
	$(comment_delete_btn).appendTo(comment_delete_container_btn);

	// append both the delete button and comment elements to the containing div for that specific comment
	$(comment_delete_container_btn).appendTo(comment_container_div);
	$(comment_div).appendTo(comment_container_div);

	// append the specific comment containing div with all child elements to the comments display div that holds all the comments. And prepend it so that the most recent comment shows first
	$(comment_container_div).prependTo(comments_display);

	// empties out the comment textarea once the comment has been submitted
	$(comment_box).val('');

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

	// grab the comment-container div to remove once the user has clicked the delete comment button
	var comment_del_quick = $('.comment-container[data-role="' + posted_time + '"]');

	// remove that div, which takes the comment and button with it
	$(comment_del_quick).remove();

} // end deleteComment()

// convert the time passed form handlebars into something humans can understand
function timeConverter() {

	// loop over each of the span elements that display the miliseconds from the database
	$('span').each(function(i, el) {

		// store the actual integer in a variable
		var db_time = $(el).text();

		// set the formatEachTime function to a variable so I can pass the returned formatted time to the page
		var time_to_display = formatEachTime(db_time);

		// enter the returned time to the same span element we got the original miliseconds from
		$(this).text(time_to_display);

	}); // end timeConverter()

	// convert miliseconds to hours and minutes
	function formatEachTime(miliseconds) {

		// grab the current time
		var time_now = Date.now();

		// get the differential from the current time to the miliseconds passed from the database
		var time_dif = Math.floor((time_now - miliseconds) / 60000);

		// if the elapaed time is greater than 60 minutes
		if (time_dif > 60) {

			// set the hours and minutes in separate variables
			var hours = Math.floor(time_dif / 60);
			var min = time_dif % 60;

			// set the time_dif variable to the reformatted hours and minutes
			time_dif = hours + ':' + min;
		} // end if

		// return the time differential in an integer we can pass to the screen
		return time_dif;

	} // end formatEachTime()

} // end timeConverter()


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

// delete comment. had to call on containing div so that dynammically added comments can be deleted
$('.comments-display').on('click', '.delete-comment', function() {

	// grab the posted time for this comment and the article id
	var posted_time = $(this).attr('data-role');
	var article_id = $(this).parents('div.comments-display').attr('data-role');
	
	// call the deleteComment function and pass the posted time of the comment and the article id
	deleteComment(posted_time, article_id);

	// return false so we don't refresh the page
	return false;

}); // end delete-comment.on()


// function invocations
timeConverter();
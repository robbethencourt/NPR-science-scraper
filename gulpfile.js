'use strict';

// requires
var gulp = require('gulp');
var sass = require('gulp-sass');
//var browserSync = require('browser-sync').create();


//gulp
// sass task
gulp.task('sass', function () {

	gulp.src('app/public/sass/**/*.scss')

    	.pipe(sass().on('error', sass.logError))

    	.pipe(gulp.dest('app/public/css'))

    	/* ========= Not yet working =========== */
    	// browser sync so that the browser automatically reloads when we save a .scss file. See more deatils below inteh gulp and browserSync section    	
    	// .pipe(browserSync.reload({
    	// 	stream: true
    	// }));

});


// watch task
gulp.task('watch', /*['browserSync', 'sass'],*/ function() {

    gulp.watch('app/public/sass/**/*.scss',['sass']);
    
});
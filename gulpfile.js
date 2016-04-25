"use strict";

var os        = require('os') 
, gulp        = require('gulp')
, concat = require('gulp-concat')
, sass        = require('gulp-sass')
, browserSync = require('browser-sync').create("Spin Spin Spin")
;

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], () => {
  browserSync.init({
    server: "./app"
  });

  gulp.watch("sass/*.scss", ['sass']);
  gulp.watch("app/*.html").on('change', browserSync.reload);
  gulp.watch("app/js/*.js").on('change', browserSync.reload);
});

gulp.task('vendor', () => {
  return gulp.src([
    'bower_components/tinycolor/dist/tinycolor-min.js'
  ]).pipe(concat('vendor.js'))
    .pipe(gulp.dest('app/js'));
});

gulp.task('sass', () => {
  gulp.src('sass/style.scss')
  .pipe(sass({
    includePaths: ['bower_components/'],
    outputStyle: 'compressed'
  }).on('error', sass.logError))
  .pipe(gulp.dest('app/style/'))
  .pipe(browserSync.stream());
})


gulp.task('default', ['vendor', 'serve']);
var os        = require('os') 
, gulp        = require('gulp')
, sass        = require('gulp-sass')
, browserSync = require('browser-sync').create("Spin Spin Spin")
;

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
  browserSync.init({
    server: "./app"
  });

  gulp.watch("scss/*.scss", ['sass']);
  gulp.watch("app/*.html").on('change', browserSync.reload);
});

gulp.task('sass', function () {
  gulp.src('sass/style.scss')
  .pipe(sass({
    includePaths: ['bower_components/'],
    outputStyle: 'compressed'
  }).on('error', sass.logError))
  .pipe(gulp.dest('app/style/'))
  .pipe(browserSync.stream());
})


gulp.task('default', ['serve']);
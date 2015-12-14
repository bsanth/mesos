var gulp = require('gulp');
var inject = require('gulp-inject');
var wiredep = require('wiredep').stream;

gulp.task('inject', function () {
  var target = gulp.src('./app/index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./app/**/*.js', './app/**/*.css'], {read: false});

  return target.pipe(inject(sources))
    .pipe(wiredep())
    .pipe(gulp.dest('./app'));
});

gulp.task('default', ['inject']);
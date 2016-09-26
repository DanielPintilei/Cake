var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var handlebars = require('gulp-compile-handlebars');
var htmlmin = require('gulp-htmlmin');
var data = require('gulp-data');
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();
var preen = require('preen');
var runSequence = require('run-sequence');

gulp.task('html', function() {
  var options = {
    ignorePartials: false,
    batch: ['source/hbs/partials']
  };
  return gulp.src("source/hbs/*.hbs")
    .pipe(plumber({
      errorHandler: notify.onError(function(error) {
        return "Problem file : " + error.message;
      })
    }))
    .pipe(data(function() {
      return require('./source/data/data.json');
    }))
    .pipe(handlebars(data, options))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest("source"));
});

gulp.task('css', function() {
  return gulp.src('source/styl/**/*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({
      compress: true
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  gulp.watch('source/hbs/**/*.hbs', ['html']);
  gulp.watch('source/*.html').on('change', browserSync.reload);
  gulp.watch('source/styl/**/*.styl', ['css']);
  gulp.watch('source/js/*.js').on('change', browserSync.reload);
  browserSync.init({
    server: {
      baseDir: 'source/'
    },
    tunnel: false,
    notify: false
  });
});

gulp.task('minhtml', function() {
  gulp.src(['build/*.html'])
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeEmptyAttributes: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('mincss', function() {
  return gulp.src('source/css/styles.css')
    .pipe(gulp.dest('build/css'));
});

gulp.task('userefjs', function() {
  return gulp.src('source/*.html')
    .pipe(useref())
    .pipe(gulp.dest('build'));
});

gulp.task('minjs', function() {
  return gulp.src('build/js/scripts.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('minimg', function() {
  gulp.src('source/img/*.*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: true
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('fonts', function() {
  return gulp.src('source/fonts/*.*')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('preen', function(cb) {
  preen.preen({}, cb);
});

gulp.task('done', function() {
  return gulp.src('/')
    .pipe(notify("Done"));
});

gulp.task('build', function(cb) {
  runSequence('userefjs', 'minhtml', 'mincss', 'minjs', ['minimg', 'fonts', 'preen'], 'done', cb);
});

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var rucksack = require('rucksack-css');
var cssnano = require('cssnano');
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
  var processors = [
    autoprefixer({
      browsers: ['last 2 versions']
    }),
    rucksack({
      responsiveType: true,
      shorthandPosition: true,
      quantityQueries: false,
      alias: false,
      inputPseudo: false,
      clearFix: false,
      fontPath: true,
      hexRGBA: true,
      easings: true
    })
  ];

  return gulp.src('source/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass()).on('error', notify.onError(function(error) {
      return "Problem file : " + error.message;
    }))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.stream());
});

gulp.task('default', function() {
  gulp.watch('source/hbs/**/*.hbs', ['html']);
  gulp.watch('source/*.html').on('change', browserSync.reload);
  gulp.watch('source/sass/**/*.scss', ['css']);
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
    .pipe(postcss([cssnano({
      discardComments: {
        removeAll: true
      }
    })]))
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
    .pipe(notify("Finished generating your static site!"));
});

gulp.task('build', function(cb) {
  runSequence('userefjs', 'minhtml', 'mincss', 'minjs', ['minimg', 'fonts', 'preen'], 'done', cb);
});

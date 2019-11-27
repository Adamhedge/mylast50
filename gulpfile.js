var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var browserifyCSS = require('browserify-css');
var eslint = require('gulp-eslint');
var vbuffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
const mocha = require('gulp-mocha');

var browseredCode = browserify('client/source/index.js', {
  debug: true,
  cache: {},
  packageCache: {},
})
  .transform(babelify, {presets: ['es2015', 'react', 'env']})
  .transform(browserifyCSS);

function bundle() {
  console.log('Gulping new react files...');
  return browseredCode.bundle()
    .pipe(source('index.js'))
    .pipe(vbuffer())
    .pipe(gulp.dest('./client/dist/'));
}

function linting() {
  console.log('Running ESLint');
  return gulp.src(['**/*.js'])
    .pipe(eslint({
      configFile: '.eslintrc.json',
      ignorePath: '.gitignore',
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function testing() {
  console.log('Running Mocha Tests');
  return gulp.src('./server/spotify/test_spotify_API_service.js', {read: false})
    .pipe(mocha());
}

gulp.task('reactWatch', () => {

  var bundler = watchify(browseredCode);
  bundler.on('update', bundle);
  bundle();
});

exports.default = gulp.series(testing, linting, bundle);

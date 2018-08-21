var gulp = require('gulp');
var babel = require("gulp-babel");
var babelify = require("babelify");
var browserify = require('browserify');
var browserifyCSS = require('browserify-css')
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify")
var watchify = require("watchify");

gulp.task("reactWatch", () => {
    var browseredCode = browserify("client/source/index.js", {
            debug: true,
            cache: {},
            packageCache: {}
        })
        .transform(babelify, {presets: ["es2015", "react", "env"]})
        .transform(browserifyCSS);

    var bundle = function() {
        console.log("Gulping new react files...")
        return browseredCode.bundle()
            .pipe(source("index.js"))
            .pipe(buffer())
            .pipe(gulp.dest("./client/dist/"));
    };

    bundler = watchify(browseredCode);
    bundler.on('update', bundle);
    bundle();
});

gulp.task('default', () => {
    browserify("client/source/index.js", {
        debug: true,
        cache: {},
        packageCache: {}
    })
    .transform(babelify, {presets: ["es2015", "react", "env"]})
    .transform(browserifyCSS)
    .bundle()
    .pipe(source("index.js"))
    .pipe(buffer())
    .pipe(gulp.dest("./client/dist/"))
    ;
});

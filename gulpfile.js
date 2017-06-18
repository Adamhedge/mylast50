var gulp = require('gulp');
var babel = require("gulp-babel");
var babelify = require("babelify");
var browserify = require('browserify');
var source = require("vinyl-source-stream");
var watchify = require("watchify");


gulp.task("reactWatch", function () {
    var browseredCode = browserify("client/source/index.js", {
            cache: {},
            packageCache: {},
            debug: true,
        })
        .transform(babelify, {presets: ["es2015", "react"]});

    var bundle = function() {
        return browseredCode.bundle()
            .pipe(source("index.js"))
            .pipe(gulp.dest("./client/dist/"));
    };

    bundler = watchify(browseredCode);
    bundler.on('update', bundle);

    bundle();
});

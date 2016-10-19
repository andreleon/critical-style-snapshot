// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var babel = require("gulp-babel");
var zip = require('gulp-zip');
var sequence = require('gulp-sequence')

var DEST_ROOT = 'dist';
var SRC_ROOT = 'src';

var src_styles = [
    'src/styles/globals/*.scss',
    'src/styles/mixins/*.scss',
    'src/styles/components/*.scss'
];

var src_scripts = [
    'src/scripts/execute.jsx'
];

gulp.task('zip', function() {
    return gulp.src(`${DEST_ROOT}/**/*`)
        .pipe(zip('critical-style-snapshot.zip'))
        .pipe(gulp.dest('.'));
});

// CSS
gulp.task('sass', function() {
    return gulp.src(src_styles)
        .pipe(concat('style.scss'))
        .pipe(sass())
        .pipe(rename('style.css'))
        .pipe(gulp.dest(`${DEST_ROOT}/styles`));
});

gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(gulp.dest(`${DEST_ROOT}/images`));
});

// Concatenate
gulp.task('scripts', function() {

    return gulp.src(src_scripts)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(browserify({
            insertGlobals : true
        }))
        //.pipe(uglify())
        .pipe(rename('execute.js'))
        .pipe(gulp.dest(`${DEST_ROOT}/scripts`));
});

gulp.task('index', function() {
    return gulp.src(`${SRC_ROOT}/index.js`)
        .pipe(gulp.dest(`${DEST_ROOT}`));
});

gulp.task('manifest', function() {
    return gulp.src(`${SRC_ROOT}/manifest.json`)
        .pipe(gulp.dest(`${DEST_ROOT}`));
});

// Watch
gulp.task('watch', function() {
    gulp.watch('src/manifest.json',     ['manifest']);
    gulp.watch('src/index.js',          ['index']);
    gulp.watch('src/scripts/**/*.jsx',  ['scripts']);
    gulp.watch('src/styles/**/*.scss',  ['sass']);
    gulp.watch('src/images/**/*',       ['images']);
});

// Package
gulp.task('package', sequence(['manifest', 'index', 'scripts', 'sass', 'images'], ['zip']));

// Default
gulp.task('default', ['manifest', 'index', 'scripts', 'sass', 'images', 'watch']);

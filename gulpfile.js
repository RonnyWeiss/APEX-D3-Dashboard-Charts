/*
npm install -g gulp-cli
npm install gulp --save-dev
npm install gulp-concat --save-dev
npm install gulp-uglify --save-dev
npm install gulp-uglifycss --save-dev
*/

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

function concatjs() {
  return gulp.src([
    './js/lib/d3.js',
    './js/lib/nbillboard.js',
    './js/script.js'])
    .pipe(concat('d3dashboard.pkgd.min.js'))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(gulp.dest('./build/'));
}

function concatcss() {
  return gulp.src('./css/*.css')
    .pipe(concat({ path: 'd3dashboard.pkgd.min.css' }))
    .pipe(uglifycss({ "uglyComments": true }))
    .pipe(gulp.dest('./build/'))
}

exports.concatmainjs = concatjs;
exports.concatcss = concatcss;
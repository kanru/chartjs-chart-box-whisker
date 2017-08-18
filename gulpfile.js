var browserify = require('browserify'),
  concat = require('gulp-concat'),
  gulp = require('gulp'),
  insert = require('gulp-insert'),
  jshint = require('gulp-jshint'),
  karma = require('karma'),
  package = require('./package.json'),
  path = require('path'),
  replace = require('gulp-replace'),
  source = require('vinyl-source-stream');
  streamify = require('gulp-streamify'),
  uglify = require('gulp-uglify');

var srcDir = './src/';
var srcFiles = srcDir + '**.js';
var buildDir = './';

var header = "/*!\n\
 * chartjs-chart-box-whisker\n\
 * Version: {{ version }}\n\
 *\n\
 * Copyright 2017 Kan-Ru Chen\n\
 * Copyright 2017 Ben McCann\n\
 * Released under the MIT license\n\
 * https://github.com/kanru/chartjs-chart-box-whisker/blob/master/LICENSE.md\n\
 */\n";

gulp.task('default', ['build', 'jshint', 'watch']);
gulp.task('build', buildTask);
gulp.task('jshint', jsHintTask);
gulp.task('watch', watchTask);
gulp.task('test', testTask);

function buildTask() {
  var nonBundled = browserify('./src/index.js')
    .ignore('chart.js')
    .bundle()
    .pipe(source('Chart.BoxWhisker.js'))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(buildDir))
    .pipe(streamify(uglify()))
    .pipe(streamify(concat('Chart.BoxWhisker.min.js')))
    .pipe(gulp.dest(buildDir));

  return nonBundled;

}

function watchTask() {
  return gulp.watch(srcFiles, ['build', 'jshint']);
}

function jsHintTask() {
  return gulp.src(srcFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}

function startTest() {
  return [
    './node_modules/moment/min/moment.min.js',
    './test/jasmine.index.js',
    './src/**/*.js',
  ].concat(
    ['./test/specs/**/*.js']
  );
}

function runTest(done, singleRun) {
    new karma.Server({
        configFile: path.join(__dirname, 'karma.conf.js'),
        files: startTest(),
        singleRun: singleRun
    }, done).start();
}

function testTask(done) {
    runTest(done, true);
}

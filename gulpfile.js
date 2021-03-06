const gulp = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const del = require('del');
const path = require('path');
const webpackStream = require('webpack-stream');
const manifest = require('./package.json');
const $ = loadPlugins();
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));

function cleanDist(done) {
  del([destinationFolder]).then(() => done());
}

function cleanTmp(done) {
  del(['tmp']).then(() => done());
}

function build() {
  return gulp.src(path.join('src', config.entryFileName))
    .pipe(webpackStream({
      output: {
        filename: `${exportFileName}.js`,
        libraryTarget: 'umd',
        library: config.mainVarName
      },
      externals: {},
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
          }
        ]
      },
      devtool: 'source-map'
    }))
    .pipe(gulp.dest(destinationFolder))
    .pipe($.filter(['**', '!**/*.js.map']))
    .pipe($.rename(`${exportFileName}.min.js`))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder));
}

gulp.task('clean', cleanDist);
gulp.task('clean-tmp', cleanTmp);
gulp.task('build', build);

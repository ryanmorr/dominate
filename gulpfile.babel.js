import pkg from './package.json';
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import uglify from 'gulp-uglify';
import header from 'gulp-header';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import browserify from 'browserify';
import babelify from 'babelify';
import del from 'del';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const banner = '/*! ${pkg.name} v${pkg.version} | ${pkg.homepage} */\n';

const config = {
    files: './src/**/*.js',
    entryFile: './src/dominate.js',
    outputFile: 'dominate.js',
    outputDir: './dist/',
    specs: './test/*.js'
};

gulp.task('clean', () => {
    return del.sync([config.outputDir]);
});

gulp.task('build', ['clean'], () => {
    return browserify(config.entryFile, {debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source(config.outputFile))
        .pipe(buffer())
        .pipe(header(banner, {pkg}))
        .pipe(gulp.dest(config.outputDir))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(rename({suffix: '.min'}))
        .pipe(header(banner, {pkg}))
        .pipe(gulp.dest(config.outputDir));
});

gulp.task('lint', () => {
    return gulp.src(['./gulpfile.babel.js', config.files, config.specs])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
    return gulp.src(config.specs)
        .pipe(mocha({
            compilers: [
                'js:babel-core/register'
            ]
        }));
});

gulp.task('default', [
    'lint',
    'test',
    'build'
]);

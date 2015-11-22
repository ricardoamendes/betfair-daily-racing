// Gulp task file. Usage:
//  gulp dev
//  gulp prod
//  gulp serve
//  gulp release

'use strict';

// Core and dev helper modules
import gulp from 'gulp';
import webpack from 'gulp-webpack';
import envs from 'gulp-environments';
import browserSync from 'browser-sync';
import scp from 'gulp-scp';
import config from './config.json';

// Styles helper modules
import sass from 'gulp-ruby-sass';
import autoprefixer from 'gulp-autoprefixer';
import concatcss from 'gulp-concat-css';

// Scripts helper modules
import jshint from 'gulp-jshint';
import inlinesource from 'gulp-inline-source';
import minifyhtml from 'gulp-minify-html';

const dev = envs.development;
const prod = envs.production;

// Source and build folders
const dirs = {
    app: 'app',
    server: 'server',
    dev: 'build/dev',
    prod: 'build/prod'
};

// Source and build file paths
const paths = {
    src: {
        html: `${dirs.app}/index.html`,
        scripts: `${dirs.app}/scripts/**/*.js`,
        styles: [`${dirs.app}/styles/**/*.scss`],
        assets: [`${dirs.app}/assets`]
    },
    dev: {
        html: `${dirs.dev}/index.html`,
        scripts: `${dirs.dev}/js/`,
        styles: `${dirs.dev}/css/`,
        assets: `${dirs.dev}/assets/`
    },
    prod: {
        app: `${dirs.prod}/index.html`,
        server: `${dirs.server}/server.js`
    }
};

// Process index.html
gulp.task('html', () => {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(dirs.dev))
        .pipe(dev(browserSync.stream()));
});

// Scripts
gulp.task('scripts', () => {
    return gulp.src(paths.src.scripts)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest(paths.dev.scripts))
        .pipe(dev(browserSync.stream()));
});

// Compile sass into CSS
gulp.task('styles', () => {
    return sass(paths.src.styles)
        .pipe(autoprefixer('last 2 version'))
        .pipe(concatcss('bundle.css'))
        .pipe(gulp.dest(paths.dev.styles))
        .pipe(dev(browserSync.stream()));
});

// Copy assets
gulp.task('assets', () => {
    return sass(paths.src.assets)
        .pipe(gulp.dest(paths.dev.assets))
        .pipe(dev(browserSync.stream()));
});

// Inline and minify sources
gulp.task('optimize', () => {
    return gulp.src(paths.dev.html)
        .pipe(inlinesource())
        .pipe(minifyhtml())
        .pipe(gulp.dest(dirs.prod));
});

// Deploy production client and server scripts to server
gulp.task('deploy', function() {
    return gulp.src([paths.prod.app, paths.prod.server])
        .pipe(scp(config.server));
});

// // Set development flag
gulp.task('set-dev', dev.task);
//
// // Set production flag
gulp.task('set-prod', prod.task);

// Build pipeline task
gulp.task('build', ['html', 'scripts', 'styles', 'assets']);

// Dev build task
gulp.task('dev', ['set-dev', 'build']);

// Prod build task
gulp.task('prod', ['set-prod', 'build', 'optimize']);

// Build and release task
gulp.task('release', ['prod', 'deploy']);

// Static server + watching scss/html files
gulp.task('serve', ['set-dev', 'build'], () => {
    browserSync.create();
    browserSync.init({
        server: `${dirs.dev}`
    });
    gulp.watch(paths.src.html, ['html']);
    gulp.watch(paths.src.scripts, ['scripts']);
    gulp.watch(paths.src.styles, ['styles']);
    gulp.watch(paths.src.assets, ['assets']);
});

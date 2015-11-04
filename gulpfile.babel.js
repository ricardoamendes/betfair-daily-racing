// Load plugins
import gulp from 'gulp';
import sass from 'gulp-ruby-sass';
import autoprefixer from 'gulp-autoprefixer';
import jshint from 'gulp-jshint';
import browserSync from 'browser-sync';

// Source and build folders
const dirs = {
  src: 'app',
  build: {
    local: 'build/local'
  }
};

// Source and build file paths
const paths = {
  src: {
    html: `${dirs.src}/index.html`,
    scripts: `${dirs.src}/scripts/**/*.js`,
    styles: `${dirs.src}/styles/**/*.scss`
  },
  build: {
    local: {
      html: `${dirs.build.local}/index.html`,
      scripts: `${dirs.build.local}/js/`,
      styles: `${dirs.build.local}/css/`
    }
  }
};

// Process index.html
gulp.task('html', () => {
  return gulp.src(paths.src.html)
    .pipe(gulp.dest(dirs.build.local))
    .pipe(browserSync.stream())
});

// Compile sass into CSS
gulp.task('styles', () => {
  return sass(paths.src.styles)
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(paths.build.local.styles))
    .pipe(browserSync.stream())
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src(paths.src.scripts)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest(paths.build.local.scripts))
    .pipe(browserSync.stream())
});

// Static server + watching scss/html files
gulp.task('serve', ['html', 'scripts', 'styles'], () => {
  browserSync.create();
  browserSync.init({
    server: `${dirs.build.local}`
  });
  gulp.watch(paths.src.html, ['html']);
  gulp.watch(paths.src.scripts, ['scripts']);
  gulp.watch(paths.src.styles, ['styles']);
});

gulp.task('default', ['serve']);

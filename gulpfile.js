const gulp = require('gulp')
const plumber = require('gulp-plumber')
const browserSync = require('browser-sync')
const stylus = require('gulp-stylus')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const jeet = require('jeet')
const rupture = require('rupture')
const koutoSwiss = require('kouto-swiss')
const prefixer = require('autoprefixer-stylus')
const imagemin = require('gulp-imagemin')
const cp = require('child_process')

const messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
}

const jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll'

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild)
  return cp.spawn(jekyllCommand, ['build'], { stdio: 'inherit' })
    .on('close', done)
})

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload()
})

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-build'], function () {
  browserSync({
    server: {
      baseDir: '_site'
    }
  })
})

/**
 * Stylus task
 */
gulp.task('stylus', function () {
  gulp.src('src/styl/main.styl')
    .pipe(plumber())
    .pipe(stylus({
      use: [koutoSwiss(), prefixer(), jeet(), rupture()],
      compress: true
    }))
    .pipe(gulp.dest('_site/assets/css/'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/css'))
})

/**
 * Javascript Task
 */
gulp.task('js', function () {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js/'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('_site/assets/js/'))
})

/**
 * Imagemin Task
 */
gulp.task('imagemin', function () {
  return gulp.src('src/img/**/*.{jpg,png,gif}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'))
})

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch('src/styl/**/*.styl', ['stylus'])
  gulp.watch('src/js/**/*.js', ['js'])
  gulp.watch('src/img/**/*.{jpg,png,gif}', ['imagemin'])
  gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild'])
})

/**
 * Default task, running just `gulp` will compile the stylus,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['js', 'stylus', 'browser-sync', 'watch'])

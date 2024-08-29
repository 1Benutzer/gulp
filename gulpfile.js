const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');

function browsersync() {
    browserSync.init({
      server: {
        baseDir: 'app/'
      }
    })
}

function styles() {
    return src('app/scss/parts/style.scss')
    // .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sass())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
    // 'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function images () {
  return src('app/images/**/*.*', {
    encoding: false
  })
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false },
          ]
        })
        ], {
           verbose: true 
        }))    
    .pipe(dest('dist/images'));
}

function svgSprites() {
  return src('app/images/sprite-icons/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(dest('app/images'));
}

function  convertFonts() {
  return src('app/fonts/*.ttf')
    .pipe(tt2woff2())
    .pipe(dest('app/fonts'));
}

function build() {
  return src ([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
  ], {base: 'app'})
  .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist')
}

function watching() {
    watch(['app/scss/**/*.scss',
    ], styles);
    // watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/images/sprite-icons/*.svg'], svgSprites)
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.svgSprites = svgSprites;
exports.convertFonts = convertFonts;
exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, browsersync, watching);
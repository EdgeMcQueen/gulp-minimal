// основные модули
var gulp            = require('gulp'),
    babel           = require('gulp-babel'),
    browserSync     = require('browser-sync'),
    watch           = require('gulp-watch'),
    devip           = require('dev-ip');
// модули разметки

// модули стилей
var sass            = require('gulp-sass'),
    smartgrid       = require('smart-grid'),
    gcmq            = require('gulp-group-css-media-queries'),
    cleanCSS        = require('gulp-clean-css'),
    autoprefixer    = require('gulp-autoprefixer');
// модули скриптов
var minJs           = require('gulp-terser');
// модули изображений
// модули валидации, проверок и исправлений

// остальные модули
var concat          = require('gulp-concat'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    cache           = require('gulp-cache'),
    sourcemaps      = require('gulp-sourcemaps'),
    plumber         = require('gulp-plumber');

// настройки сетки smart-grid
gulp.task('smart-grid', (cb) => {
    smartgrid('app/scss/libs', {
      outputStyle: 'scss',
      filename: '_smart-grid',
      columns: 12, // number of grid columns
      offset: '1.875rem', // gutter width - 30px
      mobileFirst: true,
      mixinNames: {
          container: 'container'
      },
      container: {
        maxWidth: '1170px',
        fields: '0.9375rem' // side fields - 15px
      },
      breakPoints: {
        xs: {
            width: '20rem' // 320px
        },
        sm: {
            width: '36rem' // 576px
        },
        md: {
            width: '48rem' // 768px
        },
        lg: {
            width: '62rem' // 992px
        },
        xl: {
            width: '75rem' // 1200px
        }
      }
    });
    cb();
  });

// Таск для сборки HTML
gulp.task('html', function(callback) {
	return gulp.src('./src/*.html')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'HTML include',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( gulp.dest('./dist/') )
		.pipe(browserSync.reload({ stream: true }))
	callback();
});

  // Таск для компиляции SCSS в CSS
gulp.task('scss', function(callback) {
	return gulp.src('src/scss/**/*.scss')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Styles',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( sourcemaps.init() )
		.pipe( sass() )
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(qcmq()) //группировка медиа запросов
		.pipe(cleanCSS()) //минификация css
		.pipe(rename({suffix: '.min'}))
		.pipe( sourcemaps.write('./maps/') )
		.pipe( gulp.dest('./dist/css/') )
		.pipe( browserSync.stream() )
	callback();
});

// Такс Изображений
gulp.task('copy:images', function(callback) {
	return gulp.src('./src/images/**/*.*')
	  .pipe(gulp.dest('./dist/images/'))
	callback();
});

// Таск шрифтов
gulp.task('copy:fonts', function(callback) {
	return gulp.src('./src/fonts/**/*.*')
	  .pipe(gulp.dest('./dist/fonts/'))
	callback();
});

// Таск Скриптов
gulp.task('copy:js', function(callback) {
	return gulp.src('./src/js/**/*.*')
	  .pipe(gulp.dest('./dist/js/'))
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {
    // Слежение за HTML и обновление браузера
        watch(['./src/*.html'],
            gulp.parallel( browserSync.reload ));

        // Следим за картинками и скриптами и обновляем браузер
        watch( ['./build/js/**/*.*', './build/img/**/*.*', './build/fonts/**/*.*'], gulp.parallel(browserSync.reload) );

        // Запуск слежения и компиляции SCSS с задержкой
        watch('./src/scss/**/*.scss', function(){
            setTimeout( gulp.parallel('scss'), 500 )
        })

        // Слежение за HTML и сборка страниц и шаблонов
        watch('./src/html/**/*.html', gulp.parallel('html'))

        // Следим за картинками и скриптами, и копируем их в build
        watch('./src/img/**/*.*', gulp.parallel('copy:img'))
        watch('./src/fonts/**/*.*', gulp.parallel('copy:fonts'))
        watch('./src/js/**/*.*', gulp.parallel('copy:js'))

    });

    // Таск для старта сервера из папки app
    gulp.task('server', function() {
        browserSync.init({
            host: devip(),
            notify: false,
            server: {
                baseDir: "./dist/",
            }
        })
    });

    gulp.task('clean:build', function() {
        return del('./dist')
    });

    // Дефолтный таск (задача по умолчанию)
    // Запускаем одновременно задачи server и watch
    gulp.task(
            'default',
            gulp.series(
                    gulp.parallel('clean:build'),
                    gulp.parallel('scss', 'html', 'css-lib', 'copy:img', 'copy:fonts', 'copy:js'),
                    gulp.parallel('server', 'watch'),
                )
        );
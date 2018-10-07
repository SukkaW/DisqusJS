let gulp = require('gulp');
let uglify = require('gulp-uglify');
let autoprefixer = require('gulp-autoprefixer');
let cleanCSS = require('gulp-clean-css');

var configs = {
    autoprefixer: {
        browsers: [
            'last 2 versions',
            '> 1%',
            'Chrome >= 30',
            'Firefox >= 30',
            'ie >= 9',
            'Safari >= 8',
        ],
    },
    cleanCSS: {
        compatibility: 'ie10'
    },
};

gulp.task('minify-js', () => {
    return gulp.src('src/**/*.js')
        .pipe(uglify({
            output: {
                comments: /^!/
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', () => {
    return gulp.src('src/**/*.css')
        .pipe(autoprefixer(configs.autoprefixer))
        .pipe(cleanCSS(configs.cleanCSS))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('minify-js', 'minify-css'));

gulp.task('default', gulp.parallel('build'));
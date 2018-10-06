let gulp = require('gulp');
let uglify = require('gulp-uglify');

gulp.task('build', () => {
    return gulp.src('src/**/*.js')
        .pipe(uglify({
            output: {
                comments: /^!/
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.parallel('build'));
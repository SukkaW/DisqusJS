let gulp = require('gulp');
let uglify = require('gulp-uglify');
let rename = require("gulp-rename");

gulp.task('build', () => {
    return gulp.src('src/**/*.js')
        .pipe(uglify({
            output: {
                comments: /^!/
            }
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.parallel('build'));
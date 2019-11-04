const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const header = require('gulp-header');
const pkg = require('./package.json');


const jsBanner = ['/*! DisqusJS v<%= pkg.version %>',
    'Sukka (https://skk.moe)',
    'https://disqusjs.skk.moe',
    '<%= pkg.license %> License */',
].join(' | ');

const cssBanner = ['/*! DisqusJS - Default Theme | v<%= pkg.version %>',
    'Sukka (https://skk.moe)',
    'https://disqusjs.skk.moe',
    '<%= pkg.license %> License */'
].join(' | ');


const configs = {
    browsers: [
        'last 2 versions',
        'since 2015',
        '> 1%',
        'Chrome >= 49',
        'Firefox >= 44',
        'ie >= 10',
        'Safari >= 9',
    ],
    cleanCSS: {
        compatibility: 'ie10'
    },
};

gulp.task('minify-js', () => gulp.src('src/**/*.js')
    .pipe(babel({
        "presets": [
            ["@babel/env", {
                "targets": configs.browsers
            }]
        ]
    }))
    .pipe(uglify({
        keep_fnames: false
    }))
    .pipe(header(jsBanner, { pkg }))
    .pipe(gulp.dest('dist')));

gulp.task('minify-css', () => gulp.src('src/**/*.css')
    .pipe(autoprefixer(configs.browsers))
    .pipe(cleanCSS(configs.cleanCSS))
    .pipe(header(cssBanner, { pkg }))
    .pipe(gulp.dest('dist')));

gulp.task('build', gulp.parallel('minify-js', 'minify-css'));

gulp.task('default', gulp.parallel('build'));
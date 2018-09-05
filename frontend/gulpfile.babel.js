import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config';
import path from 'path';

let location = {
    public: 'client',
    server: 'server'
}

gulp.task('dist:server', () => {
    gulp.src(path.join(location.server, 'index.js'))
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(gulp.dest(path.join(location.server, 'dist')))
})

gulp.task('watch:server', () => {
    gulp.watch(path.join(location.server, 'index.js'), ['dist:server']);
})

gulp.task('dist:js', () => {
    gulp.src(path.join(location.public, '/src/**/*.(js|jsx)'))
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(path.join(location.public, 'dist')))
})

gulp.task('watch:js', () => {
    gulp.watch(path.join(location.public, '/src/**/*.(js|jsx)'), ['dist:js'])
})

gulp.task('dist', ['dist:js', 'dist:server']);
gulp.task('watch', ['watch:js', 'watch:server']);

gulp.task('default', ['dist']);
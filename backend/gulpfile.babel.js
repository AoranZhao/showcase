import gulp from 'gulp';
import babel from 'gulp-babel';
// import concat from 'gulp-concat';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import path from 'path';

let location = {
    client: 'client',
    server: 'server',
    dist: 'dist'
}

gulp.task('dist:server', () => {
    gulp.src(path.join(location.server, '**/*.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(path.join(location.dist, location.server)))
})

gulp.task('dist', ['dist:server']);

gulp.task('watch', () => {
    gulp.watch(path.join(location.server, '**/*.js'), ['dist:server'])
})

gulp.task('default', ['dist'])

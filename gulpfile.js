const
  gulp = require('gulp'),
  browserSync = require("browser-sync");


gulp.task(
    'serve',
    () => {
        browserSync.init({
            server: ".",
            // Don't sync browsers.
            ghostMode: false
        });
    }
);

gulp.task(
    'watch',
    () =>{
      gulp
        .watch(['./*.html'])
        .on('change', () => browserSync.reload());

      gulp
        .watch(['./*.css'])
        .on('change', () => browserSync.reload({stream: true}))
      }
);

gulp.task('default', ['watch', 'serve']);

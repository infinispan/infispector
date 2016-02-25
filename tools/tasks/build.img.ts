import {join} from 'path';
import {PATH} from '../config';

export = function buildImg(gulp, plugins, option) {
  return function () {
    return gulp.src(PATH.src.img)
      .pipe(gulp.dest(join(PATH.dest.dev.img)));
  };
}

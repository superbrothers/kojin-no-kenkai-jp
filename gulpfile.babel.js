"use strict";

import gulp from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import del from "del";
import { stream as wiredep } from "wiredep";
import browserSync from "browser-sync";
import runSequence from "run-sequence";

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task("clean", () => del([".tmp", "dist"], {dot: true}));

gulp.task("bower", () =>
    gulp.src("src/index.html")
        .pipe(wiredep({optional: "configuration", goes: "here"}))
        .pipe(gulp.dest("./src"))
);

gulp.task("copy", () =>
    gulp.src(["src/CNAME"])
        .pipe(gulp.dest("./dist"))
);

gulp.task("styles", () => {
    const AUTOPREFIXER_BROWSERS = [
        "ie >= 10",
        "ie_mob >= 10",
        "ff >= 30",
        "chrome >= 34",
        "safari >= 7",
        "opera >= 23",
        "ios >= 7",
        "android >= 4.4",
        "bb >= 10"
    ];

    return gulp.src(["src/assets/styles/**/*.css"])
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(".tmp/assets/styles"));
});

gulp.task("html", () =>
    gulp.src("src/**/*.html")
        .pipe($.useref({searchPath: "{.tmp,src}"}))
        .pipe($.if("*.css", $.cssnano()))
        .pipe($.if("*.html", $.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
        })))
        .pipe(gulp.dest("dist"))
);

gulp.task("serve", ["styles"], () => {
    browserSync({
        notify: false,
        server: [".tmp", "src"],
        port: 3000
    });

    gulp.watch(["src/**/*.html"], reload);
    gulp.watch(["src/assets/**/*css"], ["styles", reload]);
});

gulp.task("serve:dist", ["default"], () =>
    browserSync({
        notify: false,
        server: "dist",
        port: 3000
    })
);

gulp.task("default", ["clean"], done =>
    runSequence(["copy", "styles", "html"], done)
);

gulp.task("deploy", ["default"], () =>
    gulp.src("./dist/**/*")
        .pipe($.ghPages())
);

"use strict";

require("@babel/register");

import { src, dest, series, parallel, watch } from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import del from "del";
import browserSync from "browser-sync";
import cssnano from "cssnano";

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

export const clean = () => del([".tmp", "dist"], {dot: true});

export const copy = () => {
    return src(["src/CNAME"])
        .pipe(dest("./dist"));
};

export const styles = () => {
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

    return src(["src/assets/styles/**/*.css"])
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(dest(".tmp/assets/styles"));
};

export const html = () => {
    return src("src/**/*.html")
        .pipe($.useref({searchPath: "{.tmp,src}"}))
        .pipe($.if("*.css", $.postcss([cssnano()])))
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
        .pipe(dest("dist"));
};

export const serve = series(styles, () => {
    browserSync({
        notify: false,
        server: [".tmp", "src"],
        port: 3000
    });

    watch(["src/**/*.html"], series(reload));
    watch(["src/assets/**/*.css"], series("styles", reload));
    watch(["node_modules/@css/**/*.css"], series("styles", reload));
});

export const default_task = series(clean, copy, parallel(styles, html));

export const serve_dist = series(default_task, () => {
    browserSync({
        notify: false,
        server: "dist",
        port: 3000
    });
});

export default default_task;

import gulp from "gulp";
import minimist from "minimist";
import cleanCSS from "gulp-clean-css";
import ts from "gulp-typescript";
import terser from "gulp-terser";
const { src, dest, series, parallel, watch } = gulp;
const tsProject = ts.createProject("tsconfig.json");
// Allowed browser values
const VALID_BROWSERS = ["chrome", "firefox", "all"];
const options = minimist(process.argv.slice(2));
if (options.browser && !VALID_BROWSERS.includes(options.browser)) {
    console.error(`❌ Invalid browser: "${options.browser}". Allowed values: chrome, firefox, all`);
    process.exit(1);
}
// Select browsers
const selectedBrowsers = !options.browser || options.browser === "all"
    ? ["chrome", "firefox"]
    : [options.browser];
console.log("Building for browsers:", selectedBrowsers.join(", "));
// TypeScript Compilation
function compileTS() {
    return tsProject.src().pipe(tsProject()).pipe(dest("./common/js"));
}
// Styles Task
function styles(browser, folderName) {
    return function () {
        return src("./common/styles/**/*.css")
            .pipe(cleanCSS())
            .pipe(dest(`./${folderName}/${browser}/styles`));
    };
}
// JavaScript Minification
function bgScripts(browser, folderName) {
    return function () {
        return src("./common/js/background/**/*.js")
            .pipe(terser())
            .pipe(dest(`./${folderName}/${browser}/js/bg`));
    };
}
function contentScripts(browser, folderName) {
    return function () {
        return src("./common/js/content/**/*.js")
            .pipe(terser())
            .pipe(dest(`./${folderName}/${browser}/js/content`));
    };
}
// Copy Assets
function copyAssets(browser, folderName) {
    return function () {
        return src("./common/icons/*").pipe(dest(`./${folderName}/${browser}/icons`));
    };
}
// Copy Manifest
function manifest(browser, folderName) {
    return function () {
        return src(`./${browser}/manifest.json`).pipe(dest(`./${folderName}/${browser}/`));
    };
}
// Watch Task
function watchTask() {
    selectedBrowsers.forEach(browser => {
        watch(["./common/**/*.ts", "./common/**/*.css"], series(compileTS, styles(browser, "build"), bgScripts(browser, "build"), contentScripts(browser, "build"), copyAssets(browser, "build"), manifest(browser, "build")));
    });
}
// Generate tasks for all selected browsers
const tasks = selectedBrowsers.flatMap(browser => [
    compileTS,
    styles(browser, "dist"),
    bgScripts(browser, "dist"),
    contentScripts(browser, "dist"),
    copyAssets(browser, "dist"),
    manifest(browser, "dist"),
]);
const build = series(compileTS, parallel(...tasks));
const watchFiles = watchTask;
gulp.task("build", build);
gulp.task("default", build);
gulp.task("watch", watchFiles);

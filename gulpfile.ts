import gulp from "gulp";
import minimist from "minimist";
import ts from "gulp-typescript";
import esbuild from "gulp-esbuild";
import type { TaskFunction, TaskFunctionCallback } from "gulp";
import type { Stream } from "stream";
import path from "path";

const { src, dest, series, parallel, watch } = gulp;

// Allowed browser values
const VALID_BROWSERS = ["chrome", "firefox", "all"];
const options = minimist(process.argv.slice(2), {
  default: {
    minify: true,
    sourcemap: false,
  },
});

console.log(options.minify);
console.log(options.sourcemap);
console.log(typeof options.minify);

if (options.browser && !VALID_BROWSERS.includes(options.browser)) {
  console.error(
    `❌ Invalid browser: "${options.browser}". Allowed values: chrome, firefox, all`
  );
  process.exit(1);
}

// Select browsers
const selectedBrowsers =
  !options.browser || options.browser === "all"
    ? ["chrome"]
    : [options.browser];

console.log("Building for browsers:", selectedBrowsers.join(", "));

// Define TypeScript projects once
const tsProject = ts.createProject("tsconfig.json");

// Styles Task
function styles(browser: string, folderName: string) {
  return function () {
    return src("./common/styles/**/*.css") // ✅ includes all CSS files recursively
      .pipe(dest(`./${folderName}/${browser}/styles`));
  };
}

// TypeScript Compilation Task
function compileTS() {
  console.log("Compiling TypeScript...");
  const tsProject = ts.createProject("tsconfig.json"); // New instance
  return src(["./chrome/**/*.ts", "./firefox/**/*.ts", "./common/**/*.ts"]) // Only include required folders
    .pipe(tsProject()) // Compile TS files
    .on("error", (err) => console.error(err.message)) // Handle errors gracefully
    .resume(); // Prevent writing files to dist/
}

// JavaScript Minification
function bgScripts(browser: string, folderName: string) {
  return bundleScript(
    "./common/js/background/serviceWorkerv1.ts",
    `./${folderName}/${browser}/js`,
    "background_bundle.min.js"
  );
}

function contentScripts(browser: string, folderName: string) {
  return bundleScript(
    "./common/js/content/contentScriptv1.ts",
    `./${folderName}/${browser}/js`,
    "content_bundle.min.js"
  );
}

// Copy Assets
function copyAssets(browser: string, folderName: string) {
  return function () {
    const destinationPath = path.join(__dirname, folderName, browser, "icons");
    console.log("Copying images to:", destinationPath); // To verify paths
    return src("./common/icons/**/*", { encoding: false }) // Ensure encoding is null for binary files
      .pipe(dest(destinationPath));
  };
}

// Copy Manifest
function manifest(browser: string, folderName: string) {
  return function () {
    return src(`./${browser}/manifest.json`).pipe(
      dest(`./${folderName}/${browser}/`)
    );
  };
}

function withErrorHandling(
  taskFn: TaskFunction,
  taskName: string
): TaskFunction {
  return function wrappedTask(cb: TaskFunctionCallback) {
    try {
      const result = taskFn(cb);

      // Only attach error handler if result is a Stream
      if (result && typeof (result as Stream).on === "function") {
        (result as Stream).on("error", handleError(taskName));
      }

      return result;
    } catch (err) {
      handleError(taskName)(err);
      cb(); // continue watch
    }
  };
}

// TypeScript type checking only
function typeCheck(): NodeJS.ReadWriteStream {
  const tsProject = ts.createProject("tsconfig.json");
  return tsProject
    .src()
    .pipe(tsProject())
    .on("error", function (this: NodeJS.ReadableStream, err: Error) {
      // Enhanced error logging
      console.error("\n❌ TypeScript Compilation Error:");
      console.error("Message:", err.message);
      this.emit("end");
    });
}

function logTask(name: string) {
  return function (done: TaskFunctionCallback) {
    console.log(`Starting task: ${name}`);
    done();
  };
}

function watchTask() {
  // Run initial type check
  typeCheck();

  selectedBrowsers.forEach((browser) => {
    watch(
      [
        "./common/**/*",
        "./chrome/**/*.ts",
        "./firefox/**/*.ts",
        "./chrome/manifest.json",
        "./firefox/manifest.json",
        "./common/icons/*",
      ],
      { ignoreInitial: false }, // Process files on startup
      function watcher(cb) {
        console.log("File change detected, rebuilding...");
        series(
          logTask("typeCheck"),
          typeCheck,
          parallel(
            logTask("styles"),
            styles(browser, "dist"),
            logTask("utils"),
            logTask("bgScripts"),
            withErrorHandling(bgScripts(browser, "dist"), "bgScripts"),
            logTask("contentScripts"),
            withErrorHandling(
              contentScripts(browser, "dist"),
              "contentScripts"
            ),
            logTask("copyAssets"),
            withErrorHandling(copyAssets(browser, "dist"), "copyAssets"),
            logTask("manifest"),
            withErrorHandling(manifest(browser, "dist"), "manifest")
          )
        )(cb);
      }
    ).on("error", (err: Error) => {
      console.error("\n⚠️ Watch Process Error:");
      console.error("Message:", err.message);
    });
  });
}

function bundleScript(
  entryPath: string,
  outputDir: string,
  outFileName: string
) {
  return function () {
    return src(entryPath, { allowEmpty: false })
      .on("error", (err) => {
        console.error(`  Error: ${err.message}`);
        process.exit(1);
      })
      .pipe(
        esbuild({
          entryNames: outFileName.replace(".js", ""),
          outfile: outFileName,
          bundle: true,
          minify: options.minify !== "false",
          sourcemap: options.sourcemap === "true" ? "linked" : false,
          target: "es2015",
          platform: "browser",
          format: "iife",
          loader: { ".ts": "ts" },
          logLevel: "info",
        }).on("error", (err) => {
          console.error(`  Error: ${err.message}`);
          process.exit(1);
        })
      )
      .pipe(dest(outputDir))
      .on("end", () => {
        console.log(`✓ [BundleScript] Success: ${outputDir}/${outFileName}\n`);
      })
      .on("error", (err) => {
        console.error(`  Error: ${err.message}`);
        process.exit(1);
      });
  };
}

function handleError(taskName: string) {
  return function (err: any) {
    console.error(`❌ Error in ${taskName}:`, err.message || err);
  };
}

// Generate tasks for all selected browsers
const tasks = selectedBrowsers.flatMap((browser) => [
  styles(browser, "dist"),
  bgScripts(browser, "dist"),
  contentScripts(browser, "dist"),
  copyAssets(browser, "dist"),
  manifest(browser, "dist"),
]);

const build = parallel(compileTS, ...tasks);

const watchFiles = watchTask;

gulp.task("build", build);
gulp.task("default", build);
gulp.task("watch", watchFiles);

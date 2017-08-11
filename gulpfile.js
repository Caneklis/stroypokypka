"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var del = require("del");
var run = require("run-sequence");
var server = require("browser-sync").create();

gulp.task("style", function() {
  gulp.src("src/less/style.less")
  .pipe(plumber())
  .pipe(less())
  .pipe(postcss([
    autoprefixer({browsers: [
      "last 1 version",
      "last 2 Chrome versions",
      "last 2 Firefox versions",
      "last 2 Opera versions",
      "last 2 Edge versions"
    ]}),
    mqpacker({
      sort: true
    })
  ]))
  .pipe(gulp.dest("src/css"))
  .pipe(minify())
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("src/css"))
  .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("src/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("src/img"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src/js/**",
    "src/css/**",
    "src/*.html"
    ], {
    base: "src"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("build", function(fn) {
  run("clean", "copy", "style", "images", "symbols", fn)
});

gulp.task("serve", function() {
  server.init({
    server: "src",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("src/less/**/*.less", ["style"]);
  gulp.watch("src/*.html").on("change", server.reload);
});
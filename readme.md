# Gulp TypeScript Extension Builder

A Gulp-based build system for compiling and bundling TypeScript-based Chrome.  
It supports conditional minification, watches for changes, and handles multiple browsers.

## 📦 Features

- Compile TypeScript using `gulp-typescript`
- Minify JavaScript with `terser`
- Minify CSS with `gulp-clean-css`
- Copy assets (e.g., icons)
- Support for Chrome and Firefox extensions
- Conditional minification using CLI flag `--minify=false`
- File watching for rapid development

## 🚀 How to Run

### 🔧 Install Dependencies
```bash
npm install
```

### 🔧 Build the Extension
- With Minification
```bash
npm run build
```
- Without Minification
```bash
npm run build:withoutminified
```

### 👀 Watch for Changes
- With Minification
```bash
npm run watch
```
- Without Minification
```bash
npm run watch:withoutminified
```

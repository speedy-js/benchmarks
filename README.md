# benchmarks

# Usage

```
pnpm i
pnpm bench
```

The benchmark result will be generated in `./benchmark-runner/dist``

## How to add a benchmark project

1. Copy a exsited project in projects
2. Rename the folder and `package.json#name`
3. Edit `task.config.js`
4. make sure `package.json#scripts` contains

```
"build:speedy": "NODE_ENV=production speedy build -c speedy.config.ts",
"build:webpack": "NODE_ENV=production webpack",
"build:esbuild": "xxx", // auto-generated
```

# Todos

- [x] generate benchmark results to disk
  - [ ] with corresponding `Task` information
- [ ] github-action bot
- [ ] webside for benchmarks output
- [ ] more benchmark cases

## 

# bundle lodash-es output

```
Running "lib_esnext_esm_lodash-es" suite...
Progress: 100%

  build:speedy:
    0.3 ops/s, ±3.44%   | slowest, 88.46% slower

  build:webpack:
    0.5 ops/s, ±2.48%   | 80.77% slower

  build:esbuild:
    2.6 ops/s, ±2.62%   | fastest

  build:parcel:
    0.6 ops/s, ±2.57%   | 76.92% slower

Finished 4 cases!
  Fastest: build:esbuild
  Slowest: build:speedy
```

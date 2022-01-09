# benchmarks

# Usage

```
pnpm i
pnpm bench
```

# Todos

- [x] generate benchmark results to disk
- [ ] github-action bot
- [ ] webside for benchmarks output
- [ ] more benchmark cases

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

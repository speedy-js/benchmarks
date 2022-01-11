export default {
    "mode": "production",
    "input": {
        "main": "/Users/bytedance/Documents/gitcodes/benchmarks/fixtures/lodash-es/lodash.js"
    },
    "sourceMap": "external",
    "minify": "esbuild",
    "output": {
        "path": "/Users/bytedance/Documents/gitcodes/benchmarks/projects/lib_to-esm_to-es6_minimized_sourcemap_lodash-es/dist",
        "filename": "speedy",
        "format": "esm"
    },
    "target": "es6"
}
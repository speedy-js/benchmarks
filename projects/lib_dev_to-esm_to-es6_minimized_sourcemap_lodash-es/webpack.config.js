module.exports = {
    "target": "es6",
    "mode": "development",
    "entry": "/Users/bytedance/Documents/gitcodes/benchmarks/fixtures/lodash-es/lodash.js",
    "devtool": "source-map",
    "output": {
        "path": "/Users/bytedance/Documents/gitcodes/benchmarks/projects/lib_dev_to-esm_to-es6_minimized_sourcemap_lodash-es/dist",
        "filename": "webpack.js",
        "libraryTarget": "module",
        "chunkFormat": "module"
    },
    "experiments": {
        "outputModule": true
    },
    "optimization": {
        "minimize": true
    }
}
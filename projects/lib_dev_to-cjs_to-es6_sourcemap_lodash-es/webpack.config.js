module.exports = {
    "target": "es6",
    "mode": "development",
    "entry": "/Users/bytedance/Documents/gitcodes/benchmarks/fixtures/lodash-es/lodash.js",
    "devtool": "source-map",
    "output": {
        "path": "/Users/bytedance/Documents/gitcodes/benchmarks/projects/lib_dev_to-cjs_to-es6_sourcemap_lodash-es/dist",
        "filename": "webpack.js",
        "libraryTarget": "commonjs2",
        "chunkFormat": "commonjs"
    },
    "experiments": {
        "outputModule": true
    },
    "optimization": {
        "minimize": false
    }
}
module.exports = {
    "target": "es5",
    "mode": "production",
    "entry": "/Users/bytedance/Documents/gitcodes/benchmarks/fixtures/lodash-es/lodash.js",
    "devtool": "source-map",
    "output": {
        "path": "/Users/bytedance/Documents/gitcodes/benchmarks/projects/lib_to-cjs_to-es5_sourcemap_lodash-es/dist",
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
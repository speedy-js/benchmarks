module.exports = {
    "mode": "production",
    "entry": "/Users/bytedance/Documents/gitcodes/benchmarks/fixtures/lodash-es/lodash.js",
    "devtool": "source-map",
    "output": {
        "path": "/Users/bytedance/Documents/gitcodes/benchmarks/projects/lib_esnext_cjs_minimize_lodash-es/dist",
        "filename": "webpack.js",
        "library": {
            "type": "commonjs2"
        }
    },
    "optimization": {
        "minimize": true
    }
}
window.BENCHMARK_DATA = {
  "lastUpdate": 1644507078618,
  "repoUrl": "https://github.com/speedy-js/benchmarks",
  "entries": {
    "Benchmark.js Benchmark": [
      {
        "commit": {
          "author": {
            "email": "i.heyunfei@gmail.com",
            "name": "Yunfei He",
            "username": "iheyunfei"
          },
          "committer": {
            "email": "i.heyunfei@gmail.com",
            "name": "Yunfei He",
            "username": "iheyunfei"
          },
          "distinct": true,
          "id": "0aff75f7f04e84cecc06529a5da3591ca5045786",
          "message": "test",
          "timestamp": "2022-02-10T23:29:29+08:00",
          "tree_id": "7d82dcb09c4587a14e8ca86e7e54cc7082d7559e",
          "url": "https://github.com/speedy-js/benchmarks/commit/0aff75f7f04e84cecc06529a5da3591ca5045786"
        },
        "date": 1644507077457,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "pnpm 'bench:speedy'",
            "value": 5.34458992428,
            "unit": "s/ops",
            "extra": "{\n    \"type\": \"build\",\n    \"env\": {\n        \"NODE_ENV\": \"development\"\n    },\n    \"mode\": \"development\",\n    \"minimize\": false,\n    \"sourcemap\": true,\n    \"target\": \"es5\",\n    \"format\": \"cjs\"\n}"
          },
          {
            "name": "pnpm 'bench:speedy'",
            "value": 3.75998090774,
            "unit": "s/ops",
            "extra": "{\n    \"type\": \"build\",\n    \"env\": {\n        \"NODE_ENV\": \"development\"\n    },\n    \"mode\": \"development\",\n    \"minimize\": false,\n    \"sourcemap\": true,\n    \"target\": \"es6\",\n    \"format\": \"cjs\"\n}"
          }
        ]
      }
    ]
  }
}
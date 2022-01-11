import path from "path";
import { defineConfig } from "benchmark-runner";

export default defineConfig({
  type: "build",
  env: {
    NODE_ENV: "development",
  },
  entry: path.resolve(__dirname, "../../fixtures/lodash-es/lodash.js"),
  outputDir: path.resolve(__dirname, "dist"),
  mode: 'development',
  minimize: false,
  sourcemap: true,
  target: "es6",
  format: "cjs",
});

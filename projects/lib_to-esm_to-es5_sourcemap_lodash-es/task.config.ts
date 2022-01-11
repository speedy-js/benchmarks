import path from "path";
import { defineConfig } from "benchmark-runner";

export default defineConfig({
  type: "build",
  env: {
    NODE_ENV: "production",
  },
  entry: path.resolve(__dirname, "../../fixtures/lodash-es/lodash.js"),
  outputDir: path.resolve(__dirname, "dist"),
  mode: "production",
  minimize: false,
  sourcemap: true,
  target: "es5",
  format: "esm",
});

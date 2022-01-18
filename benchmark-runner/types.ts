interface BuildTask {
  type: "build";
  env: { [name: string]: string };
  entry: string;
  outputDir: string;
  mode: "production" | "development";
  minimize: boolean;
  sourcemap: boolean;
  target: "es6" | "es5";
  format: "cjs" | "esm";
}

export type Task = BuildTask;
import { getPnpmWorkspaces } from "workspace-tools";
import path from "path";
import fs from "fs-extra";
import spawn from "cross-spawn";
import type { Configuration as WebpackConfiguration } from "webpack";
import { defineConfig } from "@speedy-js/speedy-core";

export interface BuildTask {
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

export function genTaskConfigOfWebpack(task: Task): WebpackConfiguration {
  if (task.type === "build") {
    // TODO: transform target setting
    task.target;
    return {
      target: ({ esnext: "es2021", es5: "es5", es6: "es6" } as const)[
        task.target
      ],
      mode: task.mode,
      entry: task.entry,
      devtool: task.sourcemap ? "source-map" : false,
      output: {
        path: task.outputDir,
        filename: "webpack.js",
        libraryTarget: ({ cjs: "commonjs2", esm: "module" } as const)[
          task.format
        ],
        chunkFormat: ({ cjs: "commonjs", esm: "module" } as const)[task.format],
      },
      experiments: { outputModule: true },
      optimization: {
        minimize: task.minimize,
      },
    };
  }
  return {};
}
export function genTaskConfigOfParcel(task: Task) {}

export function genTaskConfigOfSpeedy(task: Task): ReturnType<typeof defineConfig> {
  // TODO: transform target setting

  return defineConfig({
    mode: task.mode,
    input: {
      main: task.entry,
    },
    sourceMap: task.sourcemap ? "external" : false,
    minify: task.minimize ? "esbuild" : false,
    output: {
      path: task.outputDir,
      filename: "speedy",
      format: ({ cjs: "cjs", esm: "esm" } as const)[task.format],
    },
    target: ({ esnext: "es6", es5: "es5", es6: "es6" } as const)[task.target],
  });
}
export function genTaskConfigOfEsbuild(task: Task) {
  // TODO: transform target setting

  return [
    "esbuild",
    task.entry,
    task.sourcemap ? "--sourcemap" : "",
    task.minimize ? "--minify" : "",
    `--format=${({ cjs: "cjs", esm: "esm" } as const)[task.format]}`,
    `--target=${
      ({ esnext: "es6", es5: "es5", es6: "es6" } as const)[task.target]
    }`,
    "--bundle",
    `--outfile=${path.join(task.outputDir, "esbuild.js")}`,
  ].join(" ");
}


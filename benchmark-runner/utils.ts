import path from 'path';
import fs from "fs-extra";
import { getPnpmWorkspaces } from "workspace-tools";
import type { Task } from './types';
import type { Configuration as WebpackConfiguration } from "webpack";
import { defineConfig } from "@speedy-js/speedy-core";

type SpeedyConfiguration = ReturnType<typeof defineConfig>;
interface Callback {
  webpack?: (c: WebpackConfiguration) => WebpackConfiguration;
  speedy?: (c: SpeedyConfiguration) => SpeedyConfiguration;
}

export function getWorkspaces() {
  const workspaces = getPnpmWorkspaces(process.cwd());

  return workspaces.filter(
    (workspace) =>
      !workspace.name.startsWith("!") &&
      !workspace.name.includes("benchmark-runner") &&
      !workspace.name.includes("speedystack")
  );
}

export function readTaskConfig(projectPath: string): Task {
  const taskPath = path.join(projectPath, "task.config.ts");
  const task = require(taskPath).default;
  return task;
}

export function setupForTask(
  projectPath: string,
  task: Task,
  callback?: Callback
) {
  // TODO: Setup env
  task.env;

  const commandsToBench: { [script: string]: string } = {};

  const pkgJsonPath = path.join(projectPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());

  // webpack
  const webpackConfig = genTaskConfigOfWebpack(task, callback?.webpack);
  const webpackConfigPath = path.join(projectPath, "webpack.config.js");
  fs.outputFileSync(
    webpackConfigPath,
    `module.exports = ${JSON.stringify(webpackConfig, null, 4)}`
  );
  commandsToBench["bench:webpack"] = "pnpm webpack";

  // speedy
  const speedyConfig = genTaskConfigOfSpeedy(task, callback?.speedy);
  const speedyConfigPath = path.join(projectPath, "speedy.config.ts");
  fs.outputFileSync(
    speedyConfigPath,
    `export default ${JSON.stringify(speedyConfig, null, 4)}`
  );
  commandsToBench["bench:speedy"] = "speedy build -c speedy.config.ts";

  // esbuild
  if (task.target !== "es5") {
    const esbuildScriptValue = genTaskConfigOfEsbuild(task);
    commandsToBench["bench:esbuild"] = `pnpm ${esbuildScriptValue}`;
  }

  Object.assign(pkgJson.scripts, commandsToBench);

  fs.outputFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 4));

  return commandsToBench;
}

function genTaskConfigOfWebpack(
  task: Task,
  callback?: Callback['webpack']
): WebpackConfiguration {
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

function genTaskConfigOfParcel(task: Task) {}

function genTaskConfigOfSpeedy(
  task: Task,
  callback?: Callback['speedy']
): SpeedyConfiguration {
  // TODO: transform target setting
  const config = defineConfig({
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
  if (callback) {
    return callback(config);
  } else {
    return config;
  }
}

function genTaskConfigOfEsbuild(task: Task) {
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
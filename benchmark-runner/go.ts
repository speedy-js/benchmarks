import b from "benny";
import { getPnpmWorkspaces } from "workspace-tools";
import path from "path";
import fs from "fs";
import spawn from "cross-spawn";
import type { Configuration as WebpackConfiguration } from "webpack";
import { defineConfig } from "@speedy-js/speedy-core";

function setupForTask(proejctPath: string, task: Task) {
  const pkgJsonPath = path.join(proejctPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());

  const webpackConfig = genTaskConfigOfWebpack(task);
  const webpackConfigPath = path.join(proejctPath, "webpack.config.js");
  fs.writeFileSync(
    webpackConfigPath,
    `module.exports = ${JSON.stringify(webpackConfig, null, 4)}`
  );

  const speedyConfig = genTaskConfigOfSpeedy(task);
  const speedyConfigPath = path.join(proejctPath, "speedy.config.ts");
  fs.writeFileSync(
    speedyConfigPath,
    `export default ${JSON.stringify(speedyConfig, null, 4)}`
  );

  const esbuildScrptValue = genTaskConfigOfEsbuild(task);
  pkgJson.scripts["build:esbuild"] = `pnpm ${esbuildScrptValue}`;

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 4));
}

function readTaskConfig(proejctPath: string): Task {
  const taskPath = path.join(proejctPath, "task.config.ts");
  const task = require(taskPath).default;
  return task;
}

async function main() {
  const workspaces = getPnpmWorkspaces(process.cwd());
  console.log("workspaces", workspaces);
  for (const workspace of workspaces) {
    console.log(`read task config of ${workspace.name}`);
    const task = readTaskConfig(workspace.path);
    setupForTask(workspace.path, task);

    console.log(`Add suite for ${workspace.name}`);
    let _benchmarkResultPath = path.join(
      __dirname,
      `dist/${workspace.name}.json`
    );
    const _summary = await b.suite(
      workspace.name,
      ...Object.keys(workspace.packageJson.scripts ?? {})
        .filter((script) => script.startsWith("build"))
        .map((script) => {
          console.log(`Add task for pnpm run ${script}`);
          return b.add(script, () => {
            // const now = Date.now();
            // TODO: Esbuild is too fast for proper analysis.
            // Each benchmark for esbuild took 700ms and the part of esbuild only took 40ms, the rest was overhead of node.
            spawn.sync("pnpm", ["run", script], {
              cwd: path.dirname(workspace.packageJson.packageJsonPath),
            });
            // console.log(Date.now() - now);
          });
        }),
      b.cycle(),
      b.complete(),
      b.save({
        folder: "dist",
        file: workspace.name,
        // version: "1.0.0",
        details: true,
      }),
      b.save({ folder: "dist", file: workspace.name, format: "chart.html" })
    );
  }
}

main();

export interface BuildTask {
  type: "build";
  env: { [name: string]: string };
  entry: string;
  outputDir: string;
  mode: "production" | "development";
  minimize: boolean;
  sourcemap: boolean;
  target: "esnext";
  format: "cjs";
}

export type Task = BuildTask;

function genTaskConfigOfWebpack(task: Task): WebpackConfiguration {
  if (task.type === "build") {
    return {
      mode: task.mode,
      entry: task.entry,
      devtool: task.sourcemap ? "source-map" : false,
      output: {
        path: task.outputDir,
        filename: "webpack.js",
        library: {
          type: ({ cjs: "commonjs2" } as const)[task.format],
        },
      },
      optimization: {
        minimize: task.minimize,
      },
    };
  }
  return {};
}
function genTaskConfigOfParcel(task: Task) {}
function genTaskConfigOfSpeedy(task: Task): ReturnType<typeof defineConfig> {
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
      format: ({ cjs: "cjs" } as const)[task.format],
    },
  });
}
function genTaskConfigOfEsbuild(task: Task) {
  return [
    "esbuild",
    task.entry,
    task.sourcemap ? "--sourcemap" : "",
    task.minimize ? "--minify" : "",
    "--bundle",
    `--outfile=${path.join(task.outputDir, "esbuild.js")}`,
  ].join(" ");
}

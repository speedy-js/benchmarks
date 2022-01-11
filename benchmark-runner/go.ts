import b from "benny";
import { getPnpmWorkspaces } from "workspace-tools";
import path from "path";
import fs from "fs";
import spawn from "cross-spawn";
import type { Configuration as WebpackConfiguration } from "webpack";
import { defineConfig } from "@speedy-js/speedy-core";

function setupForTask(proejctPath: string, task: Task) {
  // TODO: Setup env
  task.env;

  const commandsToBench: { [script: string]: string } = {};

  const pkgJsonPath = path.join(proejctPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());

  const webpackConfig = genTaskConfigOfWebpack(task);
  const webpackConfigPath = path.join(proejctPath, "webpack.config.js");
  fs.writeFileSync(
    webpackConfigPath,
    `module.exports = ${JSON.stringify(webpackConfig, null, 4)}`
  );
  commandsToBench["bench:webpack"] = "pnpm webpack";

  const speedyConfig = genTaskConfigOfSpeedy(task);
  const speedyConfigPath = path.join(proejctPath, "speedy.config.ts");
  fs.writeFileSync(
    speedyConfigPath,
    `export default ${JSON.stringify(speedyConfig, null, 4)}`
  );
  commandsToBench["bench:speedy"] = "speedy build -c speedy.config.ts";

  if (task.target === "es5") {
    const esbuildScrptValue = genTaskConfigOfEsbuild(task);
    commandsToBench["build:esbuild"] = `pnpm ${esbuildScrptValue}`;
  }

  Object.assign(pkgJson.scripts, commandsToBench);

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 4));

  return commandsToBench;
}

function readTaskConfig(proejctPath: string): Task {
  const taskPath = path.join(proejctPath, "task.config.ts");
  const task = require(taskPath).default;
  return task;
}

async function main() {
  const workspaces = getPnpmWorkspaces(process.cwd());

  console.log(
    "included",
    workspaces
      .filter((workspace) => !workspace.name.startsWith("!"))
      .map((w) => w.name)
  );
  for (const workspace of workspaces.filter(
    (workspace) => !workspace.name.startsWith("!")
  )) {
    const task = readTaskConfig(workspace.path);
    const commandsToBench = setupForTask(workspace.path, task);

    let _benchmarkResultPath = path.join(
      __dirname,
      `dist/${workspace.name}.json`
    );
    const _summary = await b.suite(
      workspace.name,
      ...Object.keys(workspace.packageJson.scripts ?? {})
        .filter((script) => script in commandsToBench)
        .map((script) => {
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
  target: "es6" | "es5";
  format: "cjs" | "esm";
}

export type Task = BuildTask;

function genTaskConfigOfWebpack(task: Task): WebpackConfiguration {
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

function genTaskConfigOfSpeedy(task: Task): ReturnType<typeof defineConfig> {
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
function genTaskConfigOfEsbuild(task: Task) {
  // TODO: transform target setting

  return [
    "esbuild",
    task.entry,
    task.sourcemap ? "--sourcemap" : "",
    task.minimize ? "--minify" : "",
    `--format=${({ cjs: "cjs", esm: "esm" } as const)[task.format]}`,
    `--target=es2020=${
      ({ esnext: "es6", es5: "es5", es6: "es6" } as const)[task.target]
    }`,
    "--bundle",
    `--outfile=${path.join(task.outputDir, "esbuild.js")}`,
  ].join(" ");
}

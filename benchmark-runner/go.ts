import { getPnpmWorkspaces } from "workspace-tools";
import path from "path";
import fs from "fs-extra";
import spawn from "cross-spawn";
import type { Configuration as WebpackConfiguration } from "webpack";
import { defineConfig } from "@speedy-js/speedy-core";
import _ from "lodash";

function setupForTask(proejctPath: string, task: Task) {
  // TODO: Setup env
  task.env;

  const commandsToBench: { [script: string]: string } = {};

  const pkgJsonPath = path.join(proejctPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());

  const webpackConfig = genTaskConfigOfWebpack(task);
  const webpackConfigPath = path.join(proejctPath, "webpack.config.js");
  fs.outputFileSync(
    webpackConfigPath,
    `module.exports = ${JSON.stringify(webpackConfig, null, 4)}`
  );
  commandsToBench["bench:webpack"] = "pnpm webpack";

  const speedyConfig = genTaskConfigOfSpeedy(task);
  const speedyConfigPath = path.join(proejctPath, "speedy.config.ts");
  fs.outputFileSync(
    speedyConfigPath,
    `export default ${JSON.stringify(speedyConfig, null, 4)}`
  );
  commandsToBench["bench:speedy"] = "speedy build -c speedy.config.ts";

  if (task.target !== "es5") {
    const esbuildScrptValue = genTaskConfigOfEsbuild(task);
    commandsToBench["bench:esbuild"] = `pnpm ${esbuildScrptValue}`;
  }

  Object.assign(pkgJson.scripts, commandsToBench);

  fs.outputFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 4));

  return commandsToBench;
}

function readTaskConfig(proejctPath: string): Task {
  const taskPath = path.join(proejctPath, "task.config.ts");
  const task = require(taskPath).default;
  return task;
}

async function main() {
  const workspaces = getPnpmWorkspaces(process.cwd());

  const included = workspaces.filter(
    (workspace) =>
      !workspace.name.startsWith("!") &&
      !workspace.name.includes("benchmark-runner") &&
      !workspace.name.includes("speedystack")
  );
  console.log(
    "included",
    included.map((w) => w.name)
  );
  for (const workspace of included) {
    const task = readTaskConfig(workspace.path);
    const commandsToBench = setupForTask(workspace.path, task);

    const benchmarkResultPath = path.join(
      __dirname,
      `dist/${workspace.name}.json`
    );
    // hyperfine will check if the file exsits.
    fs.outputFileSync(benchmarkResultPath, "{}");
    fs.outputFileSync(path.join(__dirname, `dist/${workspace.name}.md`), "");
    console.info(`\nstart benchmark of [${workspace.name}]\n`);
    await new Promise<void>((rsl) => {
      const result = spawn.spawn(
        "hyperfine",
        [
          // "--show-output",
          "--warmup",
          "1",
          `--export-json`,
          benchmarkResultPath,
          `--export-markdown`,
          path.join(__dirname, `dist/${workspace.name}.md`),
          "--runs",
          "2",
          ...Object.keys(commandsToBench).map((script) => `pnpm '${script}'`),
        ],
        {
          cwd: path.dirname(workspace.packageJson.packageJsonPath),
        }
      );
      result.stdout.pipe(process.stdout);
      result.stderr.pipe(process.stderr);
      result.on("close", rsl);
    });

    // analyze(benchmarkResultPath);
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
    `--target=${
      ({ esnext: "es6", es5: "es5", es6: "es6" } as const)[task.target]
    }`,
    "--bundle",
    `--outfile=${path.join(task.outputDir, "esbuild.js")}`,
  ].join(" ");
}

export interface HyperfineResult {
  command: string;
  mean: number;
  stddev: number;
  median: number;
  user: number;
  system: number;
  min: number;
  max: number;
  times: number[];
  exit_codes: number[];
}

export interface HyperfineJSON {
  results: HyperfineResult[];
}

function analyze(resultPaths: string[]) {
  const benchInfo = resultPaths.map((p) => readHyperfineJSON(p));
  // let fastest = _.maxBy(benchInfo, c => c.results)
  // let slowest =
  // console.log(`fastest: ${}`)
  // console.log(`slowest: ${}`)
}

function readHyperfineJSON(filePath: string): HyperfineJSON {
  return JSON.parse(fs.readFileSync(filePath).toString());
}

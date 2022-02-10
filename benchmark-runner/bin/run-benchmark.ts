import { getPnpmWorkspaces } from "workspace-tools";
import path from "path";
import fs from "fs-extra";
import spawn from "cross-spawn";
import _ from "lodash";
import { BenchmarkSuite, genMarkdownReport } from "../analyze";
import { genTaskConfigOfEsbuild, genTaskConfigOfSpeedy, genTaskConfigOfWebpack, Task } from "../src/task";
import { genBenchmarkActionData } from "../src/benchmark-action-adapter";

function setupForTask(proejctPath: string, task: Task) {
  // TODO: Setup env
  task.env;

  const commandsToBench: { [script: string]: string } = {};

  const pkgJsonPath = path.join(proejctPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());

  // const webpackConfig = genTaskConfigOfWebpack(task);
  // const webpackConfigPath = path.join(proejctPath, "webpack.config.js");
  // fs.outputFileSync(
  //   webpackConfigPath,
  //   `module.exports = ${JSON.stringify(webpackConfig, null, 4)}`
  // );
  // commandsToBench["bench:webpack"] = "pnpm webpack";

  const speedyConfig = genTaskConfigOfSpeedy(task);
  const speedyConfigPath = path.join(proejctPath, "speedy.config.ts");
  fs.outputFileSync(
    speedyConfigPath,
    `export default ${JSON.stringify(speedyConfig, null, 4)}`
  );
  commandsToBench["bench:speedy"] = "speedy build -c speedy.config.ts";

  // if (task.target !== "es5") {
  //   const esbuildScrptValue = genTaskConfigOfEsbuild(task);
  //   commandsToBench["bench:esbuild"] = `pnpm ${esbuildScrptValue}`;
  // }

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
  ).slice(0, 2);
  console.log(
    "included",
    included.map((w) => w.name)
  );
  const suiteToBeAnalyzed: BenchmarkSuite[] = [];
  for (const workspace of included) {
    const task = readTaskConfig(workspace.path);
    const commandsToBench = setupForTask(workspace.path, task);

    const benchmarkResultPath = path.join(
      __dirname,
      `dist/${workspace.name}.json`
    );
    
    suiteToBeAnalyzed.push({
      taskConfig: task,
      resultPath: benchmarkResultPath,
      pkgInfo: workspace.packageJson,
    });

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
  }
  genBenchmarkActionData(suiteToBeAnalyzed)
  // outputMarkdownReport(suiteToBeAnalyzed);
}

main();
function outputMarkdownReport(suites: BenchmarkSuite[]) {
  const mdReport = genMarkdownReport(suites);
  fs.outputFileSync(path.join(__dirname, "./dist/report.md"), mdReport);
}

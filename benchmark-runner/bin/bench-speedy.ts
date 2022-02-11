import path from "path";
import fs from "fs-extra";
import spawn from "cross-spawn";
import _ from "lodash";
import { BenchmarkSuite } from "../analyze";
import { genTaskConfigOfSpeedy, Task } from "../src/task";
import { genBenchmarkActionData } from "../src/benchmark-action-adapter";
import { getIncludedWorkspace } from "../src/helper";

function setupForTask(proejctPath: string, task: Task) {
  // TODO: Setup env
  task.env;

  const commandsToBench: { [script: string]: string } = {};

  const pkgJsonPath = path.join(proejctPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());

  const speedyConfig = genTaskConfigOfSpeedy(task);
  const speedyConfigPath = path.join(proejctPath, "speedy.config.ts");
  fs.outputFileSync(
    speedyConfigPath,
    `export default ${JSON.stringify(speedyConfig, null, 4)}`
  );
  commandsToBench["bench:speedy"] = "speedy build -c speedy.config.ts";

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
  const includedWorkspaces = getIncludedWorkspace();
  const suiteToBeAnalyzed: BenchmarkSuite[] = [];
  for (const workspace of includedWorkspaces) {
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
          "--runs",
          "4",
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
  genBenchmarkActionData(suiteToBeAnalyzed);
}

main();

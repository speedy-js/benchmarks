import path from "path";
import fs from "fs-extra";
import spawn from "cross-spawn";
import _ from "lodash";
import { BenchmarkSuite, genMarkdownReport } from "./analyze";
import { getWorkspaces, readTaskConfig, setupForTask } from "./utils";

async function main() {
  const included = getWorkspaces();
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

  outputMarkdownReport(suiteToBeAnalyzed);
}

main();

function outputMarkdownReport(suites: BenchmarkSuite[]) {
  const mdReport = genMarkdownReport(suites);
  fs.outputFileSync(path.join(__dirname, "./dist/report.md"), mdReport);
}

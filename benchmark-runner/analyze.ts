import { PackageInfo } from "workspace-tools";
import { Task } from "./go";
import fs from "fs-extra";
import path from "path";

export interface BenchmarkSuite {
  resultPath: string;
  taskConfig: Task;
  pkgInfo: PackageInfo;
}

export interface HyperfineJSON {
  results: HyperfineResult[];
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

export function genMarkdownReport(resultPaths: BenchmarkSuite[]) {
  return BENCHMARK_REPORT.replace("__DETAILS__", resultPaths
    .sort()
    .map((s) => genMarkdownReportForSuite(s))
    .join("\n\n"));
}
const BENCHMARK_SUITE_REPORT = fs
  .readFileSync(path.join(__dirname, "./templates/benchmark-suite-report.md"))
  .toString();

  const BENCHMARK_REPORT = fs
  .readFileSync(path.join(__dirname, "./templates/benchmark-report.md"))
  .toString();

function genMarkdownReportForSuite(suite: BenchmarkSuite): string {
  return BENCHMARK_SUITE_REPORT.replace("__SUITE_NAME__", suite.pkgInfo.name)
    .replace("__TASK__CONFIG__", JSON.stringify(suite.taskConfig, null, 4))
    .replace(
      "__DETAILS__",
      fs
        .readFileSync(path.join(__dirname, `./dist/${suite.pkgInfo.name}.md`))
        .toString()
    );
}

function readHyperfineJSON(filePath: string): HyperfineJSON {
  return JSON.parse(fs.readFileSync(filePath).toString());
}

import { PackageInfo } from "workspace-tools";
import { Task } from "./go";
import fs from "fs-extra";
import path from "path";
import { sync as readPkgSync } from 'read-pkg-up';

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

function resolveVersion(pkgName: string): {pkgName: string, version: string} {
  return  {
    pkgName,
    version: readPkgSync({cwd: require.resolve(pkgName)})?.packageJson.version ?? '0.0.0'
  };
}

function versionReport() {
  const speedy = resolveVersion('@speedy-js/speedy-core');
  const esbuild = resolveVersion('esbuild');
  const webpack = resolveVersion('webpack');
  return `
|pkg|name|
|-|-|
|${speedy.pkgName}|${speedy.version}|
|${esbuild.pkgName}|${esbuild.version}|
|${webpack.pkgName}|${webpack.version}|
`
}

export function genMarkdownReport(resultPaths: BenchmarkSuite[]) {
  return BENCHMARK_REPORT.replace(
    "__VERSIONS__",
    versionReport()
  ).replace(
    "__DETAILS__",
    resultPaths
      .sort()
      .map((s) => genMarkdownReportForSuite(s))
      .join("\n\n")
  );
}
const BENCHMARK_SUITE_REPORT = fs
  .readFileSync(path.join(__dirname, "./templates/benchmark-suite-report.md"))
  .toString();

const BENCHMARK_REPORT = fs
  .readFileSync(path.join(__dirname, "./templates/benchmark-report.md"))
  .toString();

function genMarkdownReportForSuite(suite: BenchmarkSuite): string {
  const { outputDir: _, entry: __, ...taskConfig } = suite.taskConfig;
  return BENCHMARK_SUITE_REPORT.replace("__SUITE_NAME__", suite.pkgInfo.name)
    .replace("__TASK__CONFIG__", JSON.stringify(taskConfig, null, 4))
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

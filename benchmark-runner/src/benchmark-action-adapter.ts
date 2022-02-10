import fs from "fs-extra";
import path from "path";
import { BenchmarkSuite } from "../analyze";
import { readHyperfineJSON } from "./hyperfine";

// Every entry in the JSON file you provide only needs to provide name, unit, and value. You can also provide optional range (results' variance) and extra (any additional information that might be useful to your benchmark's context) properties. Like this:
export interface BenchmarkActionDataItem {
  name: string;
  unit: string;
  value: number;
  range?: string;
  extra?: string;
}

export type BenchmarkActionData = BenchmarkActionDataItem[];

export function genBenchmarkActionData(suiteToBeAnalyzed: BenchmarkSuite[]) {
  const benchmarkActionData: BenchmarkActionData = [];
  suiteToBeAnalyzed.forEach((suite) => {
    const { outputDir: _, entry: __, ...taskConfig } = suite.taskConfig;
    // benchmarkActionData.push({
    //   name: suite.pkgInfo.name,
    //   unit: "None",
    //   value: 0,
    //   extra: JSON.stringify(taskConfig, null, 4),
    // });
    const hyperfineData = readHyperfineJSON(suite.resultPath);
    benchmarkActionData.push(
      ...hyperfineData.results.map(
        (item) =>
          <BenchmarkActionDataItem>{
            name: item.command,
            unit: "s/ops",
            value: item.mean,
            extra: JSON.stringify(taskConfig, null, 4),
          }
      )
    );
  });
  
  // customBiggerIsBetter
  fs.outputFileSync(
    path.join(__dirname, "../dist/bechmark-action-otuput.txt"),
    JSON.stringify(benchmarkActionData, null, 4)
  );
  console.log('path.join(__dirname, "../dist/bechmark-action-otuput.txt")', path.join(__dirname, "../dist/bechmark-action-otuput.txt"))
}

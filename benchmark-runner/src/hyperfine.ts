import fs from "fs-extra";

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

export function readHyperfineJSON(filePath: string): HyperfineJSON {
  return JSON.parse(fs.readFileSync(filePath).toString());
}
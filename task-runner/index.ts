export interface BuildTask {
  type: 'build',
  env: {[name: string]: string},
  minimize: boolean,
  sourcemap: boolean,
  target: 'esnext',
  format: 'cjs',
}

export type Task = BuildTask

function runTaskForWebpack(task: Task) {}
function runTaskForParcel(task: Task) {}
function runTaskForSpeedy(task: Task) {}
function runTaskForEsbuild(task: Task) {}

function main() {
  let args = process.argv;
  let bundler =  process.argv[2];
  if (!bundler) {
    throw new Error(`empty bundler ${bundler}`)
  }
}

main()
import b from "benny";
import { getPnpmWorkspaces } from "workspace-tools";
import path from "path";
import spawn from "cross-spawn";

async function main() {
  let workspaces = getPnpmWorkspaces(process.cwd());
  workspaces.forEach((workspace) => {
    console.log(`Add suite for ${workspace.name}`);
    let benchmarkResultPath = path.join(__dirname, `dist/${workspace.name}.json`);
    b.suite(
      workspace.name,
      ...Object.keys(workspace.packageJson.scripts ?? {})
        .filter((script) => script.startsWith("build"))
        .map((script) => {
          console.log(`Add task for pnpm run ${script}`);
          return b.add(script, () => {
            spawn.sync("pnpm", ["run", script], {
              cwd: path.dirname(workspace.packageJson.packageJsonPath),
            });
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
  });
}

main();

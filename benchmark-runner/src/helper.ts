import { getPnpmWorkspaces } from "workspace-tools";

export function getIncludedWorkspace() {
  const included = getPnpmWorkspaces(process.cwd()).filter(
    (workspace) =>
      !workspace.name.startsWith("!") &&
      !workspace.name.includes("benchmark-runner") &&
      !workspace.name.includes("speedystack")
  );

  console.log(
    "included",
    included.map((w) => w.name)
  );

  return included;
}

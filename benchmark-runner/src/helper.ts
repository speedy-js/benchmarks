import { getPnpmWorkspaces } from "workspace-tools";

export function getIncludedWorkspace() {
  const workspaces = getPnpmWorkspaces(process.cwd());

  const included = workspaces.filter(
    (workspace) =>
      !workspace.name.startsWith("!") &&
      !workspace.name.includes("benchmark-runner") &&
      !workspace.name.includes("speedystack")
  );

  console.log(
    "included",
    included.map((w) => w.name)
  );

  return workspaces
}

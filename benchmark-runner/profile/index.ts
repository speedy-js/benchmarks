import { getWorkspaces, readTaskConfig } from "../utils";

async function run() {
  const workspaces = getWorkspaces();
  for (const workspace of workspaces) {
    const task = readTaskConfig(workspace.path);
    console.log(task)
  }
  
}

run();
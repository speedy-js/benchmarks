import * as core from "@actions/core";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"

function get_number() {
  if (process.env.GITHUB_EVENT_PATH) {
    const ev = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
    )
    const prNum = ev.pull_request.number
    return prNum;
  }
  return
}

async function post_comment(token: string, body: string, owner: string, repo: string, pullnumber: number | string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pullnumber}/comments`;
  const res = await fetch(url, {
    method: "POST", body: JSON.stringify({ body }), headers: {
      "Authorization": `token ${token}`,
    }
  })
  const resjson = await res.json();
  console.log("upload comment res -> \n", resjson);
}

async function run() {
  try {
    const token = process.env.AUTH_TOKEN
    const owner = process.env.OWNER;
    const repo = process.env.REPO;
    const benchmark_file = path.join(__dirname, "./dist/report.md");
    if (fs.existsSync(benchmark_file)) {
      const content = fs.readFileSync(benchmark_file, { encoding: "utf8" });
      const pull_number = get_number();
      if (pull_number) {
        post_comment(token!, content, owner!, repo!, pull_number);
      }
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
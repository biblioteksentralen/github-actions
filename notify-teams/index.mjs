import https from "node:https";
import * as core from "@actions/core";
import * as github from "@actions/github";

async function main() {
  const webhookUrl = core.getInput("webhooks-url");
  const title = core.getInput("title");
  const text = core.getInput("text");
  const githubToken = core.getInput("github-token");

  const octokit = github.getOctokit(githubToken);
  const { context } = github;
  console.log(`GITHUB_RUN_ATTEMPT: ${process.env.GITHUB_RUN_ATTEMPT}`);
  const { data } = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
    ...context.repo,
    run_id: context.runId,
    attempt_number: parseInt(process.env.GITHUB_RUN_ATTEMPT ?? "1"),
  });
  const job = data.jobs[0];
  console.log(job);

  const logUrl = job?.html_url;
  const postData = JSON.stringify({
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    title,
    text,
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "Vis logg",
        targets: [{ os: "default", uri: logUrl }],
      },
    ],
  });
  await sendPostRequest(webhookUrl, postData);
}

/**
 * @param {string} webhookUrl
 * @param {string} postData
 * @returns {Promise<string>}
 */
async function sendPostRequest(webhookUrl, postData) {
  // Note to future: When upgrading to Node18, we can switch from http to fetch to simplify this method.
  return new Promise((resolve, reject) => {
    const req = https.request(
      webhookUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
      (res) => {
        res.setEncoding("utf8");
        /** @type {string} */
        let responseBody = "";
        res.on("data", (data) => {
          responseBody = data;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300)
            resolve(responseBody);
          else
            reject(
              new Error(`Got ${res.statusCode} response: ${responseBody}`)
            );
        });
      }
    );
    req.on("error", (err) => {
      reject(err);
    });
    req.end(postData);
  });
}

main();

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
  const [err] = await sendPostRequest(webhookUrl, postData);
  if (err) {
    console.error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * @param {string} webhookUrl
 * @param {string} body
 * @returns {Promise<[Error|undefined, number|undefined]>}
 */
async function sendPostRequest(webhookUrl, body) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body,
  });
  return !res.ok
    ? [
        new Error(
          `Got ${res.status} response from WebHook URL: ${await res.text()}`
        ),
        undefined,
      ]
    : [undefined, res.status];
}

main();

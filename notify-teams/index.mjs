import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * @typedef {Object} CardData
 * @property {string} title
 * @property {string} text
 * @property {string|undefined} logUrl
 */

async function main() {
  const webhookUrl = core.getInput("webhooks-url");
  const title = core.getInput("title");
  const text = core.getInput("text");
  const githubToken = core.getInput("github-token");

  const job = await fetchJobData(githubToken);
  const logUrl = job?.html_url ?? undefined;

  /**
   * @type {CardData}
   */
  const cardData = { title, text, logUrl };
  const card = formatCard(cardData);
  const [err] = await sendPostRequest(webhookUrl, card);
  if (err) {
    console.error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * @param {string} githubToken
 */
async function fetchJobData(githubToken) {
  const octokit = github.getOctokit(githubToken);
  const { context } = github;
  console.log(`GITHUB_RUN_ATTEMPT: ${process.env.GITHUB_RUN_ATTEMPT}`);
  const { data } = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
    ...context.repo,
    run_id: context.runId,
    attempt_number: parseInt(process.env.GITHUB_RUN_ATTEMPT ?? "1"),
  });
  const job = data.jobs[0];
  console.debug(job);
  return job;
}

/**
 * @param {CardData} props
 * @returns {string}
 */
function formatCard(props) {
  const actions = [];
  if (props.logUrl) {
    actions.push({
      "@type": "OpenUri",
      name: "Vis logg",
      targets: [{ os: "default", uri: props.logUrl }],
    });
  }
  return JSON.stringify({
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    title: props.title,
    text: props.text,
    potentialAction: actions,
  });
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

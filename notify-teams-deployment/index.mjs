import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * @typedef {Object} Action
 * @property {string} title
 * @property {string} url
 * 
 * @typedef {Object} CardData
 * @property {string} title
 * @property {string} text
 * @property {Action[]} actions
 * @property {string} result
 */

const iconMap = Object.freeze({
  // 40px font awesome times-circle icon with color #0E700E (Good)
  success:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoBAMAAAB+0KVeAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAASUExURQAAABBwEA1wDQ5wDg5wDv///3hGqh4AAAAEdFJOUwBAv4BN7NoNAAAAAWJLR0QF+G/pxwAAAAd0SU1FB+gHDxI4G17Y/QAAAAAQY2FOdgAAArAAAAApAAABRAAAAABdNjLtAAAA2UlEQVQoz32S7RGDIAyGsXQA6DkAvToAVx1AJPvPVCAhJsr1/eU9vuTbGNLkvbloekHRxym2ACoOGOSTbsDKnT1AqFsXCQ9kFpTCNSJHvRgB3AiG+2uAVKACcWv5J53EtqAqZGxFO9VOxhTBPLWxPtwlJGNJP9d+V2kkGJuhGxEe6OhGhsXCRnruqoeNlL12u55j2LF4p6YdsPekph1pIGqwjtaW5GDL90x/2Zh56+k01s3TlL/6HEYr1lfDd7NIRmej1xT+naKxTA9x4HbASrGtzLdiVd4z+gGI34fq2m/uagAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wNy0xNVQxODo1NjowNyswMDowMJkeuHwAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMDctMTVUMTg6NTU6NDMrMDA6MDBzcZEqAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI0LTA3LTE1VDE4OjU2OjI3KzAwOjAw/XMmYgAAAABJRU5ErkJggg==",

  // 40px wide font awesome check-circle icon with color #C8191F (Attention)
  failure:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoBAMAAAB+0KVeAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAASUExURQAAAMcYIMgZH8caIMgZH////yqaCBsAAAAEdFJOUwBAv4BN7NoNAAAAAWJLR0QF+G/pxwAAAAd0SU1FB+gHDxQgOpQnCbUAAAAQY2FOdgAAArAAAAApAAABRAAAAABdNjLtAAAA00lEQVQoz4WS4RHDIAiFpXaA2HOA9JoBcr0MECP7z9QEAcWz7fsVP8kDAedYEILrBA889ZoMW7BoHTDMlW6oysJu2EhClxYehXk0mntHde0CESeBB4WnTf6njxUohgLSCdkn0mkr+YGLAzLzxdSLd0xO4U1sgG5KpruW4dgLd4apwMiHWCvmwApTDfwDR7+bRPu4pGHx8vbyTD4Bt9A0hMZmWodi0zY5y9QzXeVFEkA/uPXbiO3W6N6M1sauw/xrFZ1XejQL7gfsLPZ9sadhl0JQ9AGj13zaFi49QQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wNy0xNVQyMDozMjo0OCswMDowMCwgWuAAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMDctMTVUMjA6MzI6MTgrMDA6MDAVnew4AAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI0LTA3LTE1VDIwOjMyOjU4KzAwOjAwxsLDHQAAAABJRU5ErkJggg==",
});

async function main() {
  const webhookUrl = core.getInput("webhooks-url", { required: true });
  const githubToken = core.getInput("github-token", { required: true });
  const title = core.getInput("title", { required: true });

  // Possible values are success, failure, cancelled, or skipped
  // https://docs.github.com/en/actions/learn-github-actions/contexts#jobs-context
  const result = core.getInput("result", { required: true });

  const { job, pr } = await fetchGithubData(githubToken);
  const logUrl = job?.html_url ?? undefined;
  const prTitle = pr.title;
  const prNumber = pr.number;
  const prUrl = pr.html_url;

  const subject = `[PR #${prNumber}](${pr.html_url}) - ${prTitle}`;
  const text =
    result === "failure" ? `Deploy feilet: ${subject}` : `Deployet: ${subject}`;

  const actions = [];
  if (logUrl) {
    actions.push({
      title: "Vis logg",
      url: logUrl,
    });
  }
  if (prUrl) {
    actions.push({
      title: "Vis PR",
      url: prUrl,
    });
  }

  /**
   * @type {Readonly<CardData>}
   */
  const cardData = Object.freeze({ title, text, result, actions });
  const card = formatCard(cardData);
  const [err] = await sendPostRequest(webhookUrl, card);
  if (err) {
    console.error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * @param {string} githubToken
 */
async function fetchGithubData(githubToken) {
  const octokit = github.getOctokit(githubToken);
  const { context } = github;
  console.log(JSON.stringify(context, null, 2));

  console.log(`GITHUB_RUN_ATTEMPT: ${process.env.GITHUB_RUN_ATTEMPT}`);
  const [{ data: jobsData }, { data: pullRequestsData }] = await Promise.all([
    octokit.rest.actions.listJobsForWorkflowRunAttempt({
      ...context.repo,
      run_id: context.runId,
      attempt_number: parseInt(process.env.GITHUB_RUN_ATTEMPT ?? "1"),
    }),
    octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      commit_sha: github.context.sha,
    }),
  ]);
  // core.debug(`Used url to fetch associated PRs: ${result.url}`)
  // return result.data

  const job = jobsData.jobs[0];
  const pr = pullRequestsData[0];

  console.log("::group::{Job details}");
  console.log(JSON.stringify(job, null, 2));
  console.log("::endgroup::");

  console.log("::group::{Pull request details}");
  console.log(JSON.stringify(pr, null, 2));
  console.log("::endgroup::");

  console.debug(job);
  return { job, pr };
}

/**
 * @param {Readonly<CardData>} props
 * @returns {string}
 */
function formatCard(props) {
  /**
   * @type {string | undefined}
   */
  const icon = props.result ? iconMap[props.result] : undefined;

  const actions = props.actions.map((action) => ({
    type: "Action.OpenUrl",
    title: action.title,
    url: action.url,
  }));

  return JSON.stringify({
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "ColumnSet",
              columns: [
                ...(icon
                  ? [
                      {
                        type: "Column",
                        padding: "small",
                        width: "40px",
                        items: [
                          {
                            type: "Image",
                            url: icon,
                            width: "40px",
                          },
                        ],
                      },
                    ]
                  : []),
                {
                  type: "Column",
                  padding: "none",
                  width: "stretch",
                  items: [
                    {
                      type: "TextBlock",
                      text: props.title,
                      wrap: true,
                      weight: "bolder",
                      color:
                        props.result === "success"
                          ? "good"
                          : props.result === "failure"
                          ? "attention"
                          : undefined,
                    },
                    {
                      type: "TextBlock",
                      text: props.text,
                      wrap: true,
                      spacing: "none",
                    },
                  ],
                },
                ...(actions.length
                  ? [
                      {
                        type: "Column",
                        padding: "none",
                        width: "auto",
                        items: [
                          {
                            type: "ActionSet",
                            actions,
                          },
                        ],
                        verticalContentAlignment: "center",
                        horizontalAlignment: "right",
                        spacing: "small",
                      },
                    ]
                  : []),
              ],
              padding: "none",
              style: "default",
              spacing: "none",
            },
          ],
          padding: "none",
          msteams: {
            width: "full",
          },
        },
      },
    ],
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

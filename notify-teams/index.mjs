import * as core from "@actions/core";
import * as github from "@actions/github";

const iconMap = {
  // 40px font awesome info-circle icon with color #00b1b5
  info: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAABiBAMAAABZixs9AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAASUExURQAAAACvswCxtQCytgCxtf///8RobfgAAAAEdFJOUwBAgL+jVN0MAAAAAWJLR0QF+G/pxwAAAAd0SU1FB+gHEA0PHTi8W4UAAAAQY2FOdgAAArAAAABkAAABJwAAAAHbfuu2AAAB3UlEQVRYw7WYYZaCMAyEETxAcT0AKgdA5ABIc/8zrSKVhc60Td/b/Cx8TSZpS0NRQKvr66Uuku30kI/1l7T3B1nNxpnDTbY2xYBB9jY1SuBljRYIIAzgWloRHfIj3O4IKCVkjSomElclonQyRAirdSHSKV14TuIu9k7aBGLjpEwAtulKcbGpySEJEDEq3VvtflD2bq6hsLBIkA5DM/UkrjsaVBOcCQTlajWQB/5UTuGZCDlS5z7RERnjQrC5eEr8ylpSDe5jFgIKxXXMeQcTuez68c4Bg4mWJKIl/SR7o6NLeiJnwlxCeHBbmKoFaeETvv9uAx43iYfCao2a6JL3+EocwehjNixkRMSdl/xNnJE4uhDfRQdE8BjLIdp/J6YMAugwaqJX5yq0o7KIo5IYM4hKSXRqguzBIHFQEgafPgGCnHCcsFmn6FlFPPF4/1m9Jbg2jPCL404GNFsDvxIr4T/D3/liNSQcSI8SlYIYcbABYpE4pBPks22+wD7z7opTkXF/Lpf31Kvon3jbRGB1rr+96m/I+lt4xk0/oWHZN1/6jkXfFWV0XvruLpouz0VGl5rRCeu77YyOniPWMKLUAgQJAS+kVQJASx8D9H+KZsb9LXqkvT9bfbrW5I/XLwFecUhbeXLGAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTA3LTE2VDEzOjAyOjA1KzAwOjAwuDyuPAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0wNy0xNlQxMzowMTo1NyswMDowMP0pss4AAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjQtMDctMTZUMTM6MTU6MjkrMDA6MDA4o57vAAAAAElFTkSuQmCC",

  // 40px font awesome bell icon with color #bd8c00 (warning)
  warning:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABkBAMAAADwA+rRAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAASUExURQAAAL2LAL6MALuLAL2MAP///6T2f48AAAAEdFJOUwCAv0BHJ479AAAAAWJLR0QF+G/pxwAAAAd0SU1FB+gHEAsgFFfxp/4AAAAQY2FOdgAAArAAAABkAAABLAAAAADbqeoxAAABfElEQVRYw+WYa07EMAyEm7YHCNADLMIHWKAH6MP3PxN0A1snTeIxWqRFzN9+ssZju1LbNBk5evYNqI6YZxTu+VNoadrgFYQ3lheMdXaY/xT8FuAnAH0l/tLswbJB3sAqdMJWaZeyteUjxumWM/J44WLpbOFSacrDs6Ew8zkDDyV4OrJdic3dTF+EMy0OZfjoo8we83AVmA2Wj+ENNfiEjS8ofZXV2DRpdzs4iaOtw3EcfR32FjjObvw1eLghPN0jTHV4vUe4zib3rcDR9ncWWDmU+FRMcKvB8q56DZZ3NWjwyQLLTSINFiPUYo6CVpOTcahhyDjU/mQcOrvvHWB5HzhgefdBCLwaXHyHB2Rx9aGPL+gyxBGEt7mghS9Rg+2FFsH2QouEwyuyFz+CZ5uNEYcn/f2yy18+0VDL+FSWsHbvkJp/qO5B6KzA0UA1OBqRasMCy/3Wv+rFXk0qLPbbq7AzWBY+kB8RLe6iub5Vsd8QjlATm7pHXl5yDz4A8RGDEkCskgYAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjQtMDctMTZUMTE6MzI6MDQrMDA6MDDn9XbCAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI0LTA3LTE2VDExOjMxOjUxKzAwOjAwZ0dUvgAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNC0wNy0xNlQxMTozMjoyMCswMDowMHfXzM8AAAAASUVORK5CYII=",

  // 40px wide font awesome check-circle icon with color #C8191F (Attention)
  error:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoBAMAAAB+0KVeAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAASUExURQAAAMcYIMgZH8caIMgZH////yqaCBsAAAAEdFJOUwBAv4BN7NoNAAAAAWJLR0QF+G/pxwAAAAd0SU1FB+gHDxQgOpQnCbUAAAAQY2FOdgAAArAAAAApAAABRAAAAABdNjLtAAAA00lEQVQoz4WS4RHDIAiFpXaA2HOA9JoBcr0MECP7z9QEAcWz7fsVP8kDAedYEILrBA889ZoMW7BoHTDMlW6oysJu2EhClxYehXk0mntHde0CESeBB4WnTf6njxUohgLSCdkn0mkr+YGLAzLzxdSLd0xO4U1sgG5KpruW4dgLd4apwMiHWCvmwApTDfwDR7+bRPu4pGHx8vbyTD4Bt9A0hMZmWodi0zY5y9QzXeVFEkA/uPXbiO3W6N6M1sauw/xrFZ1XejQL7gfsLPZ9sadhl0JQ9AGj13zaFi49QQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wNy0xNVQyMDozMjo0OCswMDowMCwgWuAAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMDctMTVUMjA6MzI6MTgrMDA6MDAVnew4AAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI0LTA3LTE1VDIwOjMyOjU4KzAwOjAwxsLDHQAAAABJRU5ErkJggg==",
};

/**
 * @typedef {Object} Action
 * @property {string} type
 * @property {string} url
 * @property {string} title
 * @property {boolean} [isPrimary]
 *
 * @typedef {Object} CardData
 * @property {string} title
 * @property {string} text
 * @property {string|undefined} alertType
 * @property {string|undefined} icon
 * @property {ReadonlyArray<Action>} actions
 */

/**
 * @param {string} value
 */
const isTrue = (value) => value.trim().toLowerCase() === "true";

const alertTypes = Object.freeze(["info", "warning", "error"]);

const alertTypeColors = Object.freeze({
  info: "default",
  warning: "warning",
  error: "attention",
});

async function main() {
  const webhookUrl = core.getInput("webhooks-url", { required: true });
  const title = core.getInput("title", { required: true });
  const text = core.getInput("text", { required: true });
  const icon = core.getInput("icon") || undefined;
  const alertType = core.getInput("type") || undefined;
  const linkToGithubActionsLog = isTrue(
    core.getInput("link-to-github-actions-log") || "true"
  );
  const githubToken = core.getInput("github-token") || undefined;

  if (alertType && !alertTypes.includes(alertType)) {
    core.setFailed(
      `Unknown alert type: ${alertType}. Supported types are: ${alertTypes.join(
        ", "
      )}`
    );
    return;
  }

  /**
   * @type {Action[]}
   */
  const actions = [];
  if (linkToGithubActionsLog && githubToken) {
    const data = await fetchGithubJob(githubToken);
    if (data.job.html_url) {
      actions.push({
        type: "Action.OpenUrl",
        url: data.job.html_url,
        title: "Åpne logg",
      });
    }
  }

  /**
   * @type {Readonly<CardData>}
   */
  const cardData = Object.freeze({
    title,
    text,
    alertType,
    icon,
    actions,
  });
  const card = formatCard(cardData);
  const [err] = await sendPostRequest(webhookUrl, card);
  if (err) {
    console.error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * @param {string} githubToken
 */
async function fetchGithubJob(githubToken) {
  const octokit = github.getOctokit(githubToken);
  const { context } = github;
  const sha = github.context.sha;

  console.log(`GITHUB_RUN_ATTEMPT: ${process.env.GITHUB_RUN_ATTEMPT}`);
  const { data } = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
    ...context.repo,
    run_id: context.runId,
    attempt_number: parseInt(process.env.GITHUB_RUN_ATTEMPT ?? "1"),
  });

  const job = data.jobs[0];

  console.log("::group::{Job details}");
  console.log(JSON.stringify(job, null, 2));
  console.log("::endgroup::");

  return { job, sha };
}

/**
 * @param {Readonly<CardData>} props
 * @returns {string}
 */
function formatCard(props) {
  const icon =
    props.icon ?? props.alertType ? iconMap[props.alertType] : undefined;
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
                      color: alertTypeColors[props.alertType],
                    },
                    {
                      type: "TextBlock",
                      text: props.text,
                      wrap: true,
                      spacing: "none",
                    },
                  ],
                },
                ...(props.actions.length
                  ? [
                      {
                        type: "Column",
                        padding: "none",
                        width: "auto",
                        items: [
                          {
                            type: "ActionSet",
                            actions: props.actions,
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

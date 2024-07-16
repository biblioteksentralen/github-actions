import * as core from "@actions/core";

/**
 * @typedef {Object} CardData
 * @property {string} title
 * @property {string} text
 * @property {string|undefined} icon
 * @property {string|undefined} titleColor
 * @property {string|undefined} textColor
 */

async function main() {
  const webhookUrl = core.getInput("webhooks-url", { required: true });
  const title = core.getInput("title", { required: true });
  const text = core.getInput("text", { required: true });
  const icon = core.getInput("icon") || undefined;
  const titleColor = core.getInput("title-color") || undefined;
  const textColor = core.getInput("text-color") || undefined;

  /**
   * @type {Readonly<CardData>}
   */
  const cardData = Object.freeze({ title, text, icon, titleColor, textColor });
  const card = formatCard(cardData);
  const [err] = await sendPostRequest(webhookUrl, card);
  if (err) {
    console.error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * @param {Readonly<CardData>} props
 * @returns {string}
 */
function formatCard(props) {
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
                ...(props.icon
                  ? [
                      {
                        type: "Column",
                        padding: "small",
                        width: "40px",
                        items: [
                          {
                            type: "Image",
                            url: props.icon,
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
                      color: props.titleColor,
                    },
                    {
                      type: "TextBlock",
                      text: props.text,
                      wrap: true,
                      spacing: "none",
                      color: props.textColor,
                    },
                  ],
                },
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

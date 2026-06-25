# notify-slack-deploy

Send deploy success/failure notifications to Slack. PR titles and other user-provided values are JSON-escaped so quotes and special characters do not break the payload.

## Usage

```yaml
- name: Notify Slack - Success
  if: needs.deploy.result == 'success' && steps.pr_info.outputs.found == 'true'
  uses: biblioteksentralen/github-actions/notify-slack-deploy@v1
  with:
    token: ${{ secrets.SLACK_BOT_TOKEN }}
    channel_id: ${{ secrets.SLACK_CHANNEL_ID }}
    header: Dataplattform
    environment: production
    result: success
    pr_url: ${{ steps.pr_info.outputs.url }}
    pr_number: ${{ steps.pr_info.outputs.number }}
    pr_title: ${{ steps.pr_info.outputs.title }}

- name: Notify Slack - Failure
  if: needs.deploy.result == 'failure' && steps.pr_info.outputs.found == 'true'
  uses: biblioteksentralen/github-actions/notify-slack-deploy@v1
  with:
    token: ${{ secrets.SLACK_BOT_TOKEN }}
    channel_id: ${{ secrets.SLACK_CHANNEL_ID }}
    header: Dataplattform
    environment: production
    result: failure
    pr_url: ${{ steps.pr_info.outputs.url }}
    pr_number: ${{ steps.pr_info.outputs.number }}
    pr_title: ${{ steps.pr_info.outputs.title }}
    slack_user_id: ${{ steps.pr_info.outputs.slack_user_id }}
```

On failure, `slack_user_id` is optional. When set, the PR author is mentioned in the message.

### Inputs

See [action.yml](action.yml) for more details.

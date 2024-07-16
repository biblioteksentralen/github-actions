# notify-teams-deployment

## Development

After making changes to `index.mjs`, run

```sh
pnpm build
```

to compile the script and its dependencies into a single file and a sourcemap file.
Make sure to commit both files.

To learn more, see [Javascript actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action).

## Usage

The action can either be run as a step in a deploy job or as a separate job running after the deploy job.

### As a step in a deploy job

If running as a step in a deploy job, `result` should be set to the value of `job.status` from the
[job context](https://docs.github.com/en/actions/learn-github-actions/contexts#job-context), which
contains the current status of the job (Possible values are `success`, `failure`, or `cancelled`):

```yaml
steps:
  # ... (deploy steps) ...

  - if: failure() || success()
    uses: biblioteksentralen/github-actions/notify-teams-deployment@main
    with:
      title: Libry Content
      webhooks-url: "${{ secrets.MS_TEAMS_WEBHOOK_URI_DEPLOY_CHANNEL }}"
      github-token: "${{ secrets.GITHUB_TOKEN }}"
      result: "${{ job.status }}"
```

### As a separate job

If running as a separate job, `result` should be set to the value of `needs.<job_id>.result` from
the [needs context](https://docs.github.com/en/actions/learn-github-actions/contexts#needs-context),
where `<job_id>` is the id of the deploy job (Possible values are `success`, `failure`, `cancelled`
or `skipped`):

```yaml
jobs:
  deploy:
    # ... (deploy steps) ...

  notify:
    # Run if previous job was successful or failed, but not if it was cancelled.
    if: success() || failure()
    name: Notify Teams
    runs-on: ubuntu-22.04
    needs:
      - deploy
    steps:
      - uses: biblioteksentralen/github-actions/notify-teams-deployment@main
        with:
          title: Testy test
          webhooks-url: '${{ secrets.MS_TEAMS_WEBHOOK_URI}}'
          github-token: '${{ secrets.GITHUB_TOKEN }}'
          result: '${{ needs.deploy.result }}'
```

### Inputs

See [action.yml](action.yml) for more details.

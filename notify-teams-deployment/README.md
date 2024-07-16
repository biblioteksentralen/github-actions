# notify-teams-deployment

## Development

[Javascript actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
must be self-contained. After making changes to `index.mjs`, run `npm build` to compile the script
and its dependencies into a single file, and commit the resulting file (together with sourcemaps).

## Usage

```yaml
jobs:
  deploy:
    # ...

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

## Development

[Javascript actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
must be self-contained. After making changes to `index.mjs`, run `npm build` to compile the script
and its dependencies into a single file, and commit the resulting file (together with sourcemaps).

## Usage

```yaml
name: Check notification

on:
  push: {}
  release: {}

jobs:
  success:
    name: One with everything
    runs-on: ubuntu-22.04
    steps:
      - uses: biblioteksentralen/github-actions/notify-teams@main
        if: failure()
        with:
          title: Noe feilet
          text: Noe feilet. Se logg for mer informasjon.
          webhooks-url: ${{ secrets.MS_TEAMS_WEBHOOK_URI}}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

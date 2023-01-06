Usage:

```yaml
name: Check notification

on:
  push: {}
  release: {}

jobs:
  success:
    name: One with everything
    runs-on: ubuntu-18.04
    steps:
      - uses: biblioteksentralen/github-actions/notify-teams@main
        if: failure()
        with:
          title: Noe feilet
          text: Noe feilet. Se logg for mer informasjon.
          webhooks-url: ${{ secrets.MS_TEAMS_WEBHOOK_URI}}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```
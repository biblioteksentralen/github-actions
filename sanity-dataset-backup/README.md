# sanity-dataset-backup

This action exports datasets from Sanity and stores them as Github Actions artifacts that expires
automatically after a given number of days. Please see the action itself for details.

## Usage

Create a file `.github/workflows/backup.yml` in your repo:

```yaml
name: Backup
on:
  schedule:
    # Run automatically every night
    - cron: "2 0 * * *"
  workflow_dispatch:
    # Allow manual runs

jobs:
  backup-dataset:
    runs-on: ubuntu-latest
    name: Backup dataset
    steps:
      - uses: actions/checkout@v4
      - uses: biblioteksentralen/github-actions/node-setup@main
      - uses: biblioteksentralen/github-actions/sanity-dataset-backup@main
        with:
          sanity-path: apps/frontend
          sanity-read-token: ${{ secrets.SANITY_READ_TOKEN }}
      # Optional, but recommended: Notify Teams channel if backup fails
      - if: failure()
        uses: biblioteksentralen/github-actions/notify-teams@main
        with:
          webhooks-url: ${{ secrets.MS_TEAMS_WEBHOOK_URI}}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          type: warning
          title: Backup av XXXXXXXX feilet
          text: Se logg for mer informasjon
```

- Set `sanity-path` to the path of the Sanity project within the repo. Set it to `.` if
the Sanity project is in the root folder of the repo.
- Replace `XXXXXXXX` withe project name

Environment variables:

- `SANITY_READ_TOKEN`: Create a new Sanity token with Viewer permission for the project and make it
available for GitHub Actions (usually via Doppler).

- `MS_TEAMS_WEBHOOK_URI` can be made available via Doppler using *references* (see example in other
  projects).

- `GITHUB_TOKEN` does not need to be created, it's set automatically by GitHub Actions.

# sanity-dataset-backup

This action exports datasets from Sanity and stores them as Github Actions artifacts that expires
automatically after a given number of days. Please see the [`action.yml`](./action.yml) file itself
for details about retention time.

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
    name: Backup Sanity dataset
    steps:
      - uses: biblioteksentralen/github-actions/sanity-dataset-backup@v1
        with:
          sanity-path: apps/frontend
          sanity-read-token: ${{ secrets.SANITY_READ_TOKEN }}
          node-version: '22'
          package-manager: 'pnpm'  # Either 'pnpm' or 'npm'
      # Optional, but recommended: Notify Teams channel if backup fails
      - if: failure()
        uses: biblioteksentralen/github-actions/notify-teams@v1
        with:
          webhooks-url: ${{ secrets.MS_TEAMS_WEBHOOK_URI}}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          type: warning
          title: Backup av XXXXXXXX feilet
          text: Se logg for mer informasjon
```

- Set `sanity-path` to the path of the Sanity project within the repo, i.e. the folder with a
  `sanity.cli.ts` file. Can be omitted if the Sanity project is in the root folder.

- Set `node-version` and `package-manager` to match what's used in the repo.

- Replace `XXXXXXXX` with the project name.

Environment variables:

- `SANITY_READ_TOKEN`: Create a new Sanity token with Viewer permission for the project and make it
available for GitHub Actions (usually via Doppler).

- `MS_TEAMS_WEBHOOK_URI` can be made available via Doppler using *references* (see example in other
  projects).

- `GITHUB_TOKEN` does not need to be created, it's set automatically by GitHub Actions.

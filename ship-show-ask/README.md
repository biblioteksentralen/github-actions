# ship-show-ask

This action checks if one of the labels "ship 🚀", "show 👀" or "ask ❓" is present on
pull requests with 'main' as their base branch.

## Usage

```yaml
name: Require ship/show/ask label
on:
  pull_request:
    types:
      - opened
      - reopened
      - labeled
      - unlabeled
      - edited  # 'edited' includes base branch changes
jobs:
  ship-show-ask:
    permissions:
      issues: write
      pull-requests: write
    runs-on: ubuntu-22.04
    steps:
      - uses: biblioteksentralen/github-actions/ship-show-ask@main
```

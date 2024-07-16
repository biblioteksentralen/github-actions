# @biblioteksentralen/github-actions

Dette repoet inneholder [composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) som brukes av andre prosjekter som [Libry Content](https://github.com/biblioteksentralen/libry-content/tree/main/.github/workflows), [Forrigebok](https://github.com/biblioteksentralen/forrigebok/tree/main/.github/workflows) og [Dataplattform](https://github.com/biblioteksentralen/dataplattform/tree/main/.github/workflows).

Oversikt:

* [notify-teams](./notify-teams/README.md) for å sende varsler til Teams
* [notify-teams-deployment](./notify-teams-deployment/README.md) for å sende deployment-varsler til Teams
* [node-pnpm-setup](./node-pnpm-setup/README.md) for å sette opp standardversjoner av Node og PNPM med caching
* [node-setup](./node-setup/README.md) for å sette opp standardversjoner av Node og NPM med caching (deprecated)

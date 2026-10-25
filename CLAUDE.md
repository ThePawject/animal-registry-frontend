# CLAUDE.md

## User guide stays in sync with the UI

The in-app user guide (`/guide`) is generated: `e2e/guide/user-guide.guide.ts` drives the real app, and `pnpm guide` writes `src/guide/guide.md`, `src/guide/img/*.webp` and `src/guide/image-sizes.json`. Every change that alters what a user sees (layout, labels, buttons, flows, new screens) ships with a regenerated guide in the same branch.

1. Update the scenario in `e2e/guide/user-guide.guide.ts`: steps, highlights and the Polish text, so it describes the new UI (where a control sits, what it is called, what it does).
2. Run `pnpm guide`. It boots the same local stack as the e2e suite (see `e2e/README.md`). Done when all chapters pass.
3. Open every screenshot that changed (`git status src/guide`) and check that it shows the new UI and that the text matches it.
4. Commit `src/guide` together with the scenario change.

Gotchas:

- The run empties `src/guide/img` before it writes new screenshots. Let it finish. If it was interrupted, restore with `git checkout HEAD -- src/guide` and run it again.
- The guide needs port 3100 for its frontend. When a dev server is already using it, run the guide on a parallel stack:
  `E2E_COMPOSE_PROJECT=animal-registry-guide E2E_MSSQL_PORT=14331 E2E_AZURITE_PORT=10101 E2E_INFRA_HEALTH_PORT=4111 E2E_AUTH_PORT=4101 E2E_BACKEND_PORT=5101 E2E_FRONTEND_PORT=3101 pnpm guide`

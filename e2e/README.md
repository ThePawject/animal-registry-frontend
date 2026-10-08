# End-to-end tests

Playwright tests that drive the real frontend against the real backend,
entirely on your machine. Nothing talks to Auth0, Azure or any shared
environment.

```
pnpm e2e            # run everything (boots the stack if it is not running)
pnpm e2e:ui         # Playwright UI mode, for writing and debugging tests
pnpm e2e:report     # open the HTML report of the last run
pnpm e2e animal-events          # one spec file
pnpm e2e -g "can be rotated"    # tests matching a title
```

## What you need

- Docker (SQL Server and Azurite run as containers)
- .NET SDK 9 or newer
- the backend repository cloned next to this one as
  `../animal-registry-backend` (or point `E2E_BACKEND_DIR` at it)
- once: `pnpm exec playwright install chromium`

## What gets started

`playwright test` starts four things and stops them again afterwards
(`webServer` in `playwright.config.ts`):

| Service  | Port | What it is                                                         |
| -------- | ---- | ------------------------------------------------------------------ |
| infra    | 4110 | `stack/infra.ts`: SQL Server (14330) + Azurite (10100) via Compose |
| auth     | 4100 | `stack/mock-auth-server.ts`: a tiny OIDC provider replacing Auth0  |
| backend  | 5100 | `stack/backend.ts`: `dotnet run` of the backend repository         |
| frontend | 3100 | the Vite dev server                                                |

The ports differ from the usual dev ports, so the suite runs next to your
normal `pnpm dev`. Every port, path and timeout lives in `config/env.ts`
and can be overridden with an environment variable.

Neither repository is patched for testing. The backend is pointed at the
mock identity provider and the containers purely through configuration
(environment variables), and the frontend through its regular `VITE_*`
variables.

The database and the blob store keep their data in memory, so every run
starts empty. Locally an already running stack is reused, which makes
re-runs start in seconds: start it once in separate terminals, or run
with `E2E_KEEP_INFRA=1` to leave the containers up.

### Signing in

The mock identity provider signs in whoever a test describes: an e-mail
and a list of roles. A shelter is nothing more than the role
`Shelter_Access_<id>`, so a test creates a brand new, empty shelter just
by inventing an id (`createShelterUser()`). That is what keeps tests
independent of each other and of previous runs.

## Layout

```
config/env.ts      ports, URLs, timeouts: the one place to change them
stack/             scripts that start the services listed above
support/
  fixtures.ts      the `test` every spec imports (users, API client, page objects)
  api-client.ts    arranges data through the backend API
  users.ts         test identities
  data.ts          builders for animals, unique names, dates
  files.ts         in-memory PNG / PDF uploads
  domain.ts        enums and UI labels shared by tests and page objects
pages/             page objects: all selectors live here
specs/             the tests, one file per feature
global-setup.ts    warms the stack up before the first test
```

## Writing a test

```ts
import { buildAnimal } from '../support/data.ts'
import { expect, test } from '../support/fixtures.ts'

test('the card shows the breed', async ({ api, animalDetails }) => {
  const animal = await api.createAnimal(buildAnimal({ breed: 'Jamnik' }))

  await animalDetails.goto(animal.id)

  await animalDetails.expectDetails({ Rasa: 'Jamnik' })
})
```

- `page` is already signed in as `user`; `api` acts as the same user.
- Arrange data through `api`, then exercise the UI. Only the feature under
  test should go through the browser.
- Give everything you create a unique name (`unique('Burek')`,
  `buildAnimal()`) and find it by that name.
- Tests share one shelter per worker by default. When a test counts rows
  or pages or expects an empty list, give it its own shelter:
  `test.use({ shelter: 'isolated' })`.
- Login-flow tests start signed out: `test.use({ signedIn: false })`.
- Selectors belong in `pages/`. If the markup changes, a page object
  changes, not the specs.
- Use relative dates (`daysAgo(3)`), never fixed ones.

## Stability

The dev stack can freeze for a minute or two (Vite re-optimising
dependencies, a cold .NET endpoint). The suite is built to wait that out
rather than fail:

- every wait that depends on the stack uses `TIMEOUTS.slow` (150 s by
  default, `E2E_SLOW_TIMEOUT_MS`); passing assertions still return at once
- `global-setup.ts` opens every route and calls every endpoint once, so
  first-compile costs are paid before the tests start
- tests never sleep to wait for the stack; they wait for what they need
  (settled table, URL change, download)
- data is isolated per shelter, so a retried test starts clean

While developing, shorten the feedback loop for failing assertions with
`E2E_SLOW_TIMEOUT_MS=20000 pnpm e2e ...`.

## Useful switches

| Variable              | Effect                                           |
| --------------------- | ------------------------------------------------ |
| `E2E_BACKEND_DIR`     | location of the backend repository               |
| `E2E_WORKERS`         | parallel workers (default 3)                     |
| `E2E_SLOW_TIMEOUT_MS` | patience for a slow stack (default 150000)       |
| `E2E_KEEP_INFRA=1`    | keep the containers and their data after the run |
| `E2E_*_PORT`          | move a service to another port                   |

Traces, screenshots and the HTML report of failed tests are written to
`e2e/.artifacts/`.

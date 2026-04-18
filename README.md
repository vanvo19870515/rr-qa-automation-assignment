# TMDB Discover - Senior QA Automation Framework

Production-grade Playwright + TypeScript automation framework for the TMDB Discover SPA:
https://tmdb-discover.surge.sh/

This framework is refactored for senior-level maintainability, scalability, CI/CD readiness, and reporting quality.

## Project Overview

The suite validates:
- navigation by category (Popular, Trend, Newest, Top rated)
- filtering (Type, Genre, Rating, Year range)
- pagination behavior and edge cases
- API/UI consistency for critical paths
- resilience against known product defects

## Architecture (Clean Layered Design)

```
├── tests/                      # Specs only (assertions + orchestration)
│   ├── ui/
│   ├── api/
│   └── core/
├── pages/                      # Page Objects (domain actions)
│   ├── home.page.ts
│   ├── filter-panel.page.ts
│   └── results.page.ts
├── components/                 # Reusable UI components
│   ├── pagination.component.ts
│   └── filter-panel.component.ts
├── services/
│   └── api/
│       ├── client/
│       ├── models/
│       ├── validators/
│       └── tmdb.service.ts
├── core/                       # Framework core
│   └── driver/
│       ├── base.page.ts
│       └── base.fixture.ts
├── config/                     # Runtime config + constants
│   ├── env.ts
│   └── constants.ts
├── utils/                      # Utilities (logger, waits, assertions, data loader)
│   ├── logger.ts
│   ├── network.interceptor.ts
│   ├── assertions.ts
│   ├── data.loader.ts
│   └── retry.helper.ts
├── data/                       # Test data and env profiles
│   ├── fixtures/
│   ├── mocks/
│   └── environments/
├── reports/                    # Playwright HTML/JSON report output
├── .github/workflows/test.yml
└── docs/
```

### Separation of Concerns

- **tests/**: business expectations only
- **pages/components/**: selectors + UI actions only
- **services/api/**: HTTP transport + schema validation + endpoint wrappers
- **core/**: shared fixture composition and base abstractions
- **utils/**: logging/waits/assertion helpers
- **config/data/**: static config and fixtures

No business logic is kept inside test files.

## API Layer Strategy

The `/services/api` layer provides:
- typed API client wrapper (`ApiClient`)
- TMDB-specific service (`TmdbService`)
- response schema guards (`validators/tmdb.validators.ts`)
- safety checks before returning response data

This enables robust API contract validation and UI/API consistency checks.

## Logging Strategy

Structured logger emits:
- timestamp
- level (`info`, `warn`, `error`)
- test context prefix

Logs are written to:
- console (live run diagnostics)
- `logs/test.log` (artifact-friendly output)

## Reporting Strategy

Playwright reporter stack:
- `list` for CI output
- HTML report (`reports/`)
- JSON report (`reports/results.json`)

Failure evidence:
- screenshot (`only-on-failure`)
- trace (`retain-on-failure`)
- video (`retain-on-failure`)

## Test Strategy

### Techniques Used
- **BVA** (Boundary Value Analysis): pagination and year/rating boundaries
- **EP** (Equivalence Partitioning): valid vs invalid filters/search inputs
- **Decision Table thinking**: combined filter interactions (type + genre + rating)

### Coverage Areas
- positive happy flows
- negative/invalid search
- empty result scenarios
- API mock behavior (empty and error payloads)
- defect-aware checks for known unstable behavior

## Setup

```bash
git clone <repo-url>
cd rr-qa-automation-assignment
npm install
npx playwright install --with-deps
cp .env.example .env
```

Set `TMDB_API_KEY` in `.env` when contract/API-cross-check tests are required.

## Test Execution

```bash
npm test
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:api-only
npm run test:filters
npm run test:pagination
npm run test:negative
```

Environment selection:

```bash
npm run test:dev
npm run test:staging
npm run test:prod
```

Quality gate:

```bash
npm run validate
```

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/test.yml`

Pipeline stages:
1. lint + strict typecheck
2. API tests (auto-skip if `TMDB_API_KEY` is missing)
3. E2E browser matrix (chromium/firefox/webkit)
4. upload reports and traces as artifacts

## Known Issues / Defects

- **DEF-01**: direct deep link (`/popular`) returns 404 due to hosting routing
- **DEF-02**: pagination allows excessive pages compared to API hard cap
- **DEF-03**: TV search still hits `search/movie`
- **DEF-04**: year filter can emit unstable/mismatched date params
- **DEF-05**: pagination visibility varies by category

## Scaling Guidelines

When adding features:
- extend API contracts in `services/api/models + validators`
- add domain methods in `pages/` first, then call from tests
- keep assertions only in specs
- store reusable test data in `data/fixtures`
- avoid raw selectors in tests

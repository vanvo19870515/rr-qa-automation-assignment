# TMDB Discover — QA Automation Framework

Production-ready test automation framework for the **TMDB Discover** SPA.

**Target:** https://tmdb-discover.surge.sh/ | **Stack:** Playwright + TypeScript + Winston

---

## Architecture

```
├── tests/                         # Test specs only — assertions here
│   ├── ui/
│   │   ├── filters.spec.ts        # 17 tests — categories, search, sidebar, defects
│   │   └── pagination.spec.ts     # 5 tests — page nav, boundaries, reset
│   └── api/
│       ├── api-mock.spec.ts       # 4 tests — page.route() stubbed responses
│       └── tmdb-api.spec.ts       # 7 tests — direct API contract validation
│
├── pages/                         # Page Objects — actions only, zero assertions
│   └── discover.page.ts           # Composes components, exposes domain methods
│
├── components/                    # Reusable UI parts
│   ├── sidebar.component.ts       # Type, Genre, Year, Rating (react-select)
│   ├── pagination.component.ts    # Next, Prev, page number, state
│   ├── movie-grid.component.ts    # Cards, titles, meta, empty/error states
│   └── navbar.component.ts        # Category tabs + search input
│
├── flows/                         # Business flows — multi-step journeys
│   └── discover.flow.ts           # applyFilters(), navigateToPageAndBack()
│
├── api/
│   ├── clients/
│   │   └── api.client.ts          # Abstract BaseApiClient (GET/POST + logging)
│   └── endpoints/
│       ├── tmdb.models.ts         # Request/response interfaces
│       └── tmdb.service.ts        # TmdbService extends BaseApiClient
│
├── core/
│   ├── driver/
│   │   ├── base.page.ts           # Abstract BasePage — retry nav, smart waits
│   │   └── base.fixture.ts        # test.extend<> — DI for pages, API, logger
│   ├── config/
│   │   ├── env.ts                 # Multi-env config loader (dev/staging/prod)
│   │   └── constants.ts           # Categories, genre IDs, API patterns
│   └── logger/
│       └── logger.ts              # Winston: console + file (5MB rotate)
│
├── utils/
│   ├── network.interceptor.ts     # waitForTmdbResponse — browser network validation
│   ├── retry.helper.ts            # Generic async retry with backoff
│   └── data.loader.ts             # JSON fixture loader
│
├── testdata/
│   ├── mocks/
│   │   └── movies.mock.ts         # Typed mock payloads for page.route()
│   ├── fixtures/
│   │   ├── search-queries.json    # Externalised search test data
│   │   └── filter-combos.json     # Externalised filter combinations
│   └── environments/
│       ├── dev.env
│       ├── staging.env
│       └── prod.env
│
├── playwright.config.ts
├── .github/workflows/ci.yml
└── docs/
```

### Layer Responsibilities

| Layer | Contains | Does NOT contain |
|-------|----------|-----------------|
| **tests/** | Test cases, assertions, test.step() | Selectors, API logic |
| **pages/** | Domain actions, state readers | Assertions, selectors (delegated to components) |
| **components/** | Locators, low-level UI actions | Assertions, business logic |
| **flows/** | Multi-step user journeys | Assertions, selectors |
| **api/** | Models, base client, domain services | UI logic, assertions |
| **core/** | BasePage, fixtures, config, logger | Business logic |
| **utils/** | Network interceptor, retry, data loader | Business logic |
| **testdata/** | Mocks, JSON fixtures, env files | Logic |

---

## Setup

```bash
git clone <repo-url> && cd rr-qa-automation-assignment
npm install
npx playwright install --with-deps
cp .env.example .env   # Set TMDB_API_KEY
```

## Running Tests

| Command | Description |
|---------|-------------|
| `npm test` | Full suite — 32 tests × 3 browsers |
| `npm run test:chromium` | Single browser |
| `npm run test:smoke` | Smoke (5) |
| `npm run test:regression` | Regression (24) |
| `npm run test:defect` | Known defects (3) |
| `npm run test:filters` | UI filter tests |
| `npm run test:pagination` | UI pagination tests |
| `npm run test:api` | All API tests |
| `npm run test:api-only` | API contract only (7) |
| `npm run test:headed` | Visible browser |
| `npm run test:debug` | Playwright Inspector |
| `npm run test:ui` | Interactive UI mode |

### Multi-Environment

```bash
npm run test:dev              # TEST_ENV=dev
npm run test:staging          # TEST_ENV=staging
npm run test:prod             # TEST_ENV=prod (default)
```

## Quality Gates

```bash
npm run validate              # lint + typecheck + format
```

## Reports

```bash
npm run test:report           # Opens HTML report
```

| Artifact | Location |
|----------|----------|
| HTML report | `reports/index.html` |
| Winston log | `logs/test.log` |
| Screenshots/Traces | `test-results/` (on failure) |

## CI Pipeline

```
push/PR → lint → API tests (parallel) + E2E matrix (chromium × firefox × webkit)
```

## Test Coverage — 32 Tests

- **UI Tests (22):** Home, categories, search, filters, pagination, defects
- **API Mock Tests (4):** Stubbed responses, empty/error states
- **API Contract Tests (7):** Popular, search, genres, TV, top rated

## Defects Found — 5

| ID | Summary | Severity |
|----|---------|----------|
| DEF-01 | Direct URL returns 404 | High |
| DEF-02 | Pagination shows ~56K pages | Medium |
| DEF-03 | TV search uses wrong endpoint | Medium |
| DEF-04 | Year defaults to 1900 | Low |
| DEF-05 | No pagination for non-Popular tabs | Low |

Details: [docs/defects-found.md](docs/defects-found.md)

## Documentation

- [Test Strategy](docs/test-strategy.md)
- [Test Cases](docs/test-cases.md)
- [Defects Found](docs/defects-found.md)

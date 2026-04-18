# TMDB Discover QA Automation Framework

Production-grade Playwright + TypeScript framework for validating:
https://tmdb-discover.surge.sh/

This repository is structured as a maintainable, scalable, CI-ready automation solution that keeps existing test behavior while raising architecture and quality standards.

## 1) Project Overview

The suite validates:
- category navigation (Popular, Trend, Newest, Top rated)
- filtering (Type, Genre, Rating, Year range)
- pagination flows and edge behavior
- API contract correctness
- UI/API consistency for critical scenarios
- known defects tracking without destabilizing CI

## 2) Refactored Folder Structure

```text
.
├── tests/
│   ├── ui/                      # UI specs only (Arrange/Act/Assert orchestration)
│   │   └── steps/               # Reusable UI test steps
│   └── api/                     # API contract + API-mock specs
├── pages/                       # Page Objects (domain-level UI actions)
├── components/                  # Reusable UI components
├── services/
│   └── api/                     # API client, models, validators, service facade
├── core/
│   └── driver/                  # Base fixture and base page abstractions
├── utils/                       # Shared helpers (logger, network, assertions, loader)
├── config/                      # Runtime config, constants, selector catalog
├── fixtures/                    # Primary reusable fixture files (JSON)
├── data/                        # Environments + API mock payloads
├── .github/workflows/test.yml   # CI pipeline
└── docs/
```

## 3) Architecture Decisions (and Why)

- **Tests vs logic separation**
  - Specs hold expectations and business assertions.
  - Locators and UI behavior are encapsulated in pages/components.
  - Result: simpler, readable tests and easier maintenance.

- **API testing layer**
  - `services/api/client/api-client.ts` centralizes transport and error handling.
  - `services/api/tmdb.service.ts` exposes domain endpoints.
  - `services/api/validators` enforces runtime response shape.
  - Result: stronger API contract confidence and safer UI/API cross-checks.

- **Selector governance**
  - `config/selectors.ts` centralizes selectors with `data-testid`-first + fallback strategy.
  - Result: reduced duplication and easier selector evolution.

- **Reusable AAA test steps**
  - `tests/ui/steps/discover.steps.ts` contains reusable Arrange/Act/Assert helpers.
  - Result: less repetition and consistent test intent.

## 4) Test Strategy Highlights

Design techniques used:
- **BVA**: pagination boundaries, page transitions, limits
- **EP**: valid vs invalid search/filter input classes
- **Decision-table thinking**: combined filters (type + genre + rating)
- **Negative testing**: malformed searches, invalid ranges, edge navigation

Coverage includes:
- happy-path UI flows
- API contract assertions
- network-intercept checks with query validation
- API mock scenarios (empty/error/custom payload)
- defect-focused cases (`@defect`) for known product issues

See `TEST_STRATEGY.md` for full strategy details.

## 5) Playwright Configuration Standards

Configured in `playwright.config.ts`:
- `baseURL` from environment config
- `trace: 'on-first-retry'`
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- HTML + JSON reporting
- browser matrix: chromium/firefox/webkit

## 6) Logging and Debugging

- Winston logger with structured output and contextual messages
- test-scoped logging through fixture injection
- sanitized API logging for sensitive query params
- failure artifacts (screenshots/videos/traces) are attached by Playwright and uploaded in CI

## 7) Run Locally

```bash
npm install
npx playwright install --with-deps
```

Optional env profiles:
- `data/environments/dev.env`
- `data/environments/staging.env`
- `data/environments/prod.env`

`TMDB_API_KEY` is required for full API-contract and API cross-check scenarios.

Commands:

```bash
npm test
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:filters
npm run test:pagination
npm run test:negative
```

Quality gates:

```bash
npm run validate
```

## 8) CI/CD

Workflow: `.github/workflows/test.yml`

Pipeline stages:
1. quality gates (`lint`, `typecheck`, format check)
2. API contract tests (auto-skip when key missing)
3. E2E matrix (chromium/firefox/webkit)
4. artifact upload (`reports`, `test-results`, `logs`)

Designed for headless CI execution and deterministic artifacts.

## 9) Known Defects (Tracked by Tests)

- **DEF-01**: direct slug (`/popular`) returns 404 (hosting route limitation)
- **DEF-02**: pagination can render pages beyond TMDB max cap
- **DEF-03**: TV search still calls `search/movie`
- **DEF-04**: year filter can emit unstable/mismatched date params
- **DEF-05**: pagination visibility differs by category

## 10) Extension Guidelines

When adding new coverage:
- add/extend selectors in `config/selectors.ts`
- add page/component methods before modifying specs
- add API models + validators before new endpoint assertions
- keep reusable fixture data under `/fixtures`
- keep specs focused on business outcomes, not DOM plumbing

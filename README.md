# TMDB Discover - Production QA Automation Framework

Senior-level QA automation framework for:
https://tmdb-discover.surge.sh/

This repository is structured as a scalable SDET framework with clean architecture, Page Object Model, API abstraction, structured logging, reporting, and CI-ready test suites.

## Project Overview

The AUT is a TMDB-like movie/TV discovery SPA with:
- category navigation (Popular / Trend / Newest / Top rated)
- filter panel (type, genre, year, rating, title)
- pagination with known edge defects
- backend-driven content via TMDB-style endpoints

The framework validates UI behavior, API contract integrity, and UI/API consistency while preserving defect visibility for known application issues.

## Architecture

### Target architecture (implemented via source façade + active modules)

```text
src/
  core/
    config/
    logger/
    api/
    reporting/
  pages/
  components/
  utils/
  data/
tests/
  ui/
  api/
  e2e/
reports/
docs/
```

### Actual implementation mapping

- `src/core/*` re-exports and centralizes production-facing entry points
- operational modules currently live in:
  - `core/`, `config/`, `services/api/`, `pages/`, `components/`, `utils/`, `data/`
- test suites:
  - `tests/ui` for UI flows
  - `tests/api` for API contract and mock scenarios
  - `tests/e2e` for end-to-end business journeys

This allows a non-breaking migration path while maintaining runtime stability.

## Design Patterns Used

- **Page Object Model**: UI behavior encapsulated in page/component classes
- **Factory pattern (test data)**: fixture-driven test inputs from `/fixtures` and data helpers
- **Singleton**:
  - config singleton-like runtime surface (`env`)
  - logger singleton (`core/logger/logger.ts`)
- **API abstraction layer**:
  - generic API client (`services/api/client/api-client.ts`)
  - domain service (`services/api/tmdb.service.ts`)
  - runtime schema validation (`services/api/validators`)

## Test Strategy

Detailed strategy: `docs/test-strategy.md` and `TEST_STRATEGY.md`

Includes:
- Equivalence Partitioning
- Boundary Value Analysis
- Negative testing
- Risk-based prioritization

Coverage highlights:
- Filters:
  - valid/invalid year range
  - rating boundaries
  - empty genre
  - invalid category slug behavior
- Pagination:
  - page 1, middle page
  - last-page defect behavior
  - invalid/high page handling

## Reporting and Logging

### Reporting

- Playwright HTML report: `reports/index.html`
- JSON report: `reports/results.json`
- failure artifacts:
  - screenshot
  - video
  - trace on retry

### Logging

- structured logger with levels + timestamps
- API request/response logs (sanitized)
- test-step logs
- error logs
- log output file:
  - `reports/logs/test-run.log`

## Test Commands

```bash
# all tests
npm test

# split suites
npm run test:ui
npm run test:api
npm run test:e2e

# reports
npm run report
```

Additional helper commands are available for smoke/regression/browser-specific runs.

## Local Setup

```bash
npm install
npx playwright install --with-deps
```

Environment profiles:
- `data/environments/dev.env`
- `data/environments/staging.env`
- `data/environments/prod.env`

`TMDB_API_KEY` is required for full API-contract and API-cross-check assertions.

## CI/CD Approach

Current workflow: `.github/workflows/test.yml`

Pipeline flow:
1. lint + typecheck + format checks
2. API contract tests (skip when key absent)
3. cross-browser E2E matrix
4. artifact upload (reports/test-results/logs)

CI design details (strategy, retries, env handling):
- `docs/ci-cd.md`

## Defect Documentation

Documented defects:
- `docs/defects.md` (primary)
- `docs/defects-found.md` (legacy alias)

Known AUT issues include:
- pagination last/high pages broken vs API cap
- direct slug/refresh routing issue
- filter consistency issues

## Test Case Documentation

Detailed cases in:
- `docs/test-cases.md`

Format includes:
- ID
- Description
- Preconditions
- Steps
- Expected result
- Type (UI / API / E2E)

## Quality Principles

- DRY, reusable selectors, no duplicated low-level plumbing in tests
- clear naming and strict TypeScript typing
- no hardcoded business test data in specs (fixture-driven)
- maintainability first: tests express business intent, framework handles mechanics

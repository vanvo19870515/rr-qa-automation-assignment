# TEST STRATEGY - TMDB Discover QA Automation

## 1) Scope and Objectives

This strategy validates the TMDB Discover demo SPA using a layered automation approach:
- UI E2E behavior (navigation, filters, pagination)
- API contract and schema integrity
- UI/API consistency on business-critical flows
- known defect tracking without destabilizing CI

Primary objective: maintain production-level confidence while keeping tests readable, maintainable, and CI-ready.

## 2) Test Levels

### UI E2E (`tests/ui`)
- validates user-facing journeys and business rules
- uses Page Objects + reusable step helpers
- uses network interception for deterministic assertions

### API Contract (`tests/api`)
- validates TMDB endpoint response status and shape
- uses typed API service and runtime validators
- cross-checks pagination/search semantics

## 3) Design Techniques

- **AAA (Arrange / Act / Assert):** encoded in test structure and step helper labels.
- **BVA (Boundary Value Analysis):** pagination boundaries, year ranges, rating thresholds.
- **EP (Equivalence Partitioning):** valid vs invalid query/filter groups.
- **Decision-table thinking:** filter combinations (type + genre + rating + year).
- **Defect-aware testing:** known issues are annotated to keep signal while preventing flaky false negatives.

## 4) Coverage Matrix

- category navigation: Popular / Trend / Newest / Top rated
- search: valid, empty, special characters, long query
- filters: type, genre, year, rating, combined filters
- pagination: next/previous, reset behavior, high-page defect behavior
- API mocking: empty, error, full-page payload handling

## 5) Architecture and Ownership

- `tests/`: orchestration + assertions only
- `pages/` + `components/`: UI interaction layer
- `services/api/`: transport + endpoint wrappers + schema assertions
- `utils/`: assertion utilities, network helpers, logger utilities
- `fixtures/`: reusable static test data
- `config/`: environment and selector definitions

No raw selector logic or HTTP implementation details should live directly in specs.

## 6) Selector Strategy

- prefer `data-testid` selectors
- keep resilient fallback selectors for backward compatibility
- centralize selectors in `config/selectors.ts`

This allows gradual app-side improvements without mass test rewrites.

## 7) Logging, Debugging, and Evidence

- structured logger with contextual test scope
- screenshot on failure
- video retained on failure
- trace captured on first retry
- HTML + JSON reports generated for local and CI analysis

## 8) CI/CD Strategy

Workflow (`.github/workflows/test.yml`) executes:
1. quality gates: lint, typecheck, formatting checks
2. API contract tests (skipped when TMDB key is unavailable)
3. E2E matrix across Chromium, Firefox, WebKit
4. artifact upload (`reports/`, `test-results/`, `logs/`)

## 9) Risks and Mitigations

- External API variability / key availability -> guarded API suite execution.
- WebKit network timing differences -> UI-state fallback assertions where appropriate.
- Hosting routing constraints on deep links -> documented as known defect with explicit annotation.

## 10) Exit Criteria

- quality gates pass (`lint`, `typecheck`, formatting)
- no unresolved critical failures in smoke/regression suites
- reports and debugging artifacts generated in CI
- known defects are explicitly annotated, not silently ignored

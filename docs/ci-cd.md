# CI/CD Design for QA Automation Pipeline

> Scope: design-only document. This defines the intended GitHub Actions strategy for reliable QA automation execution.

## 1) Pipeline Goals

- Enforce quality gates before execution of expensive browser suites
- Provide deterministic, debuggable artifacts for failures
- Keep API and UI test responsibilities separated
- Support safe retries for flaky network/UI behavior in CI

## 2) Proposed GitHub Actions Workflow

### Trigger

- `push` to `main`
- `pull_request` targeting `main`

### Jobs

1. **quality-gates**
   - checkout
   - setup Node
   - `npm ci`
   - `npm run lint`
   - `npm run typecheck`
2. **api-tests**
   - depends on `quality-gates`
   - run `npm run test:api`
   - skip gracefully when `TMDB_API_KEY` missing
3. **ui-tests**
   - depends on `quality-gates`
   - run `npm run test:ui`
4. **e2e-tests**
   - depends on `quality-gates`
   - run `npm run test:e2e` against browser matrix
5. **publish-artifacts**
   - `if: always()`
   - upload:
     - `reports/`
     - `test-results/`
     - `reports/logs/test-run.log`
     - `reports/api-dumps/`

## 3) Parallel Execution Strategy

- Run `api-tests` and `ui-tests` in parallel after `quality-gates`
- Execute `e2e-tests` as matrix:
  - chromium
  - firefox
  - webkit
- Set `fail-fast: false` in matrix to collect full browser signal

## 4) Retry Strategy

- Playwright config:
  - `retries: 2` in CI
  - `trace: 'on-first-retry'`
- Keep API query assertions explicit to avoid broad response matching
- Prefer UI-state fallback assertions when known browser cache behavior exists

## 5) Environment Variable Handling

- Use repository/environment secrets:
  - `TMDB_API_KEY`
  - optional `BASE_URL`, `TMDB_API_BASE`
- Load `TEST_ENV=prod` by default in CI
- Never print raw API keys in logs (sanitize query strings)

## 6) Artifact and Reporting Policy

- Always keep HTML report (`reports/index.html`)
- Keep JSON execution report (`reports/results.json`)
- Preserve screenshot/video/trace for failed/retried tests
- Attach API dump and console dump for failed tests

## 7) Branch Protection Recommendation

- Require passing checks:
  - quality-gates
  - api-tests (or explicit skip with warning)
  - all e2e matrix jobs
- Require at least one reviewer approval before merge

# Test Strategy – TMDB Discover

## 1) Objective

Build a stable, production-grade automation strategy for:
https://tmdb-discover.surge.sh/

The strategy validates end-user behavior and backend contract integrity for:
- category, type, year, rating, genre, and title filtering
- pagination behavior including known broken last-page scenarios
- UI and API consistency

## 2) Strategy by test level

### UI (`tests/ui`)
- validates visible behavior and user journeys
- checks URL/query sync where relevant
- includes edge and defect-aware checks

### API (`tests/api`)
- validates response status and schema
- validates endpoint query behavior (`discover`, `search`, pagination)
- cross-checks UI visible state versus API response data

### E2E (`tests/e2e`)
- validates full end-to-end flows combining category + filters + pagination
- focuses on critical user journeys and defect-guarded boundaries

## 3) Design techniques (mandatory coverage)

### Equivalence Partitioning
- valid search vs nonsense search strings
- movie vs TV type selection
- available genre vs empty/invalid genre behavior

### Boundary Value Analysis
- year range boundaries (valid order vs reversed range)
- rating boundaries (low bound, high bound, out-of-range handling)
- pagination boundaries:
  - page 1
  - middle page
  - last-page/high-page known broken behavior

### Negative testing
- invalid category slug route (direct URL)
- empty/no-result search
- invalid pagination index behavior
- unstable year filtering behavior

### Risk-based prioritization
1. **High risk:** category/filter/search core flows and `/discover` query correctness
2. **Medium risk:** pagination state synchronization and API page correctness
3. **Medium/Low risk:** visual edge cases and defect-specific behaviors

## 4) Coverage matrix

| Area | Scenarios |
|------|-----------|
| Filters | valid year, invalid year order, rating bounds, empty genre behavior |
| Categories | Popular, Trending, Newest, Top Rated |
| Search | valid title, empty result, special characters, long input |
| Pagination | page 1, middle pages, high/last page known bug, invalid page behavior |
| API | schema validation, query-parameter validation, response/UI consistency |

## 5) API validation model

The framework validates both:
1. **Intercepted browser traffic** (`waitForTmdbResponse*`) for request/response checks
2. **Direct API service calls** (`TmdbService`) for contract-level checks

For `/discover` and pagination flows, the strategy verifies:
- query parameters are present and expected
- response body matches schema
- UI rendered data stays consistent with API payload expectations

## 6) Entry and exit criteria

### Entry
- AUT reachable
- dependencies installed
- Playwright browsers installed
- optional `TMDB_API_KEY` available for full API coverage

### Exit
- lint + typecheck + formatting checks pass
- UI/API/E2E command sets complete without critical failures
- reports, screenshots, videos, traces, and API dump attachments generated for failures
- known defects documented in `docs/defects.md`

## 7) Quality risk controls

| Risk | Mitigation |
|------|------------|
| Unstable AUT behavior | defect-annotated assertions and guarded skips where justified |
| API variability/rate limits | retries + scoped assertions + deterministic interception |
| Flaky browser timing | conservative CI workers, visibility waits, resilient selectors |
| Broken deep-link routes | explicit negative tests and defects documentation |

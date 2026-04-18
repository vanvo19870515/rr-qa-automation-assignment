# Test Strategy – TMDB Discover

## 1. Objective

Validate the **filter** and **pagination** functionality of the TMDB Discover SPA (`https://tmdb-discover.surge.sh/`) through automated end-to-end tests, supplemented with API-level assertions for data correctness.

## 2. Scope

### In scope

| Area | Details |
|------|---------|
| Category navigation | Popular, Trend, Newest, Top Rated tabs |
| Title search | Debounced text input searching the TMDB API |
| Sidebar filters | Type (Movie / TV), Genre (multi-select), Year range, Rating stars |
| Pagination | Page navigation via react-paginate (next/prev/page number) |
| Negative / edge cases | Direct slug access (404), high page numbers, empty search results |
| API validation | Intercept TMDB API responses and assert data matches UI |

### Out of scope

- Performance / load testing
- Cross-browser beyond Chromium (can be added easily)
- Accessibility audit (beyond what Playwright captures)
- Mobile-responsive testing

## 3. Test Approach

### 3.1 Test levels

- **E2E (UI):** Playwright browser automation against the live SPA.
- **API assertions:** `page.waitForResponse` intercepts network calls; `page.request.get` for direct API validation.

### 3.2 Test design techniques

| Technique | Applied to |
|-----------|-----------|
| Equivalence Partitioning | Type filter (Movie vs TV), valid/invalid search queries |
| Boundary Value Analysis | Year range (min 1900, max current year), page numbers (1, 2, last) |
| Decision Table | Combined filter combos (Genre + Rating + Year) |
| Negative Testing | Direct slug URLs, non-existent search terms, pagination limits |
| Exploratory (captured) | Known issues documented as defects |

### 3.3 Test automation stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Playwright (TypeScript) | Multi-browser, built-in assertions, network interception, HTML reporter |
| Logger | Winston | Structured file + console logging with timestamps |
| Reporting | Playwright HTML + JSON reporter | Rich interactive report with traces, screenshots, video |
| CI | GitHub Actions | Free, native Node.js support, artifact upload |

### 3.4 Design patterns

- **Page Object Model (POM):** `DiscoverPage` encapsulates all locators and actions, isolating selectors from test logic.
- **API Helper:** Reusable interceptor functions for TMDB API response validation.
- **Centralized Logging:** Single Winston logger used across all files for consistent output.

## 4. Entry / Exit Criteria

### Entry
- Target website is accessible
- Node.js 18+ and Playwright browsers installed
- TMDB API key is functional (embedded in the SPA)

### Exit
- All planned test cases executed
- All defects documented with evidence (screenshots, logs)
- HTML report generated

## 5. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| SPA hosted on surge.sh has no server-side routing | High | High | Test documents it as defect; tests navigate via root URL |
| TMDB API rate limiting | Medium | Medium | Conservative parallelism; retries on CI |
| react-select custom dropdowns hard to automate | Medium | Low | Use Playwright role selectors + text matching |
| Pagination API limit (500 pages) vs UI showing 56000+ | High | Medium | Test documents as defect; test only first few pages deeply |

## 6. CI Integration Approach

GitHub Actions workflow triggers on push/PR to main:
1. Checkout → Setup Node 18 → `npm ci`
2. `npx playwright install --with-deps chromium`
3. `npm test` (runs full suite)
4. Upload `reports/` and `logs/` as artifacts

See `.github/workflows/test.yml` for implementation.

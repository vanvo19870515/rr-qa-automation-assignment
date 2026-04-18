# Defects Found - TMDB Discover

## DEF-01: Direct deep-link slug returns 404

- **Severity:** High
- **Type:** Routing
- **Area:** Slug refresh / direct navigation

### Steps to reproduce
1. Open `https://tmdb-discover.surge.sh/popular` directly in a new tab.
2. Refresh page or load route directly.

### Expected
SPA route should render discover content for the selected category slug.

### Actual
surge.sh "page not found" (404) page is displayed.

### Screenshot reference
- `test-results/ui-filters-.../test-failed-1.png` (captured by TC06)

---

## DEF-02: Pagination exposes unusable extreme pages

- **Severity:** Medium
- **Type:** Pagination
- **Area:** Last page edge behavior

### Steps to reproduce
1. Open app on Popular category.
2. Observe paginator page range (very large values, > 500).
3. Navigate to high page values near the end of the range.

### Expected
Paginator should respect TMDB API usable limit and avoid broken terminal pages.

### Actual
UI exposes extreme pages and can show error/unstable behavior on last-range pages.

### Screenshot reference
- `test-results/ui-pagination-.../test-failed-1.png` (when high page path fails)

---

## DEF-03: TV type search still uses movie endpoint

- **Severity:** Medium
- **Type:** API mapping
- **Area:** Type + title search

### Steps to reproduce
1. Set Type filter to TV Shows.
2. Search for a TV title (for example "Breaking Bad").
3. Inspect outbound API request URL.

### Expected
Search endpoint should be `/search/tv`.

### Actual
Application calls `/search/movie`.

### Screenshot reference
- API URL evidence logged by `DEF-03` test in `tests/ui/filters.spec.ts`.

---

## DEF-04: Year filter emits unstable/inconsistent query params

- **Severity:** Medium
- **Type:** Filtering
- **Area:** Year range filter

### Steps to reproduce
1. Set year range in filter panel (for example 2020 to 2023).
2. Inspect emitted discover API query params.

### Expected
`release_date.gte` and `release_date.lte` should match selected years consistently.

### Actual
Application intermittently emits invalid/mismatched year params (for example `Invalid Date`).

### Screenshot reference
- `test-results/ui-filters-.../test-failed-1.png` from TC12 retries.


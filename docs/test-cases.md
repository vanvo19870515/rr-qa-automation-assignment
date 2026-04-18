# Test Cases – TMDB Discover

## Format

Each test case uses:
- **ID**
- **Description**
- **Preconditions**
- **Steps**
- **Expected Result**
- **Type** (`UI` / `API` / `E2E`)

---

## TC-UI-001

- **Description:** Home page loads with default Popular category cards.
- **Preconditions:** App is reachable; browser is open.
- **Steps:**
  1. Navigate to `https://tmdb-discover.surge.sh/`.
  2. Wait for initial content load.
  3. Observe URL and visible cards.
- **Expected Result:** URL contains `/popular`; at least one card is visible.
- **Type:** UI

## TC-UI-002

- **Description:** Category switch updates URL and data set.
- **Preconditions:** App loaded on Popular page.
- **Steps:**
  1. Click `Trend` then `Newest` then `Top rated`.
  2. Observe URL and card titles each time.
- **Expected Result:** URL slug and card dataset change per category.
- **Type:** UI

## TC-UI-003

- **Description:** Type filter switches between Movies and TV Shows.
- **Preconditions:** Filter panel visible.
- **Steps:**
  1. Select `TV Shows` in Type filter.
  2. Observe rendered titles.
- **Expected Result:** Results refresh; TV dataset appears.
- **Type:** UI

## TC-UI-004

- **Description:** Year filter valid range updates result set.
- **Preconditions:** Filter panel visible.
- **Steps:**
  1. Select year range `2020–2023`.
  2. Observe query and rendered cards.
- **Expected Result:** Results load; request contains year boundaries or defect annotation is logged for known AUT instability.
- **Type:** UI

## TC-UI-005

- **Description:** Year filter invalid range is handled gracefully.
- **Preconditions:** Filter panel visible.
- **Steps:**
  1. Attempt year range `2026–2020`.
  2. Observe UI behavior.
- **Expected Result:** UI does not crash; either cards, empty state, or error state is shown.
- **Type:** UI

## TC-UI-006

- **Description:** Rating boundary behavior for invalid lower bound.
- **Preconditions:** API key available for full filter assertions.
- **Steps:**
  1. Trigger low-end rating scenario (`<0`) through API-level checks/intercepts.
  2. Observe handled response and UI outcome.
- **Expected Result:** Request/response remains valid or handled gracefully without app crash.
- **Type:** UI

## TC-API-001

- **Description:** Popular endpoint returns schema-valid paginated response.
- **Preconditions:** `TMDB_API_KEY` configured.
- **Steps:**
  1. Call `movie/popular?page=1`.
  2. Validate status code and response schema.
- **Expected Result:** Status 200; valid `page`, `results`, `total_pages`, `total_results`.
- **Type:** API

## TC-API-002

- **Description:** Search endpoint handles non-existent query.
- **Preconditions:** API key configured.
- **Steps:**
  1. Call `search/movie?query=xyz123nonexistent`.
  2. Validate status and payload.
- **Expected Result:** Status 200; `total_results` is 0 and `results` is empty.
- **Type:** API

## TC-E2E-001

- **Description:** Filter + pagination journey preserves data consistency.
- **Preconditions:** App loaded; pagination visible.
- **Steps:**
  1. Apply Type and Genre filters.
  2. Navigate to next page.
  3. Navigate back.
- **Expected Result:** Page indicator and card data stay consistent with intercepted API responses.
- **Type:** E2E

## TC-E2E-002

- **Description:** Last page edge behavior (known bug) is documented.
- **Preconditions:** App loaded with pagination controls.
- **Steps:**
  1. Navigate through pages.
  2. Inspect rendered max page number.
  3. Attempt very high page click.
- **Expected Result:** Known bug reproduced (page range exceeds TMDB cap); defect evidence captured.
- **Type:** E2E

## TC-E2E-003

- **Description:** Invalid category slug refresh/deep-link handling.
- **Preconditions:** App reachable.
- **Steps:**
  1. Open direct slug URL such as `/popular`.
  2. Refresh page.
- **Expected Result:** Known routing defect reproduced (404 on direct slug); documented in defects.
- **Type:** E2E

# Defects Found – TMDB Discover

> Each defect includes **root cause analysis**, **trace evidence** references,
> and the automated test that reproduces it.

---

## DEF-01: Direct URL access returns 404 (surge.sh routing)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | High |
| **Category** | Navigation / Routing |
| **Found by** | TC06 (automated) |
| **Status** | Open |

### Description

Navigating directly to any sub-route (e.g., `/popular`, `/trend`, `/new`, `/top`) returns the surge.sh 404 error page instead of loading the SPA.

### Root Cause

The React SPA uses client-side routing (`react-router` with `BrowserRouter`). surge.sh serves static files and returns 404 for any path that doesn't map to a physical file. The fix is to copy `index.html` → `200.html` in the build output — surge.sh uses `200.html` as the SPA fallback.

**Source reference:** `main.35f21c82.chunk.js` — the app bootstraps with `<BrowserRouter>` and `<Switch>`, expecting the server to serve `index.html` for all routes.

### Steps to Reproduce

1. Open a new browser tab
2. Enter `https://tmdb-discover.surge.sh/popular`
3. Press Enter

### Evidence

| Artifact | Location |
|----------|----------|
| HTTP status | `404` (verified in TC06 step 1) |
| Page title | `"page not found"` (surge.sh error page) |
| Screenshot | `test-results/.../test-failed-1.png` |
| Playwright trace | `test-results/.../trace.zip` (on retry) |

### Recommendation

Add a post-build step: `cp build/index.html build/200.html` before deploying to surge.sh.

---

## DEF-02: Pagination displays page numbers far beyond API limit

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | Medium |
| **Category** | Pagination / Data Integrity |
| **Found by** | TC17 (automated) |
| **Status** | Open |

### Description

The pagination component renders up to ~56,000+ pages. The TMDB API enforces a hard limit of **500 pages** — any `page > 500` returns a 422 error.

### Root Cause

The app passes `total_pages` from the TMDB API response directly to `react-paginate`'s `pageCount` prop without capping it. The TMDB API reports `total_pages: 56000+` for the `movie/popular` endpoint, but will reject requests for pages beyond 500.

**Source reference:** `main.35f21c82.chunk.js` — the `ge` component renders:
```js
Object(R.jsx)(F.a, { pageCount: P.totalPages, ... })
```
where `P.totalPages` is the raw API value (no `Math.min(totalPages, 500)` guard).

### Steps to Reproduce

1. Navigate to `https://tmdb-discover.surge.sh/`
2. Scroll to pagination — observe page numbers 56189, 56190, 56191
3. Click page 56191

### Evidence

| Artifact | Location |
|----------|----------|
| Max page number | `56204` (logged in TC17 step 2) |
| Error on high page | "Something went wrong" (TC17 step 3) |
| API error | `422 Unprocessable Entity` for `page > 500` |
| Trace | `test-results/.../trace.zip` |

### Recommendation

```js
pageCount: Math.min(totalPages, 500)
```

---

## DEF-03: TV Shows search uses wrong API endpoint

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | Medium |
| **Category** | Search / API Integration |
| **Found by** | DEF-03 test (automated) + code review |
| **Status** | Open |

### Description

When the Type filter is set to "TV Shows" and a search query is entered, the app calls `search/movie` instead of `search/tv`. TV-specific results (e.g., "Breaking Bad") are never returned.

### Root Cause

In the minified source (`main.35f21c82.chunk.js`), the TV search handler function `se()` calls:
```js
B.get("search/movie", { params: { query: t, page: a } })
```
This is identical to the movie search handler `W()`. It should be:
```js
B.get("search/tv", { params: { query: t, page: a } })
```

### Steps to Reproduce

1. Navigate to home page
2. Select **TV Shows** from the Type dropdown
3. Type "Breaking Bad" in the search field

### Evidence

| Artifact | Location |
|----------|----------|
| Intercepted URL | `search/movie?query=Breaking+Bad` (logged in DEF-03 step 2) |
| Expected URL | `search/tv?query=Breaking+Bad` |
| Trace | `test-results/.../trace.zip` |

### Recommendation

Fix the `se()` function to call `B.get("search/tv", ...)`.

---

## DEF-04: Year filter defaults to 1900 (confusing UX)

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | Low |
| **Category** | UX / Filters |
| **Found by** | Exploratory testing |
| **Status** | Open |

### Description

The Year range filter defaults to **1900–2026**. While functionally correct (all movies are fetched), the 1900 default is misleading.

### Root Cause

The Redux initial state sets `year: [1900, (new Date).getFullYear()]` and the react-select options are generated via `range(1900, currentYear)`. There is no "All years" label — the raw numeric boundary is displayed.

**Source reference:** `main.35f21c82.chunk.js` — initial state:
```js
initialState: { year: [1900, (new Date).getFullYear()], ... }
```

### Recommendation

Either display "All years" when the default range is active, or default to a recent decade (e.g., 2015–current).

---

## DEF-05: Pagination absent for Trend / Newest / Top Rated categories

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | Low |
| **Category** | Pagination / Navigation |
| **Found by** | TC16c (automated) |
| **Status** | Open |

### Description

Switching to Trend, Newest, or Top Rated categories renders content but may not display the pagination component, despite the API returning `total_pages > 1` for these endpoints.

### Root Cause

The app's main content component (`ge`) conditionally renders `react-paginate` only when `P.totalPages > 0`. However, the `trending/movie/week` endpoint returns paginated data that should support navigation. The issue is that the component re-renders asynchronously and the pagination may not mount before the content area settles.

**Source reference:** The component checks `P.totalPages` after setting state from the API response. A race condition between React state updates and the render cycle can cause the paginator to briefly unmount during category switches.

### Evidence

| Artifact | Location |
|----------|----------|
| TC16c log | `Trend pagination visible: true/false` (varies) |
| Trend card count | 20 cards loaded (TC16c step 3) |
| Trace | `test-results/.../trace.zip` |

### Recommendation

Ensure `react-paginate` is always rendered when `totalPages > 1`, regardless of category switch timing.

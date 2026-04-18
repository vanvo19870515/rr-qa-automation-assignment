# Test Cases – TMDB Discover

## Legend

- **P** = Positive test
- **N** = Negative test
- **API** = Includes API response validation

---

## TC01 – Home page loads successfully (P, API)

**Objective:** Verify the SPA loads and displays movie cards.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `https://tmdb-discover.surge.sh/` | Page redirects to `/popular` |
| 2 | Wait for network idle | TMDB API `movie/popular?page=1` returns 200 |
| 3 | Count movie cards | At least 1 card is visible |
| 4 | Read first movie title | Title is a non-empty string |

---

## TC02 – Filter by Category: Popular (P, API)

**Objective:** Clicking "Popular" tab loads popular movies.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load home page | Default category is Popular |
| 2 | Click "Popular" link | URL contains `/popular` |
| 3 | Intercept API response | `movie/popular` returns results.length > 0 |
| 4 | Verify cards displayed | Movie cards are visible |

---

## TC03 – Filter by Category: Trend (P, API)

**Objective:** "Trend" tab loads trending movies from a different API endpoint.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load home page, note Popular titles | — |
| 2 | Click "Trend" | URL changes to `/trend` |
| 3 | Intercept API | `trending/movie/week` returns results |
| 4 | Compare titles | Content differs from Popular |

---

## TC04 – Filter by Category: Newest (P, API)

**Objective:** "Newest" tab loads now-playing movies.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Newest" | URL changes to `/new` |
| 2 | Intercept API | `movie/now_playing` returns results |
| 3 | Verify cards | Movies are displayed |

---

## TC05 – Filter by Category: Top Rated (P, API)

**Objective:** "Top Rated" tab loads top-rated movies.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Top rated" | URL changes to `/top` |
| 2 | Intercept API | `movie/top_rated` returns results |
| 3 | Verify cards | Movies are displayed |

---

## TC06 – Negative: Direct slug access (N)

**Objective:** Verify known defect—direct navigation to `/popular` fails.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate directly to `https://tmdb-discover.surge.sh/popular` | Page returns 404 |
| 2 | Check page title | Title is "page not found" (surge.sh error page) |

**Known Defect:** DEF-01

---

## TC07 – Search by exact title (P, API)

**Objective:** Title search returns matching results.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "Inception" in SEARCH field | Debounce triggers after ~1.5s |
| 2 | Intercept API | `search/movie?query=Inception` returns results |
| 3 | Verify titles | At least one title contains "Inception" |

---

## TC08 – Search with no matching results (P, API)

**Objective:** Non-existent query shows "No results found."

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "xyz123nonexistent" | — |
| 2 | Intercept API | `search/movie` returns `total_results: 0` |
| 3 | Verify UI | "No results found." message is visible |

---

## TC09 – Filter by Type: Movie (default) (P, API)

**Objective:** Default type is Movie, verified via API.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load home page | Default shows Movie type |
| 2 | Direct API call to `movie/popular` | Returns movie results |
| 3 | Count cards | Cards > 0 |

---

## TC10 – Filter by Type: TV Shows (P, API)

**Objective:** Switching type to TV Shows loads TV content.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "TV Shows" from Type dropdown | — |
| 2 | Intercept API | `tv/popular` returns results |
| 3 | Verify cards | TV show titles displayed |

---

## TC11 – Filter by Genre: Action (P, API)

**Objective:** Genre filter restricts results to the selected genre.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Action" genre | — |
| 2 | Intercept API | `discover/movie?with_genres=28` |
| 3 | Assert API data | Every result's `genre_ids` includes 28 |

---

## TC13 – Filter by Rating (P, API)

**Objective:** Star rating filter sends correct API parameters.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click 3rd star | — |
| 2 | Intercept API | `discover/movie` with `vote_average.gte` parameter |
| 3 | Assert results | Results returned from API |

---

## TC15 – Combined filters: Genre + Rating (P, API)

**Objective:** Multiple filters apply simultaneously.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select Genre "Action" | Filter applied |
| 2 | Select Rating 3 stars | Second filter applied |
| 3 | Intercept API | `discover/movie` with `with_genres` AND `vote_average.gte` |
| 4 | Assert API results | All results match both filters |

---

## TC16 – Pagination: Navigate to page 2 (P, API)

**Objective:** Page 2 shows different content than page 1.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note page 1 titles | — |
| 2 | Click "Next page" | — |
| 3 | Intercept API | `movie/popular?page=2` returns results |
| 4 | Compare titles | Page 2 titles differ from page 1 |

---

## TC16b – Pagination: Forward and backward (P, API)

**Objective:** Previous page button returns to correct content.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to page 2, note titles | — |
| 2 | Go to page 3 | Different content |
| 3 | Go back to page 2 | Same titles as step 1 |

---

## TC16c – Pagination visibility per category (P)

**Objective:** Pagination appears for Popular but may not for Trend.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Popular page | Pagination is visible |
| 2 | Switch to Trend | Check pagination visibility |

---

## TC17 – Pagination: High page numbers (N)

**Objective:** Verify known defect—UI shows 56000+ pages but API max is 500.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate pages 2–5 | All succeed |
| 2 | Note UI shows pages > 56000 | — |
| 3 | Click a high page number | Error or empty results |

**Known Defect:** DEF-02

---

## TC18 – Pagination resets on category change (P, API)

**Objective:** Switching category resets to page 1.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page 2 | Current page = 2 |
| 2 | Switch to "Top rated" | — |
| 3 | Intercept API | Request for page=1 |
| 4 | Verify current page | Page indicator = 1 |

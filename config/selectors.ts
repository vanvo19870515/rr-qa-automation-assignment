/**
 * Centralized selector catalog.
 * We prefer data-testid first, then keep resilient fallback selectors
 * so tests continue to work until test IDs are fully available in app code.
 */
export const SELECTORS = {
  navbar: {
    searchInput: '[data-testid="search-input"], input[placeholder="SEARCH"]',
  },
  filterPanel: {
    container: '[data-testid="filter-panel"], aside',
    genericInput: '[data-testid="filter-input"], aside input',
    option: '[data-testid="filter-option"], [class*="option"]',
    menu: '[data-testid="filter-menu"], [class*="menu"]',
    ratingOption: '[data-testid="rating-option"], [role="radio"]',
  },
  results: {
    cards: '[data-testid="movie-card"], .grid > div',
    titles: '[data-testid="movie-title"], .grid > div .text-blue-500.font-bold',
    meta: '[data-testid="movie-meta"], .grid > div .text-gray-500.font-light',
    noResults: '[data-testid="no-results"], text=No results found.',
    errorMessage: '[data-testid="error-message"], text=Something went wrong',
  },
  pagination: {
    container: '[data-testid="pagination"], #react-paginate',
    previousButton: '[data-testid="pagination-prev"], button[aria-label="Previous page"]',
    nextButton: '[data-testid="pagination-next"], button[aria-label="Next page"]',
    currentIndicator:
      '[data-testid="pagination-current"], li.selected a, button[aria-current="page"], [aria-label*="is your current page"]',
  },
} as const;

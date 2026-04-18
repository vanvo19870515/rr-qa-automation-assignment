export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
  poster_path: string | null;
}

export interface TmdbPageResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbItem[];
}

export interface TmdbGenreList {
  genres: { id: number; name: string }[];
}

export interface TmdbErrorResponse {
  status_message: string;
  status_code: number;
}

export { TmdbService } from '../../../services/api/tmdb.service';
export { ApiClient } from '../../../services/api/client/api-client';
export type {
  TmdbPageResponse,
  TmdbGenreList,
  TmdbItem,
} from '../../../services/api/models/tmdb.models';
export {
  assertTmdbGenreList,
  assertTmdbPageResponse,
} from '../../../services/api/validators/tmdb.validators';

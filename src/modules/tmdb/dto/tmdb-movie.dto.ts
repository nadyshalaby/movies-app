export interface TmdbMovieDto {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
}

export interface TmdbMovieDetailsDto extends TmdbMovieDto {
  genres: TmdbGenreDto[];
  spoken_languages: TmdbSpokenLanguageDto[];
  production_countries: TmdbProductionCountryDto[];
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  homepage: string;
  imdb_id: string;
}

export interface TmdbGenreDto {
  id: number;
  name: string;
}

export interface TmdbSpokenLanguageDto {
  iso_639_1: string;
  name: string;
}

export interface TmdbProductionCountryDto {
  iso_3166_1: string;
  name: string;
}

export interface TmdbMovieSearchResponse {
  page: number;
  results: TmdbMovieDto[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenreResponse {
  genres: TmdbGenreDto[];
}
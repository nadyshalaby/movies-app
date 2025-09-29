import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  TmdbMovieDto,
  TmdbMovieDetailsDto,
  TmdbMovieSearchResponse,
  TmdbGenreResponse,
} from './dto/tmdb-movie.dto';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('tmdb.apiKey') || '';
    this.baseUrl = this.configService.get<string>('tmdb.baseUrl') || 'https://api.themoviedb.org/3';

    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      params: {
        api_key: this.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making TMDB API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`TMDB API response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      },
    );
  }

  async searchMovies(
    query: string,
    page: number = 1,
    year?: number,
  ): Promise<TmdbMovieSearchResponse> {
    try {
      const params: any = {
        query,
        page,
        include_adult: false,
      };

      if (year) {
        params.year = year;
      }

      const response: AxiosResponse<TmdbMovieSearchResponse> = await this.httpClient.get(
        '/search/movie',
        { params },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to search movies: ${error.message}`);
      throw new BadRequestException('Failed to search movies from TMDB');
    }
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetailsDto> {
    try {
      const response: AxiosResponse<TmdbMovieDetailsDto> = await this.httpClient.get(
        `/movie/${tmdbId}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get movie details for ID ${tmdbId}: ${error.message}`);
      throw new BadRequestException(`Failed to get movie details from TMDB`);
    }
  }

  async getPopularMovies(page: number = 1): Promise<TmdbMovieSearchResponse> {
    try {
      const response: AxiosResponse<TmdbMovieSearchResponse> = await this.httpClient.get(
        '/movie/popular',
        { params: { page } },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get popular movies: ${error.message}`);
      throw new BadRequestException('Failed to get popular movies from TMDB');
    }
  }

  async getTopRatedMovies(page: number = 1): Promise<TmdbMovieSearchResponse> {
    try {
      const response: AxiosResponse<TmdbMovieSearchResponse> = await this.httpClient.get(
        '/movie/top_rated',
        { params: { page } },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get top-rated movies: ${error.message}`);
      throw new BadRequestException('Failed to get top-rated movies from TMDB');
    }
  }

  async getNowPlayingMovies(page: number = 1): Promise<TmdbMovieSearchResponse> {
    try {
      const response: AxiosResponse<TmdbMovieSearchResponse> = await this.httpClient.get(
        '/movie/now_playing',
        { params: { page } },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get now playing movies: ${error.message}`);
      throw new BadRequestException('Failed to get now playing movies from TMDB');
    }
  }

  async getUpcomingMovies(page: number = 1): Promise<TmdbMovieSearchResponse> {
    try {
      const response: AxiosResponse<TmdbMovieSearchResponse> = await this.httpClient.get(
        '/movie/upcoming',
        { params: { page } },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get upcoming movies: ${error.message}`);
      throw new BadRequestException('Failed to get upcoming movies from TMDB');
    }
  }

  async getGenres(): Promise<TmdbGenreResponse> {
    try {
      const response: AxiosResponse<TmdbGenreResponse> = await this.httpClient.get(
        '/genre/movie/list',
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get genres: ${error.message}`);
      throw new BadRequestException('Failed to get genres from TMDB');
    }
  }

  async discoverMovies(params: {
    page?: number;
    genreIds?: number[];
    sortBy?: string;
    releaseYear?: number;
    minRating?: number;
  }): Promise<TmdbMovieSearchResponse> {
    try {
      const queryParams: any = {
        page: params.page || 1,
        include_adult: false,
      };

      if (params.genreIds && params.genreIds.length > 0) {
        queryParams.with_genres = params.genreIds.join(',');
      }

      if (params.sortBy) {
        queryParams.sort_by = params.sortBy;
      }

      if (params.releaseYear) {
        queryParams.year = params.releaseYear;
      }

      if (params.minRating) {
        queryParams['vote_average.gte'] = params.minRating;
      }

      const response: AxiosResponse<TmdbMovieSearchResponse> = await this.httpClient.get(
        '/discover/movie',
        { params: queryParams },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to discover movies: ${error.message}`);
      throw new BadRequestException('Failed to discover movies from TMDB');
    }
  }

  getImageUrl(path: string, size: string = 'w500'): string {
    const imageBaseUrl = this.configService.get<string>('tmdb.imageBaseUrl');
    return `${imageBaseUrl}/${size}${path}`;
  }
}
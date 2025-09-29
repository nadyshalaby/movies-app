import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Movie } from '../../../database/entities/movie.entity';
import { Genre } from '../../../database/entities/genre.entity';

export class GenreResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  tmdbId: number;

  constructor(genre?: Genre) {
    if (genre) {
      Object.assign(this, genre);
    }
  }
}

export class MovieResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  tmdbId: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  originalTitle?: string;

  @ApiProperty()
  @Expose()
  overview: string;

  @ApiPropertyOptional()
  @Expose()
  releaseDate?: Date;

  @ApiProperty()
  @Expose()
  voteAverage: number;

  @ApiProperty()
  @Expose()
  voteCount: number;

  @ApiProperty()
  @Expose()
  popularity: number;

  @ApiPropertyOptional()
  @Expose()
  posterPath?: string;

  @ApiPropertyOptional()
  @Expose()
  backdropPath?: string;

  @ApiProperty()
  @Expose()
  adult: boolean;

  @ApiPropertyOptional()
  @Expose()
  originalLanguage?: string;

  @ApiPropertyOptional()
  @Expose()
  spokenLanguages?: string[];

  @ApiPropertyOptional()
  @Expose()
  productionCountries?: string[];

  @ApiPropertyOptional()
  @Expose()
  budget?: number;

  @ApiPropertyOptional()
  @Expose()
  revenue?: number;

  @ApiPropertyOptional()
  @Expose()
  runtime?: number;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiPropertyOptional()
  @Expose()
  tagline?: string;

  @ApiPropertyOptional()
  @Expose()
  homepage?: string;

  @ApiPropertyOptional()
  @Expose()
  imdbId?: string;

  @ApiProperty()
  @Expose()
  averageRating: number;

  @ApiProperty()
  @Expose()
  ratingsCount: number;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  lastSyncedAt?: Date;

  @ApiPropertyOptional({ type: [GenreResponseDto] })
  @Expose()
  @Type(() => GenreResponseDto)
  genres?: GenreResponseDto[];

  @ApiPropertyOptional()
  @Expose()
  get fullPosterUrl(): string | null {
    return this.posterPath
      ? `${process.env.TMDB_IMAGE_BASE_URL}/w500${this.posterPath}`
      : null;
  }

  @ApiPropertyOptional()
  @Expose()
  get fullBackdropUrl(): string | null {
    return this.backdropPath
      ? `${process.env.TMDB_IMAGE_BASE_URL}/w1280${this.backdropPath}`
      : null;
  }

  constructor(movie: Movie) {
    // Copy all enumerable properties except getter-only properties
    const { fullPosterUrl, fullBackdropUrl, ...movieProps } = movie as any;
    Object.assign(this, movieProps);

    // Handle genres mapping
    if (movie.movieGenres) {
      this.genres = movie.movieGenres.map(mg => new GenreResponseDto(mg.genre));
    }
  }
}
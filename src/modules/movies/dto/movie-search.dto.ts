import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsArray, Min, Max, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum MovieSortBy {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  RELEASE_DATE_ASC = 'release_date_asc',
  RELEASE_DATE_DESC = 'release_date_desc',
  RATING_ASC = 'rating_asc',
  RATING_DESC = 'rating_desc',
  POPULARITY_ASC = 'popularity_asc',
  POPULARITY_DESC = 'popularity_desc',
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
}

export class MovieSearchDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by movie title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by genre IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  genreIds?: number[];

  @ApiPropertyOptional({ description: 'Filter by release year' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: 'Minimum rating (0-10)', minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum rating (0-10)', minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  maxRating?: number;

  @ApiPropertyOptional({ enum: MovieSortBy, description: 'Sort movies by' })
  @IsOptional()
  @IsEnum(MovieSortBy)
  sortBy?: MovieSortBy;

  @ApiPropertyOptional({ description: 'Filter by original language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Include adult content', default: false })
  @IsOptional()
  @Type(() => Boolean)
  includeAdult?: boolean = false;
}

export class TmdbSearchDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search query for TMDB' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Release year for TMDB search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(2100)
  year?: number;
}
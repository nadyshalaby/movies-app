import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDate, IsEnum, IsArray, IsUrl, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MovieStatus } from '../../../database/entities/movie.entity';

export class CreateMovieDto {
  @ApiProperty({ example: 550, description: 'TMDB movie ID' })
  @IsNumber()
  tmdbId: number;

  @ApiProperty({ example: 'Fight Club', description: 'Movie title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Fight Club', description: 'Original movie title' })
  @IsOptional()
  @IsString()
  originalTitle?: string;

  @ApiProperty({
    example: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    description: 'Movie overview/description'
  })
  @IsString()
  overview: string;

  @ApiPropertyOptional({ example: '1999-10-15', description: 'Release date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  releaseDate?: Date;

  @ApiPropertyOptional({ example: 8.8, description: 'TMDB vote average' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  voteAverage?: number;

  @ApiPropertyOptional({ example: 26280, description: 'TMDB vote count' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  voteCount?: number;

  @ApiPropertyOptional({ example: 63.416, description: 'TMDB popularity score' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  popularity?: number;

  @ApiPropertyOptional({ example: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', description: 'Poster path from TMDB' })
  @IsOptional()
  @IsString()
  posterPath?: string;

  @ApiPropertyOptional({ example: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg', description: 'Backdrop path from TMDB' })
  @IsOptional()
  @IsString()
  backdropPath?: string;

  @ApiPropertyOptional({ example: false, description: 'Is adult content' })
  @IsOptional()
  @IsBoolean()
  adult?: boolean;

  @ApiPropertyOptional({ example: 'en', description: 'Original language ISO code' })
  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @ApiPropertyOptional({ example: ['English'], description: 'Spoken languages' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  spokenLanguages?: string[];

  @ApiPropertyOptional({ example: ['United States of America'], description: 'Production countries' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productionCountries?: string[];

  @ApiPropertyOptional({ example: 63000000, description: 'Movie budget in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: 100853753, description: 'Movie revenue in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @ApiPropertyOptional({ example: 139, description: 'Runtime in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  runtime?: number;

  @ApiPropertyOptional({ enum: MovieStatus, description: 'Movie status' })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @ApiPropertyOptional({ example: 'Mischief. Mayhem. Soap.', description: 'Movie tagline' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ example: 'https://www.foxmovies.com/movies/fight-club', description: 'Official homepage URL' })
  @IsOptional()
  @IsUrl()
  homepage?: string;

  @ApiPropertyOptional({ example: 'tt0137523', description: 'IMDb ID' })
  @IsOptional()
  @IsString()
  imdbId?: string;

  @ApiPropertyOptional({ example: [18, 53], description: 'Array of genre IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds?: number[];
}
import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends PartialType(
  OmitType(CreateMovieDto, ['tmdbId'] as const),
) {
  @ApiPropertyOptional({ description: 'Last TMDB sync timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastSyncedAt?: Date;
}
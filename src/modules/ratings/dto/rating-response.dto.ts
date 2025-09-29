import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Rating } from '../../../database/entities/rating.entity';
import { MovieResponseDto } from '../../movies/dto/movie-response.dto';

export class UserSummaryDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiPropertyOptional()
  @Expose()
  avatarUrl?: string;

  @ApiProperty()
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export class RatingResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  movieId: string;

  @ApiProperty()
  @Expose()
  rating: number;

  @ApiPropertyOptional()
  @Expose()
  review?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ type: UserSummaryDto })
  @Expose()
  @Type(() => UserSummaryDto)
  user?: UserSummaryDto;

  @ApiPropertyOptional({ type: MovieResponseDto })
  @Expose()
  @Type(() => MovieResponseDto)
  movie?: MovieResponseDto;

  constructor(rating: Rating) {
    Object.assign(this, rating);
  }
}
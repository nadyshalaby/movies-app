import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ description: 'Movie UUID' })
  @IsUUID()
  movieId: string;

  @ApiProperty({
    description: 'Rating value (0.0 to 10.0)',
    minimum: 0.0,
    maximum: 10.0,
    example: 8.5,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0.0)
  @Max(10.0)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional review text',
    example: 'Great movie with excellent cinematography!',
  })
  @IsOptional()
  @IsString()
  review?: string;
}
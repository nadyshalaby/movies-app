import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';

export class UpdateRatingDto extends PartialType(
  OmitType(CreateRatingDto, ['movieId'] as const),
) {}
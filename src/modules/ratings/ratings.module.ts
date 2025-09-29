import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from '../../database/entities/rating.entity';
import { Movie } from '../../database/entities/movie.entity';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating, Movie]),
    MoviesModule,
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
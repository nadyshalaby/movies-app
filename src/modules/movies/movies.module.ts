import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from '../../database/entities/movie.entity';
import { Genre } from '../../database/entities/genre.entity';
import { MovieGenre } from '../../database/entities/movie-genre.entity';
import { TmdbModule } from '../tmdb/tmdb.module';
// import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Genre, MovieGenre]),
    TmdbModule,
    // CacheModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
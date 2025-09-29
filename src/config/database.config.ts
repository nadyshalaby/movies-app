import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Movie } from '../database/entities/movie.entity';
import { Genre } from '../database/entities/genre.entity';
import { Rating } from '../database/entities/rating.entity';
import { Watchlist } from '../database/entities/watchlist.entity';
import { MovieGenre } from '../database/entities/movie-genre.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'movies_user',
    password: process.env.DB_PASSWORD || 'movies_password',
    database: process.env.DB_DATABASE || 'movies_db',
    entities: [User, Movie, Genre, Rating, Watchlist, MovieGenre],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    logging: process.env.DB_LOGGING === 'true' || false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    retryAttempts: 5,
    retryDelay: 3000,
  }),
);
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { User } from './entities/user.entity';
import { Movie } from './entities/movie.entity';
import { Genre } from './entities/genre.entity';
import { Rating } from './entities/rating.entity';
import { Watchlist } from './entities/watchlist.entity';
import { MovieGenre } from './entities/movie-genre.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'movies_user',
  password: process.env.DB_PASSWORD || 'movies_password',
  database: process.env.DB_DATABASE || 'movies_db',
  entities: [User, Movie, Genre, Rating, Watchlist, MovieGenre],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Movie } from './movie.entity';
import { Genre } from './genre.entity';

@Entity('movie_genres')
@Index(['movieId', 'genreId'], { unique: true })
export class MovieGenre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  movieId: string;

  @Column()
  genreId: string;

  @ManyToOne(() => Movie, (movie) => movie.movieGenres, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @ManyToOne(() => Genre, (genre) => genre.movieGenres, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @CreateDateColumn()
  createdAt: Date;
}
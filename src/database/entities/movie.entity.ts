import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Rating } from './rating.entity';
import { Watchlist } from './watchlist.entity';
import { MovieGenre } from './movie-genre.entity';

export enum MovieStatus {
  RUMORED = 'rumored',
  PLANNED = 'planned',
  IN_PRODUCTION = 'in_production',
  POST_PRODUCTION = 'post_production',
  RELEASED = 'released',
  CANCELED = 'canceled',
}

@Entity('movies')
@Index(['tmdbId'], { unique: true })
@Index(['title'])
@Index(['releaseDate'])
@Index(['popularity'])
@Index(['voteAverage'])
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tmdbId: number;

  @Column({ length: 500 })
  title: string;

  @Column({ length: 500, nullable: true })
  originalTitle?: string;

  @Column({ type: 'text' })
  overview: string;

  @Column({ type: 'date', nullable: true })
  releaseDate?: Date;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  voteAverage: number;

  @Column({ default: 0 })
  voteCount: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, default: 0 })
  popularity: number;

  @Column({ nullable: true })
  posterPath?: string;

  @Column({ nullable: true })
  backdropPath?: string;

  @Column({ default: false })
  adult: boolean;

  @Column({ length: 10, nullable: true })
  originalLanguage?: string;

  @Column({ type: 'simple-array', nullable: true })
  spokenLanguages?: string[];

  @Column({ type: 'simple-array', nullable: true })
  productionCountries?: string[];

  @Column({ type: 'bigint', nullable: true })
  budget?: number;

  @Column({ type: 'bigint', nullable: true })
  revenue?: number;

  @Column({ nullable: true })
  runtime?: number;

  @Column({
    type: 'enum',
    enum: MovieStatus,
    default: MovieStatus.RELEASED,
  })
  status: MovieStatus;

  @Column({ nullable: true })
  tagline?: string;

  @Column({ nullable: true })
  homepage?: string;

  @Column({ nullable: true })
  imdbId?: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  ratingsCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastSyncedAt?: Date;

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.movie)
  watchlists: Watchlist[];

  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.movie)
  movieGenres: MovieGenre[];

  get fullPosterUrl(): string | null {
    return this.posterPath
      ? `${process.env.TMDB_IMAGE_BASE_URL}/w500${this.posterPath}`
      : null;
  }

  get fullBackdropUrl(): string | null {
    return this.backdropPath
      ? `${process.env.TMDB_IMAGE_BASE_URL}/w1280${this.backdropPath}`
      : null;
  }
}
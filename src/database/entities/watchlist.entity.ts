import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Movie } from './movie.entity';

export enum WatchlistStatus {
  WANT_TO_WATCH = 'want_to_watch',
  WATCHING = 'watching',
  WATCHED = 'watched',
  DROPPED = 'dropped',
  ON_HOLD = 'on_hold',
}

@Entity('watchlists')
@Index(['userId', 'movieId'], { unique: true })
@Index(['status'])
export class Watchlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  movieId: string;

  @Column({
    type: 'enum',
    enum: WatchlistStatus,
    default: WatchlistStatus.WANT_TO_WATCH,
  })
  status: WatchlistStatus;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'date', nullable: true })
  watchedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.watchlists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.watchlists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;
}
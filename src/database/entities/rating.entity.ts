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

@Entity('ratings')
@Index(['userId', 'movieId'], { unique: true })
@Index(['rating'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  movieId: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number; // 0.0 to 10.0

  @Column({ type: 'text', nullable: true })
  review?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.ratings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.ratings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;
}
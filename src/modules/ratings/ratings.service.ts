import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../../database/entities/rating.entity';
import { User } from '../../database/entities/user.entity';
import { Movie } from '../../database/entities/movie.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private moviesService: MoviesService,
  ) {}

  async create(
    createRatingDto: CreateRatingDto,
    userId: string,
  ): Promise<RatingResponseDto> {
    // Check if movie exists
    const movie = await this.movieRepository.findOne({
      where: { id: createRatingDto.movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // Check if user already rated this movie
    const existingRating = await this.ratingRepository.findOne({
      where: {
        userId,
        movieId: createRatingDto.movieId,
      },
    });

    if (existingRating) {
      throw new ConflictException('You have already rated this movie');
    }

    try {
      const rating = this.ratingRepository.create({
        ...createRatingDto,
        userId,
      });

      const savedRating = await this.ratingRepository.save(rating);

      // Update movie rating statistics
      await this.moviesService.updateRatingStats(createRatingDto.movieId);

      const createdRating = await this.findByIdWithRelations(savedRating.id);
      if (!createdRating) {
        throw new NotFoundException('Rating not found after creation');
      }
      return new RatingResponseDto(createdRating);
    } catch (error) {
      this.logger.error(`Failed to create rating: ${error.message}`);
      throw new BadRequestException('Failed to create rating');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<RatingResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [ratings, total] = await this.ratingRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user', 'movie'],
    });

    const ratingDtos = ratings.map(rating => new RatingResponseDto(rating));
    return new PaginatedResponseDto(ratingDtos, page, limit, total);
  }

  async findByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<RatingResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['movie'],
    });

    const ratingDtos = ratings.map(rating => new RatingResponseDto(rating));
    return new PaginatedResponseDto(ratingDtos, page, limit, total);
  }

  async findByMovieId(
    movieId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<RatingResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { movieId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    const ratingDtos = ratings.map(rating => new RatingResponseDto(rating));
    return new PaginatedResponseDto(ratingDtos, page, limit, total);
  }

  async findById(id: string): Promise<RatingResponseDto> {
    const rating = await this.findByIdWithRelations(id);
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return new RatingResponseDto(rating);
  }

  async findUserRatingForMovie(
    userId: string,
    movieId: string,
  ): Promise<RatingResponseDto | null> {
    const rating = await this.ratingRepository.findOne({
      where: { userId, movieId },
      relations: ['movie'],
    });

    return rating ? new RatingResponseDto(rating) : null;
  }

  async update(
    id: string,
    updateRatingDto: UpdateRatingDto,
    userId: string,
  ): Promise<RatingResponseDto> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    try {
      await this.ratingRepository.update(id, updateRatingDto);

      // Update movie rating statistics
      await this.moviesService.updateRatingStats(rating.movieId);

      const updatedRating = await this.findByIdWithRelations(id);
      if (!updatedRating) {
        throw new NotFoundException('Rating not found after update');
      }
      return new RatingResponseDto(updatedRating);
    } catch (error) {
      this.logger.error(`Failed to update rating: ${error.message}`);
      throw new BadRequestException('Failed to update rating');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    try {
      await this.ratingRepository.delete(id);

      // Update movie rating statistics
      await this.moviesService.updateRatingStats(rating.movieId);
    } catch (error) {
      this.logger.error(`Failed to delete rating: ${error.message}`);
      throw new BadRequestException('Failed to delete rating');
    }
  }

  async getMovieRatingStats(movieId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const stats = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'averageRating')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .where('rating.movieId = :movieId', { movieId })
      .getRawOne();

    const distribution = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('FLOOR(rating.rating)', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('rating.movieId = :movieId', { movieId })
      .groupBy('FLOOR(rating.rating)')
      .orderBy('rating', 'ASC')
      .getRawMany();

    return {
      averageRating: parseFloat(stats.averageRating) || 0,
      totalRatings: parseInt(stats.totalRatings) || 0,
      ratingDistribution: distribution.map(item => ({
        rating: parseInt(item.rating),
        count: parseInt(item.count),
      })),
    };
  }

  private async findByIdWithRelations(id: string): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { id },
      relations: ['user', 'movie'],
    });
  }
}
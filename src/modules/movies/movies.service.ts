import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
import { Movie } from '../../database/entities/movie.entity';
import { Genre } from '../../database/entities/genre.entity';
import { MovieGenre } from '../../database/entities/movie-genre.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieSearchDto, MovieSortBy, TmdbSearchDto } from './dto/movie-search.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { TmdbService } from '../tmdb/tmdb.service';
import { TmdbMovieDto, TmdbMovieDetailsDto } from '../tmdb/dto/tmdb-movie.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    @InjectRepository(MovieGenre)
    private movieGenreRepository: Repository<MovieGenre>,
    private tmdbService: TmdbService,
    // @Inject(CACHE_MANAGER)
    // private cacheManager: Cache,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<MovieResponseDto> {
    const existingMovie = await this.findByTmdbId(createMovieDto.tmdbId);
    if (existingMovie) {
      throw new ConflictException('Movie with this TMDB ID already exists');
    }

    try {
      const movie = this.movieRepository.create(createMovieDto);
      const savedMovie = await this.movieRepository.save(movie);

      // Handle genres if provided
      if (createMovieDto.genreIds && createMovieDto.genreIds.length > 0) {
        await this.updateMovieGenres(savedMovie.id, createMovieDto.genreIds);
      }

      // TODO: Clear cache
      // await this.clearMoviesCache();

      const movieWithGenres = await this.findByIdWithGenres(savedMovie.id);
      if (!movieWithGenres) {
        throw new NotFoundException('Movie not found after creation');
      }
      return new MovieResponseDto(movieWithGenres);
    } catch (error) {
      this.logger.error(`Failed to create movie: ${error.message}`);
      throw new BadRequestException('Failed to create movie');
    }
  }

  async findAll(searchDto: MovieSearchDto): Promise<PaginatedResponseDto<MovieResponseDto>> {
    const { page = 1, limit = 10 } = searchDto;
    const skip = (page - 1) * limit;

    // TODO: Implement caching
    // const cacheKey = `movies:search:${JSON.stringify(searchDto)}`;
    // const cached = await this.cacheManager.get(cacheKey);
    // if (cached) {
    //   return cached as PaginatedResponseDto<MovieResponseDto>;
    // }

    const queryBuilder = this.buildSearchQuery(searchDto);

    const [movies, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const movieDtos = movies.map(movie => new MovieResponseDto(movie));
    const result = new PaginatedResponseDto(movieDtos, page, limit, total);

    // TODO: Cache for 5 minutes
    // await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async findById(id: string): Promise<MovieResponseDto> {
    const movie = await this.findByIdWithGenres(id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return new MovieResponseDto(movie);
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    return this.movieRepository.findOne({
      where: { tmdbId },
      relations: ['movieGenres', 'movieGenres.genre'],
    });
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<MovieResponseDto> {
    const movie = await this.findByIdWithGenres(id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    try {
      await this.movieRepository.update(id, updateMovieDto);

      // Handle genre updates if provided
      if (updateMovieDto.genreIds !== undefined) {
        await this.updateMovieGenres(id, updateMovieDto.genreIds);
      }

      // TODO: Clear cache
      // await this.clearMoviesCache();

      const updatedMovie = await this.findByIdWithGenres(id);
      if (!updatedMovie) {
        throw new NotFoundException('Movie not found after update');
      }
      return new MovieResponseDto(updatedMovie);
    } catch (error) {
      this.logger.error(`Failed to update movie: ${error.message}`);
      throw new BadRequestException('Failed to update movie');
    }
  }

  async remove(id: string): Promise<void> {
    const movie = await this.findByIdWithGenres(id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    try {
      await this.movieRepository.softDelete(id);
      // await this.clearMoviesCache();
    } catch (error) {
      this.logger.error(`Failed to delete movie: ${error.message}`);
      throw new BadRequestException('Failed to delete movie');
    }
  }

  async syncFromTmdb(tmdbId: number): Promise<MovieResponseDto> {
    try {
      const tmdbMovie = await this.tmdbService.getMovieDetails(tmdbId);

      let movie = await this.findByTmdbId(tmdbId);

      if (movie) {
        // Update existing movie
        const updateDto = this.mapTmdbToUpdateDto(tmdbMovie);
        return await this.update(movie.id, updateDto);
      } else {
        // Create new movie
        const createDto = this.mapTmdbToCreateDto(tmdbMovie);
        return this.create(createDto);
      }
    } catch (error) {
      this.logger.error(`Failed to sync movie from TMDB: ${error.message}`);
      throw new BadRequestException('Failed to sync movie from TMDB');
    }
  }

  async searchTmdb(searchDto: TmdbSearchDto): Promise<any> {
    const { page = 1, query, year } = searchDto;

    if (!query) {
      throw new BadRequestException('Search query is required');
    }

    try {
      return await this.tmdbService.searchMovies(query, page, year);
    } catch (error) {
      this.logger.error(`Failed to search TMDB: ${error.message}`);
      throw new BadRequestException('Failed to search movies from TMDB');
    }
  }

  async getPopularMovies(page: number = 1): Promise<any> {
    try {
      return await this.tmdbService.getPopularMovies(page);
    } catch (error) {
      this.logger.error(`Failed to get popular movies: ${error.message}`);
      throw new BadRequestException('Failed to get popular movies from TMDB');
    }
  }

  async updateRatingStats(movieId: string): Promise<void> {
    try {
      const result = await this.movieRepository
        .createQueryBuilder('movie')
        .leftJoin('movie.ratings', 'rating')
        .select('AVG(rating.rating)', 'averageRating')
        .addSelect('COUNT(rating.id)', 'ratingsCount')
        .where('movie.id = :movieId', { movieId })
        .getRawOne();

      await this.movieRepository.update(movieId, {
        averageRating: parseFloat(result.averageRating) || 0,
        ratingsCount: parseInt(result.ratingsCount) || 0,
      });

      // await this.clearMoviesCache();
    } catch (error) {
      this.logger.error(`Failed to update rating stats: ${error.message}`);
    }
  }

  private async findByIdWithGenres(id: string): Promise<Movie | null> {
    return this.movieRepository.findOne({
      where: { id },
      relations: ['movieGenres', 'movieGenres.genre'],
    });
  }

  private buildSearchQuery(searchDto: MovieSearchDto): SelectQueryBuilder<Movie> {
    const queryBuilder = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.movieGenres', 'movieGenre')
      .leftJoinAndSelect('movieGenre.genre', 'genre')
      .where('movie.isActive = :isActive', { isActive: true });

    // Search by title
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(movie.title ILIKE :search OR movie.originalTitle ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    // Filter by genres
    if (searchDto.genreIds && searchDto.genreIds.length > 0) {
      queryBuilder.andWhere('genre.tmdbId IN (:...genreIds)', {
        genreIds: searchDto.genreIds,
      });
    }

    // Filter by year
    if (searchDto.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM movie.releaseDate) = :year', {
        year: searchDto.year,
      });
    }

    // Filter by rating range
    if (searchDto.minRating !== undefined) {
      queryBuilder.andWhere('movie.averageRating >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    if (searchDto.maxRating !== undefined) {
      queryBuilder.andWhere('movie.averageRating <= :maxRating', {
        maxRating: searchDto.maxRating,
      });
    }

    // Filter by language
    if (searchDto.language) {
      queryBuilder.andWhere('movie.originalLanguage = :language', {
        language: searchDto.language,
      });
    }

    // Filter adult content
    if (!searchDto.includeAdult) {
      queryBuilder.andWhere('movie.adult = :adult', { adult: false });
    }

    // Apply sorting
    this.applySorting(queryBuilder, searchDto.sortBy);

    return queryBuilder;
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Movie>,
    sortBy?: MovieSortBy,
  ): void {
    switch (sortBy) {
      case MovieSortBy.TITLE_ASC:
        queryBuilder.orderBy('movie.title', 'ASC');
        break;
      case MovieSortBy.TITLE_DESC:
        queryBuilder.orderBy('movie.title', 'DESC');
        break;
      case MovieSortBy.RELEASE_DATE_ASC:
        queryBuilder.orderBy('movie.releaseDate', 'ASC');
        break;
      case MovieSortBy.RELEASE_DATE_DESC:
        queryBuilder.orderBy('movie.releaseDate', 'DESC');
        break;
      case MovieSortBy.RATING_ASC:
        queryBuilder.orderBy('movie.averageRating', 'ASC');
        break;
      case MovieSortBy.RATING_DESC:
        queryBuilder.orderBy('movie.averageRating', 'DESC');
        break;
      case MovieSortBy.POPULARITY_ASC:
        queryBuilder.orderBy('movie.popularity', 'ASC');
        break;
      case MovieSortBy.POPULARITY_DESC:
        queryBuilder.orderBy('movie.popularity', 'DESC');
        break;
      case MovieSortBy.CREATED_ASC:
        queryBuilder.orderBy('movie.createdAt', 'ASC');
        break;
      case MovieSortBy.CREATED_DESC:
        queryBuilder.orderBy('movie.createdAt', 'DESC');
        break;
      default:
        queryBuilder.orderBy('movie.popularity', 'DESC');
    }
  }

  private async updateMovieGenres(movieId: string, genreIds: number[]): Promise<void> {
    // Remove existing associations
    await this.movieGenreRepository.delete({ movieId });

    if (genreIds.length === 0) {
      return;
    }

    // Find genres by TMDB IDs
    const genres = await this.genreRepository.find({
      where: { tmdbId: In(genreIds) },
    });

    // Create new associations
    const movieGenres = genres.map(genre =>
      this.movieGenreRepository.create({
        movieId,
        genreId: genre.id,
      }),
    );

    await this.movieGenreRepository.save(movieGenres);
  }

  private mapTmdbToCreateDto(tmdbMovie: TmdbMovieDetailsDto): CreateMovieDto {
    return {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      overview: tmdbMovie.overview,
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : undefined,
      voteAverage: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      popularity: tmdbMovie.popularity,
      posterPath: tmdbMovie.poster_path || undefined,
      backdropPath: tmdbMovie.backdrop_path || undefined,
      adult: tmdbMovie.adult,
      originalLanguage: tmdbMovie.original_language,
      spokenLanguages: tmdbMovie.spoken_languages?.map(lang => lang.name),
      productionCountries: tmdbMovie.production_countries?.map(country => country.name),
      budget: tmdbMovie.budget,
      revenue: tmdbMovie.revenue,
      runtime: tmdbMovie.runtime,
      tagline: tmdbMovie.tagline,
      homepage: tmdbMovie.homepage,
      imdbId: tmdbMovie.imdb_id,
      genreIds: tmdbMovie.genres?.map(genre => genre.id),
    };
  }

  private mapTmdbToUpdateDto(tmdbMovie: TmdbMovieDetailsDto): UpdateMovieDto {
    const createDto = this.mapTmdbToCreateDto(tmdbMovie);
    const { tmdbId, ...updateDto } = createDto;
    return {
      ...updateDto,
      lastSyncedAt: new Date(),
    };
  }

  // TODO: Implement cache clearing
  // private async clearMoviesCache(): Promise<void> {
  //   try {
  //     // This is a simplified cache clearing - in production you might want more sophisticated cache invalidation
  //     const keys = await this.cacheManager.store.keys('movies:*');
  //     await Promise.all(keys.map(key => this.cacheManager.del(key)));
  //   } catch (error) {
  //     this.logger.warn(`Failed to clear cache: ${error.message}`);
  //   }
  // }
}
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
// import { Cache } from 'cache-manager';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { Movie } from '../../database/entities/movie.entity';
import { Genre } from '../../database/entities/genre.entity';
import { MovieGenre } from '../../database/entities/movie-genre.entity';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepository: jest.Mocked<Repository<Movie>>;
  let genreRepository: jest.Mocked<Repository<Genre>>;
  let movieGenreRepository: jest.Mocked<Repository<MovieGenre>>;
  let tmdbService: jest.Mocked<TmdbService>;
  // let cacheManager: jest.Mocked<Cache>;

  const mockMovie: Movie = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tmdbId: 550,
    title: 'Fight Club',
    originalTitle: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac...',
    releaseDate: new Date('1999-10-15'),
    voteAverage: 8.8,
    voteCount: 26280,
    popularity: 63.416,
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdropPath: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
    adult: false,
    originalLanguage: 'en',
    spokenLanguages: ['English'],
    productionCountries: ['United States of America'],
    budget: 63000000,
    revenue: 100853753,
    runtime: 139,
    status: 'released' as any,
    tagline: 'Mischief. Mayhem. Soap.',
    homepage: 'https://www.foxmovies.com/movies/fight-club',
    imdbId: 'tt0137523',
    averageRating: 8.5,
    ratingsCount: 1250,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
    ratings: [],
    watchlists: [],
    movieGenres: [],
    get fullPosterUrl() {
      return this.posterPath ? `https://image.tmdb.org/t/p/w500${this.posterPath}` : null;
    },
    get fullBackdropUrl() {
      return this.backdropPath ? `https://image.tmdb.org/t/p/w1280${this.backdropPath}` : null;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MovieGenre),
          useValue: {
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TmdbService,
          useValue: {
            getMovieDetails: jest.fn(),
            searchMovies: jest.fn(),
            getPopularMovies: jest.fn(),
          },
        },
        // {
        //   provide: CACHE_MANAGER,
        //   useValue: {
        //     get: jest.fn(),
        //     set: jest.fn(),
        //     del: jest.fn(),
        //     store: {
        //       keys: jest.fn(),
        //     },
        //   },
        // },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get(getRepositoryToken(Movie));
    genreRepository = module.get(getRepositoryToken(Genre));
    movieGenreRepository = module.get(getRepositoryToken(MovieGenre));
    tmdbService = module.get(TmdbService);
    // cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new movie successfully', async () => {
      const createMovieDto = {
        tmdbId: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
      };

      jest.spyOn(service, 'findByTmdbId').mockResolvedValue(null);
      movieRepository.create.mockReturnValue(mockMovie);
      movieRepository.save.mockResolvedValue(mockMovie);
      jest.spyOn(service as any, 'findByIdWithGenres').mockResolvedValue(mockMovie);
      // Removed the clearMoviesCache spy since the method is commented out

      const result = await service.create(createMovieDto);

      expect(result).toBeDefined();
      expect(movieRepository.create).toHaveBeenCalledWith(createMovieDto);
      expect(movieRepository.save).toHaveBeenCalledWith(mockMovie);
    });

    it('should throw ConflictException if movie already exists', async () => {
      const createMovieDto = {
        tmdbId: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
      };

      jest.spyOn(service, 'findByTmdbId').mockResolvedValue(mockMovie);

      await expect(service.create(createMovieDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return a movie by ID', async () => {
      const movieId = '123e4567-e89b-12d3-a456-426614174000';

      jest.spyOn(service as any, 'findByIdWithGenres').mockResolvedValue(mockMovie);

      const result = await service.findById(movieId);

      expect(result).toBeDefined();
      expect(result.id).toBe(movieId);
    });

    it('should throw NotFoundException if movie not found', async () => {
      const movieId = 'non-existent-id';

      jest.spyOn(service as any, 'findByIdWithGenres').mockResolvedValue(null);

      await expect(service.findById(movieId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const searchDto = { page: 1, limit: 10 };
      const movies = [mockMovie];
      const total = 1;

      // cacheManager.get.mockResolvedValue(null);

      const mockQueryBuilder = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([movies, total]),
      };

      jest.spyOn(service as any, 'buildSearchQuery').mockReturnValue(mockQueryBuilder);
      // Removed the clearMoviesCache spy since the method is commented out

      const result = await service.findAll(searchDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(total);
    });
  });

  describe('syncFromTmdb', () => {
    it('should create new movie from TMDB', async () => {
      const tmdbId = 550;
      const tmdbMovie = {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        // ... other TMDB movie properties
      };

      jest.spyOn(service, 'findByTmdbId').mockResolvedValue(null);
      tmdbService.getMovieDetails.mockResolvedValue(tmdbMovie as any);
      jest.spyOn(service, 'create').mockResolvedValue({} as any);

      await service.syncFromTmdb(tmdbId);

      expect(tmdbService.getMovieDetails).toHaveBeenCalledWith(tmdbId);
      expect(service.create).toHaveBeenCalled();
    });

    it('should update existing movie from TMDB', async () => {
      const tmdbId = 550;
      const tmdbMovie = {
        id: 550,
        title: 'Fight Club Updated',
        overview: 'Updated overview...',
        // ... other TMDB movie properties
      };

      jest.spyOn(service, 'findByTmdbId').mockResolvedValue(mockMovie);
      tmdbService.getMovieDetails.mockResolvedValue(tmdbMovie as any);
      jest.spyOn(service, 'update').mockResolvedValue({} as any);

      await service.syncFromTmdb(tmdbId);

      expect(tmdbService.getMovieDetails).toHaveBeenCalledWith(tmdbId);
      expect(service.update).toHaveBeenCalled();
    });
  });
});
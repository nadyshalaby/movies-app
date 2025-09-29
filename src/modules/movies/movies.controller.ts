import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieSearchDto, TmdbSearchDto } from './dto/movie-search.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
// import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Movies')
@Controller('movies')
// @UseInterceptors(CacheInterceptor)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Movie already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createMovieDto: CreateMovieDto): Promise<MovieResponseDto> {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all movies with search and filters' })
  @ApiPaginatedResponse(MovieResponseDto)
  @ApiQuery({ name: 'search', required: false, description: 'Search by movie title' })
  @ApiQuery({ name: 'genreIds', required: false, type: [Number], description: 'Filter by genre IDs' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by release year' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Minimum rating filter' })
  @ApiQuery({ name: 'maxRating', required: false, type: Number, description: 'Maximum rating filter' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort movies by field' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async findAll(@Query() searchDto: MovieSearchDto): Promise<PaginatedResponseDto<MovieResponseDto>> {
    return this.moviesService.findAll(searchDto);
  }

  @Get('search/tmdb')
  @ApiOperation({ summary: 'Search movies from TMDB API' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Release year' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiResponse({ status: 200, description: 'Movies from TMDB API' })
  async searchTmdb(@Query() searchDto: TmdbSearchDto) {
    return this.moviesService.searchTmdb(searchDto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular movies from TMDB' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiResponse({ status: 200, description: 'Popular movies from TMDB' })
  async getPopular(@Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    return this.moviesService.getPopularMovies(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie by ID' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @ApiResponse({
    status: 200,
    description: 'Movie found',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MovieResponseDto> {
    return this.moviesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated successfully',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Movie deleted successfully' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.moviesService.remove(id);
  }

  @Post('sync/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync movie from TMDB (Admin only)' })
  @ApiParam({ name: 'tmdbId', description: 'TMDB Movie ID' })
  @ApiResponse({
    status: 201,
    description: 'Movie synced successfully',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Failed to sync from TMDB' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async syncFromTmdb(
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ): Promise<MovieResponseDto> {
    return this.moviesService.syncFromTmdb(tmdbId);
  }
}
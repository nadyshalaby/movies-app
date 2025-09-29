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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Ratings')
@Controller('ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a rating for a movie' })
  @ApiResponse({
    status: 201,
    description: 'Rating created successfully',
    type: RatingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 409, description: 'You have already rated this movie' })
  async create(
    @Body() createRatingDto: CreateRatingDto,
    @CurrentUser() user: User,
  ): Promise<RatingResponseDto> {
    return this.ratingsService.create(createRatingDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ratings (paginated)' })
  @ApiPaginatedResponse(RatingResponseDto)
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<RatingResponseDto>> {
    return this.ratingsService.findAll(paginationDto);
  }

  @Get('my-ratings')
  @ApiOperation({ summary: 'Get current user ratings' })
  @ApiPaginatedResponse(RatingResponseDto)
  async findMyRatings(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<RatingResponseDto>> {
    return this.ratingsService.findByUserId(user.id, paginationDto);
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get ratings for a specific movie' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiPaginatedResponse(RatingResponseDto)
  async findByMovie(
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<RatingResponseDto>> {
    return this.ratingsService.findByMovieId(movieId, paginationDto);
  }

  @Get('movie/:movieId/my-rating')
  @ApiOperation({ summary: 'Get current user rating for a specific movie' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({
    status: 200,
    description: 'User rating found',
    type: RatingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  async findMyRatingForMovie(
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @CurrentUser() user: User,
  ): Promise<RatingResponseDto | null> {
    return this.ratingsService.findUserRatingForMovie(user.id, movieId);
  }

  @Get('movie/:movieId/stats')
  @ApiOperation({ summary: 'Get rating statistics for a movie' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({
    status: 200,
    description: 'Rating statistics',
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number', example: 8.5 },
        totalRatings: { type: 'number', example: 125 },
        ratingDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rating: { type: 'number', example: 8 },
              count: { type: 'number', example: 25 },
            },
          },
        },
      },
    },
  })
  async getMovieStats(@Param('movieId', ParseUUIDPipe) movieId: string) {
    return this.ratingsService.getMovieRatingStats(movieId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get ratings by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiPaginatedResponse(RatingResponseDto)
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<RatingResponseDto>> {
    return this.ratingsService.findByUserId(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rating by ID' })
  @ApiParam({ name: 'id', description: 'Rating UUID' })
  @ApiResponse({
    status: 200,
    description: 'Rating found',
    type: RatingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RatingResponseDto> {
    return this.ratingsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update your rating' })
  @ApiParam({ name: 'id', description: 'Rating UUID' })
  @ApiResponse({
    status: 200,
    description: 'Rating updated successfully',
    type: RatingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiResponse({ status: 403, description: 'You can only update your own ratings' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @CurrentUser() user: User,
  ): Promise<RatingResponseDto> {
    return this.ratingsService.update(id, updateRatingDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your rating' })
  @ApiParam({ name: 'id', description: 'Rating UUID' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiResponse({ status: 403, description: 'You can only delete your own ratings' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.ratingsService.remove(id, user.id);
  }
}
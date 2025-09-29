# Movies API 🎬

A comprehensive movie database API built with NestJS, featuring TMDB integration, user authentication, ratings, and watchlists.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Movie Management**: CRUD operations with TMDB synchronization
- **Search & Filtering**: Advanced search with genre, year, rating filters
- **User Ratings**: Rate and review movies with aggregated statistics
- **Watchlists**: Personal movie collections with status tracking
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: API protection with throttling
- **API Documentation**: Comprehensive Swagger/OpenAPI docs
- **Docker Support**: Full containerization with Docker Compose
- **Security**: Helmet, CORS, input validation, and more

## Tech Stack

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose
- **External API**: TMDB (The Movie Database)

## Architecture

```
src/
├── config/           # Configuration files
├── common/           # Shared utilities, guards, interceptors
├── database/         # Entities, migrations, seeds
├── modules/          # Feature modules
│   ├── auth/         # Authentication
│   ├── users/        # User management
│   ├── movies/       # Movie operations
│   ├── ratings/      # Rating system
│   ├── watchlists/   # User collections
│   ├── tmdb/         # TMDB integration
│   └── cache/        # Cache configuration
├── docker/           # Docker configurations
└── nginx/            # Reverse proxy config
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Environment Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd movies-app
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your TMDB API key and other settings
   ```

3. **Start with Docker (Recommended)**:
   ```bash
   pnpm run docker:up
   ```

4. **Seed the database**:
   ```bash
   pnpm run db:seed
   ```

5. **Access the application**:
   - API: http://localhost:3000/api
   - Documentation: http://localhost:3000/api/docs

### Development Setup

```bash
# Install dependencies
pnpm install

# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Run database migrations
pnpm run db:migrate

# Seed initial data
pnpm run db:seed

# Start in development mode
pnpm run start:dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh token

### Movies
- `GET /api/movies` - List movies with filters
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/search/tmdb` - Search TMDB
- `GET /api/movies/popular` - Get popular movies
- `POST /api/movies/sync/:tmdbId` - Sync from TMDB (Admin)

### Ratings
- `POST /api/ratings` - Rate a movie
- `GET /api/ratings/my-ratings` - Get user ratings
- `GET /api/ratings/movie/:id` - Get movie ratings
- `GET /api/ratings/movie/:id/stats` - Get rating statistics

### Users (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Database Schema

### Core Entities
- **Users**: Authentication and user management
- **Movies**: Movie data from TMDB
- **Genres**: Movie categories
- **Ratings**: User movie ratings and reviews
- **Watchlists**: User movie collections
- **MovieGenres**: Many-to-many movie-genre relationships

### Key Relationships
- Users → Ratings (One-to-Many)
- Users → Watchlists (One-to-Many)
- Movies → Ratings (One-to-Many)
- Movies → MovieGenres → Genres (Many-to-Many)

## Scripts

### Development
```bash
pnpm run start:dev      # Start in watch mode
pnpm run build          # Build for production
pnpm run start:prod     # Start production build
```

### Database
```bash
pnpm run db:migrate         # Run migrations
pnpm run db:migrate:revert  # Revert migration
pnpm run db:generate        # Generate migration
pnpm run db:seed           # Seed database
```

### Testing
```bash
pnpm run test           # Unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # Coverage report
pnpm run test:e2e       # End-to-end tests
```

### Docker
```bash
pnpm run docker:build   # Build image
pnpm run docker:up      # Start all services
pnpm run docker:down    # Stop all services
pnpm run docker:logs    # View app logs
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `TMDB_API_KEY` | TMDB API key | Required |
| `JWT_SECRET` | JWT secret | Required |

### Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: DTO validation with class-validator
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth

## Deployment

### Production Checklist

1. Set secure environment variables
2. Configure SSL certificates in nginx
3. Set up database backups
4. Configure monitoring and logging
5. Set up CI/CD pipeline

### Docker Production

```bash
# Build production image
docker build -t movies-app .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## Troubleshooting

### Common Issues

1. **Database connection failed**: Check PostgreSQL is running and credentials are correct
2. **Redis connection failed**: Ensure Redis is running on specified port
3. **TMDB API errors**: Verify API key is valid and not rate limited
4. **Build failures**: Clear node_modules and reinstall dependencies

### Performance Tips

- Use Redis caching for frequently accessed data
- Implement database indexing for search queries
- Enable gzip compression in nginx
- Use connection pooling for database connections

## License

This project is [MIT licensed](LICENSE).

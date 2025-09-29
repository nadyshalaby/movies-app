# Movies API 🎬

A production-ready movie database API built with NestJS 11, featuring TMDB integration, JWT authentication, Redis caching, and complete Docker containerization with Nginx reverse proxy.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (user/admin)
- **Movie Management**: CRUD operations with real-time TMDB synchronization
- **Search & Filtering**: Advanced search with genre, year, rating filters and pagination
- **User Ratings**: Rate and review movies with aggregated statistics
- **Watchlists**: Personal movie collections with status tracking
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: API protection with intelligent throttling via Nginx
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Docker Support**: Full containerization with Docker Compose orchestration
- **Security**: Helmet, CORS, input validation, bcrypt password hashing

## Tech Stack

- **Framework**: NestJS 11 (Node.js/TypeScript)
- **Database**: PostgreSQL 17 with TypeORM
- **Cache**: Redis 8 with cache-manager-ioredis
- **Authentication**: JWT with Passport strategies
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest & Supertest
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx Alpine
- **External API**: TMDB (The Movie Database) API v3

## Architecture

```
src/
├── config/           # Application configuration
├── common/           # Shared utilities, guards, interceptors
│   ├── decorators/   # Custom decorators
│   ├── filters/      # Exception filters
│   ├── guards/       # Auth & role guards
│   ├── interceptors/ # Response transformation
│   └── pipes/        # Validation pipes
├── database/         # Database configuration
│   ├── entities/     # TypeORM entities
│   ├── migrations/   # Database migrations
│   └── seeds/        # Seed data
├── modules/          # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── movies/       # Movie operations
│   ├── genres/       # Genre management
│   ├── ratings/      # Rating system
│   ├── watchlists/   # User collections
│   ├── tmdb/         # TMDB integration
│   └── cache/        # Cache configuration
├── docker/           # Docker configurations
└── nginx/            # Nginx reverse proxy config
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm (for local development)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd movies-app
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your TMDB API key:
   ```env
   TMDB_API_KEY=your_actual_tmdb_api_key_here
   JWT_SECRET=your_secure_jwt_secret_here
   ```

3. **Start with Docker Compose** (Recommended):
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - NestJS application on port 3000
   - Nginx reverse proxy on port 8080

4. **Verify all services are healthy**:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

   All containers should show "(healthy)" status.

5. **Access the application**:
   - API via Nginx: http://localhost:8080/api/v1
   - API Direct: http://localhost:3000/api/v1
   - Swagger Documentation: http://localhost:8080/api/docs
   - Health Check: http://localhost:8080/health

### Local Development Setup

```bash
# Install dependencies
pnpm install

# Start only PostgreSQL and Redis
docker-compose up postgres redis -d

# Run database migrations
pnpm run migration:run

# Start in development mode with hot reload
pnpm run start:dev
```

## API Endpoints

All API endpoints are versioned under `/api/v1/`

### Authentication
- `POST /api/v1/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get current user profile (requires auth)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Movies
- `GET /api/v1/movies` - List movies with pagination and filters
- `GET /api/v1/movies/:id` - Get movie details
- `GET /api/v1/movies/popular` - Get popular movies from TMDB
- `GET /api/v1/movies/top-rated` - Get top-rated movies from TMDB
- `GET /api/v1/movies/upcoming` - Get upcoming movies from TMDB
- `GET /api/v1/movies/search` - Search movies
- `POST /api/v1/movies/sync/:tmdbId` - Sync movie from TMDB (Admin only)
- `PUT /api/v1/movies/:id` - Update movie (Admin only)
- `DELETE /api/v1/movies/:id` - Delete movie (Admin only)

### Genres
- `GET /api/v1/genres` - List all genres
- `GET /api/v1/genres/:id` - Get genre details
- `POST /api/v1/genres/sync` - Sync genres from TMDB (Admin only)

### Ratings
- `POST /api/v1/ratings` - Rate a movie (requires auth)
- `GET /api/v1/ratings/my-ratings` - Get user's ratings
- `GET /api/v1/ratings/movie/:movieId` - Get movie ratings
- `PUT /api/v1/ratings/:id` - Update rating
- `DELETE /api/v1/ratings/:id` - Delete rating

### Watchlists
- `GET /api/v1/watchlists` - Get user's watchlist
- `POST /api/v1/watchlists` - Add movie to watchlist
- `PUT /api/v1/watchlists/:id` - Update watchlist item
- `DELETE /api/v1/watchlists/:id` - Remove from watchlist

### Users (Admin only)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user details
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Database Schema

### Core Entities
- **Users**: User accounts with authentication details
- **Movies**: Movie data synchronized from TMDB
- **Genres**: Movie categories
- **Ratings**: User movie ratings (1-10) and reviews
- **Watchlists**: User's personal movie collections
- **MovieGenres**: Many-to-many relationship between movies and genres

### Key Relationships
- Users → Ratings (One-to-Many)
- Users → Watchlists (One-to-Many)
- Movies → Ratings (One-to-Many)
- Movies ↔ Genres (Many-to-Many through MovieGenres)

## Scripts

### Development
```bash
pnpm run start           # Start application
pnpm run start:dev       # Start in watch mode
pnpm run start:debug     # Start in debug mode
pnpm run start:prod      # Start production build
pnpm run build           # Build for production
```

### Database
```bash
pnpm run migration:generate  # Generate migration from entities
pnpm run migration:run       # Run pending migrations
pnpm run migration:revert    # Revert last migration
pnpm run schema:sync         # Sync schema (dev only)
```

### Testing
```bash
pnpm run test            # Run unit tests
pnpm run test:watch      # Run tests in watch mode
pnpm run test:cov        # Generate coverage report
pnpm run test:debug      # Debug tests
pnpm run test:e2e        # Run end-to-end tests
```

### Docker Operations
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose restart nginx   # Restart nginx
docker-compose logs -f app     # View app logs
docker-compose exec app sh     # Shell into app container
docker-compose down -v         # Stop and remove volumes
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Application port | `3000` | No |
| `API_VERSION` | API version (without 'v') | `1` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_DATABASE` | Database name | `movies_db` | Yes |
| `DB_USERNAME` | Database user | `movies_user` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_SYNCHRONIZE` | Auto sync schema | `false` | No |
| `REDIS_HOST` | Redis host | `localhost` | Yes |
| `REDIS_PORT` | Redis port | `6379` | No |
| `TMDB_API_KEY` | TMDB API key | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | Token expiry | `7d` | No |
| `THROTTLE_TTL` | Rate limit window (seconds) | `60` | No |
| `THROTTLE_LIMIT` | Max requests per window | `100` | No |
| `SWAGGER_ENABLED` | Enable Swagger docs | `true` | No |

### Security Features

- **Helmet**: Security headers for XSS, clickjacking protection
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Nginx-level rate limiting (10 req/s for API, 5 req/s for auth)
- **Input Validation**: DTO validation with class-validator
- **Password Security**: bcrypt hashing with 10 salt rounds
- **JWT Authentication**: Stateless token-based authentication
- **Role-Based Access**: User and Admin role separation
- **SQL Injection Protection**: TypeORM parameterized queries

### Nginx Configuration

The Nginx reverse proxy provides:
- Rate limiting zones for API and auth endpoints
- Gzip compression for responses
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Health check endpoint at `/health`
- Proxy configuration with proper headers
- Static file caching (when frontend is added)

## Docker Architecture

### Services
1. **postgres**: PostgreSQL 17 Alpine with health checks
2. **redis**: Redis 8 Alpine for caching
3. **app**: Multi-stage Node.js application build
4. **nginx**: Alpine Nginx reverse proxy

### Networks
- `movies-network`: Bridge network for inter-container communication

### Volumes
- `postgres_data`: Persistent PostgreSQL data
- `redis_data`: Persistent Redis data
- `./logs`: Application logs (mounted)

## Testing

Current test coverage: ~28% (target: 85%)

### Run Tests
```bash
# Unit tests with coverage
pnpm run test:cov

# E2E tests (requires test database)
pnpm run test:e2e
```

### Test Structure
```
test/
├── unit/           # Unit tests for services
├── integration/    # Integration tests
└── e2e/            # End-to-end API tests
```

## Deployment

### Production Checklist

1. **Environment Configuration**:
   - Generate strong JWT_SECRET
   - Set NODE_ENV=production
   - Configure production database credentials
   - Set up SSL certificates

2. **Database**:
   - Run migrations: `pnpm run migration:run`
   - Set DB_SYNCHRONIZE=false
   - Configure backup strategy

3. **Security**:
   - Enable HTTPS in Nginx
   - Configure firewall rules
   - Set up monitoring and alerting
   - Configure log rotation

4. **Performance**:
   - Optimize PostgreSQL configuration
   - Configure Redis memory limits
   - Set up CDN for static assets
   - Enable HTTP/2 in Nginx

### Docker Production Build

```bash
# Build production image
docker build -t movies-app:latest .

# Tag for registry
docker tag movies-app:latest your-registry/movies-app:latest

# Push to registry
docker push your-registry/movies-app:latest
```

## Troubleshooting

### Common Issues

1. **Container Health Checks Failing**:
   - Issue: Containers show "unhealthy" status
   - Solution: Fixed IPv6 localhost issues, use `127.0.0.1` instead

2. **Nginx Configuration Errors**:
   - Issue: "proxy_http_version directive is not allowed here"
   - Solution: Proxy directives placed directly in location blocks

3. **API Version Double 'v'**:
   - Issue: Routes appear as `/api/vv1`
   - Solution: Set `API_VERSION=1` (without 'v' prefix)

4. **Database Connection Issues**:
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres

   # Verify connection
   docker-compose exec postgres psql -U movies_user -d movies_db
   ```

5. **Redis Connection Issues**:
   ```bash
   # Check Redis logs
   docker-compose logs redis

   # Test connection
   docker-compose exec redis redis-cli ping
   ```

### Performance Monitoring

```bash
# View container stats
docker stats

# Check application logs
docker-compose logs -f app

# Monitor Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow NestJS best practices
- Write tests for new features
- Update API documentation
- Use conventional commits
- Ensure all tests pass before submitting PR

## License

This project is [MIT licensed](LICENSE).

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing issues for solutions
- Review the API documentation at `/api/docs`

---

Built with ❤️ using NestJS, PostgreSQL, and Docker
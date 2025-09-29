import { registerAs } from '@nestjs/config';

export default registerAs('tmdb', () => ({
  apiKey: process.env.TMDB_API_KEY || 'your-tmdb-api-key-here',
  baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  imageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
}));
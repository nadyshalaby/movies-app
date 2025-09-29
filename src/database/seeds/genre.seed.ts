import { DataSource } from 'typeorm';
import { Genre } from '../entities/genre.entity';

export async function seedGenres(dataSource: DataSource): Promise<void> {
  const genreRepository = dataSource.getRepository(Genre);

  // TMDB Genre IDs and names (as of 2024)
  const genres = [
    { tmdbId: 28, name: 'Action' },
    { tmdbId: 12, name: 'Adventure' },
    { tmdbId: 16, name: 'Animation' },
    { tmdbId: 35, name: 'Comedy' },
    { tmdbId: 80, name: 'Crime' },
    { tmdbId: 99, name: 'Documentary' },
    { tmdbId: 18, name: 'Drama' },
    { tmdbId: 10751, name: 'Family' },
    { tmdbId: 14, name: 'Fantasy' },
    { tmdbId: 36, name: 'History' },
    { tmdbId: 27, name: 'Horror' },
    { tmdbId: 10402, name: 'Music' },
    { tmdbId: 9648, name: 'Mystery' },
    { tmdbId: 10749, name: 'Romance' },
    { tmdbId: 878, name: 'Science Fiction' },
    { tmdbId: 10770, name: 'TV Movie' },
    { tmdbId: 53, name: 'Thriller' },
    { tmdbId: 10752, name: 'War' },
    { tmdbId: 37, name: 'Western' },
  ];

  for (const genreData of genres) {
    const existingGenre = await genreRepository.findOne({
      where: { tmdbId: genreData.tmdbId },
    });

    if (!existingGenre) {
      const genre = genreRepository.create(genreData);
      await genreRepository.save(genre);
      console.log(`Created genre: ${genreData.name}`);
    } else {
      console.log(`Genre already exists: ${genreData.name}`);
    }
  }

  console.log('✅ Genre seeding completed');
}
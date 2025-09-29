import { AppDataSource } from '../data-source';
import { seedGenres } from './genre.seed';
import { seedUsers } from './user.seed';

async function runSeeds(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }

    // Run seeds
    await seedGenres(AppDataSource);
    await seedUsers(AppDataSource);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Create admin user
  const adminEmail = 'admin@movies.com';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const admin = userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(admin);
    console.log(`✅ Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Create demo user
  const demoEmail = 'demo@movies.com';
  const existingDemo = await userRepository.findOne({
    where: { email: demoEmail },
  });

  if (!existingDemo) {
    const hashedPassword = await bcrypt.hash('Demo123!', 12);
    const demo = userRepository.create({
      firstName: 'Demo',
      lastName: 'User',
      email: demoEmail,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    });

    await userRepository.save(demo);
    console.log(`✅ Created demo user: ${demoEmail}`);
  } else {
    console.log(`Demo user already exists: ${demoEmail}`);
  }

  console.log('✅ User seeding completed');
}
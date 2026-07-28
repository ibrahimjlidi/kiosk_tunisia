import { User } from '../models/User';

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount === 0) {
      await User.create({
        username: 'admin',
        email: 'admin@fuelstation.tn',
        password: 'Admin123!',
        firstName: 'Station',
        lastName: 'Administrator',
        role: 'ADMIN',
        active: true,
      });
      console.log('[Seed] Default Admin user created (admin@fuelstation.tn / Admin123!)');
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed default admin:', (error as Error).message);
  }
};

import { User } from '../models/User';

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@fuelstation.tn',
  password: 'Admin123!',
  firstName: 'Station',
  lastName: 'Administrator',
  role: 'ADMIN' as const,
  active: true,
};

export const seedAdminUser = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) return;
    await User.create(DEFAULT_ADMIN);
    console.log('[Seed] Default Admin user created (admin@fuelstation.tn / Admin123!)');
  } catch (error) {
    console.error('[Seed Error] Failed to seed default admin:', (error as Error).message);
  }
};

import { User } from '../models/User';
import { config } from '../config/env';

const DEVELOPMENT_ADMIN = {
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
    if (config.nodeEnv === 'production') {
      const { BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } = process.env;
      if (!BOOTSTRAP_ADMIN_USERNAME || !BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
        throw new Error('Set BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_EMAIL, and BOOTSTRAP_ADMIN_PASSWORD to initialize the first admin');
      }
      await User.create({
        ...DEVELOPMENT_ADMIN,
        username: BOOTSTRAP_ADMIN_USERNAME,
        email: BOOTSTRAP_ADMIN_EMAIL,
        password: BOOTSTRAP_ADMIN_PASSWORD,
        firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME || 'Station',
        lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME || 'Administrator',
      });
      console.log(`[Seed] Production admin account created for ${BOOTSTRAP_ADMIN_EMAIL}`);
      return;
    }

    await User.create(DEVELOPMENT_ADMIN);
    console.log('[Seed] Development Admin user created (admin@fuelstation.tn)');
  } catch (error) {
    console.error('[Seed Error] Failed to seed default admin:', (error as Error).message);
    throw error;
  }
};

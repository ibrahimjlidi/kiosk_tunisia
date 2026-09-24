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

// Databases seeded by older revisions can hold a stale admin (different email/password),
// which previously blocked creation of the documented account and locked out deploys.
const STALE_ADMIN_MATCH = {
  $or: [
    { username: DEFAULT_ADMIN.username },
    { email: DEFAULT_ADMIN.email },
    { email: 'admin@fuelstation.com' },
  ],
};

export const seedAdminUser = async (): Promise<void> => {
  try {
    const existing = await User.findOne(STALE_ADMIN_MATCH);

    if (!existing) {
      await User.create(DEFAULT_ADMIN);
      console.log('[Seed] Default Admin user created (admin@fuelstation.tn / Admin123!)');
      return;
    }

    existing.username = DEFAULT_ADMIN.username;
    existing.email = DEFAULT_ADMIN.email;
    existing.password = DEFAULT_ADMIN.password;
    existing.role = DEFAULT_ADMIN.role;
    existing.firstName = DEFAULT_ADMIN.firstName;
    existing.lastName = DEFAULT_ADMIN.lastName;
    existing.active = true;
    await existing.save();
    console.log('[Seed] Default Admin credentials synchronized (admin@fuelstation.tn / Admin123!)');
  } catch (error) {
    console.error('[Seed Error] Failed to seed default admin:', (error as Error).message);
  }
};

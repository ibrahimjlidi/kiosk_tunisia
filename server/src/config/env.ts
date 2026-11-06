import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_fuelstation_2026_tunisia';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_fuelstation_2026';
const port = Number(process.env.PORT || 5000);
const databasePort = Number(process.env.DB_PORT || 3306);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535');
}

if (nodeEnv === 'production') {
  const requiredDatabaseVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingDatabaseVariables = requiredDatabaseVariables.filter((key) => !process.env[key]);
  if (missingDatabaseVariables.length > 0) {
    throw new Error(`Missing production database configuration: ${missingDatabaseVariables.join(', ')}`);
  }
  if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN must contain the deployed frontend origin in production');
  }
  if (jwtSecret.length < 32 || jwtSecret === 'super_secret_jwt_key_fuelstation_2026_tunisia') {
    throw new Error('JWT_SECRET must be a unique production secret of at least 32 characters');
  }
  if (jwtRefreshSecret.length < 32 || jwtRefreshSecret === 'super_secret_refresh_token_key_fuelstation_2026') {
    throw new Error('JWT_REFRESH_SECRET must be a unique production secret of at least 32 characters');
  }
}

export const config = {
  port,
  nodeEnv,
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: databasePort,
    user: process.env.DB_USER || 'fuelstation',
    password: process.env.DB_PASSWORD || 'fuelstation',
    name: process.env.DB_NAME || 'fuelstation_erp',
    ssl: process.env.DB_SSL === 'true',
    sslCa: process.env.DB_SSL_CA,
  },
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

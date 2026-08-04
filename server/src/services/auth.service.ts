import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { RefreshToken, IRefreshToken } from '../models/RefreshToken';
import { Types } from 'mongoose';

const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

const TO_MS_MAP: Record<string, number> = {
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000,
};

const parseDurationToMs = (value: string): number => {
  if (!value) return 0;
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    const seconds = Number(value);
    return Number.isNaN(seconds) ? 0 : seconds * 1000;
  }
  const amount = Number(match[1]);
  const unit = match[2];
  return amount * (TO_MS_MAP[unit] || 1000);
};

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: parseDurationToMs(config.jwtRefreshExpiresIn),
});

export const generateAccessToken = (user: {
  id: string;
  email: string;
  role: string;
  username: string;
  permissions: string[];
}): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
    permissions: user.permissions,
  };

  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as unknown as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.jwtSecret, options);
};

export const generateToken = generateAccessToken;

export const generateRefreshToken = (userId: string): string => {
  const payload = { id: userId };
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwtRefreshSecret, options);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

export const createRefreshToken = async (userId: string): Promise<IRefreshToken> => {
  const token = generateRefreshToken(userId);
  const expiresAt = new Date(Date.now() + parseDurationToMs(config.jwtRefreshExpiresIn));
  return RefreshToken.create({
    user: new Types.ObjectId(userId),
    token,
    expiresAt,
  });
};

export const findValidRefreshToken = async (token: string): Promise<IRefreshToken | null> => {
  return RefreshToken.findOne({
    token,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.findOneAndUpdate({ token, revoked: false }, { revoked: true });
};

export const rotateRefreshToken = async (oldToken: string, userId: string): Promise<IRefreshToken> => {
  await revokeRefreshToken(oldToken);
  return createRefreshToken(userId);
};

export const getRefreshTokenCookieName = (): string => REFRESH_TOKEN_COOKIE_NAME;

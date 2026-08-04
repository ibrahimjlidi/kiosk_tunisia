import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { IUser } from '../models/User';
import { getRolePermissions } from './permissions';

export const generateToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    username: user.username,
    permissions: getRolePermissions(user.role),
  };

  const options: SignOptions = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, config.jwtSecret, options);
};

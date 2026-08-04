import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUser, UserRole } from '../models/User';
import { sendError } from '../helpers/apiResponse';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    username: string;
    permissions: string[];
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  permissions: string[];
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendError(res, 'Authentication token is missing. Access denied.', 401);
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      sendError(res, 'The user belonging to this token no longer exists.', 401);
      return;
    }

    if (!currentUser.active) {
      sendError(res, 'Your account has been deactivated. Contact an administrator.', 403);
      return;
    }

    req.user = {
      id: currentUser._id.toString(),
      email: currentUser.email,
      role: currentUser.role,
      username: currentUser.username,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired authentication token.', 401);
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
      return;
    }

    next();
  };
};

export const authorize = (...requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const permissions = req.user.permissions || [];
    const missingPermissions = requiredPermissions.filter((permission) => !permissions.includes(permission));

    if (missingPermissions.length > 0) {
      sendError(
        res,
        `Forbidden: Missing permission(s): ${missingPermissions.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};

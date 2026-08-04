import { Request, Response } from 'express';
import { User } from '../models/User';
import { config } from '../config/env';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getRolePermissions } from '../utils/permissions';
import { sendSuccess, sendError } from '../helpers/apiResponse';
import { logAuditEvent } from '../helpers/auditLog';
import { parseCookies } from '../helpers/cookies';
import {
  createRefreshToken,
  generateAccessToken,
  getRefreshCookieOptions,
  revokeRefreshToken,
  verifyRefreshToken,
  findValidRefreshToken,
} from '../services/auth.service';

const buildUserPayload = (user: any) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  active: user.active,
  station: user.station,
  permissions: getRolePermissions(user.role),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, phone, role } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      sendError(res, 'Email is already registered', 400);
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      sendError(res, 'Username is already taken', 400);
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'OPERATOR',
    });

    const token = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
      permissions: getRolePermissions(user.role),
    });
    const refreshToken = await createRefreshToken(user._id.toString());

    res.cookie('refresh_token', refreshToken.token, getRefreshCookieOptions());

    await logAuditEvent({
      user: user._id,
      action: 'USER_REGISTERED',
      status: 'SUCCESS',
      message: `User ${user.email} registered`,
    });

    sendSuccess(
      res,
      {
        message: 'User registered successfully',
        token,
        user: buildUserPayload(user),
      },
      201
    );
  } catch (error: any) {
    await logAuditEvent({
      action: 'USER_REGISTER_FAILED',
      status: 'FAILURE',
      message: error.message,
      metadata: { body: req.body },
    });
    sendError(res, error.message || 'Error registering user', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    if (!user.active) {
      sendError(res, 'Account is deactivated. Contact Administrator.', 403);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const token = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
      permissions: getRolePermissions(user.role),
    });
    const refreshToken = await createRefreshToken(user._id.toString());

    res.cookie('refresh_token', refreshToken.token, getRefreshCookieOptions());

    await logAuditEvent({
      user: user._id,
      action: 'USER_LOGIN',
      status: 'SUCCESS',
      message: `User ${user.email} logged in`,
    });

    sendSuccess(res, {
      message: 'Login successful',
      token,
      user: buildUserPayload(user),
    });
  } catch (error: any) {
    await logAuditEvent({
      action: 'USER_LOGIN_FAILED',
      status: 'FAILURE',
      message: error.message,
      metadata: { body: req.body },
    });
    sendError(res, error.message || 'Error logging in', 500);
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies['refresh_token'];

    if (!refreshToken) {
      sendError(res, 'Refresh token is missing.', 401);
      return;
    }

    const storedToken = await findValidRefreshToken(refreshToken);
    if (!storedToken) {
      sendError(res, 'Refresh token is invalid or expired.', 401);
      return;
    }

    const payload = verifyRefreshToken(refreshToken) as { id: string };
    const user = await User.findById(payload.id);
    if (!user || !user.active) {
      sendError(res, 'Refresh session invalid.', 401);
      return;
    }

    const token = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
      permissions: getRolePermissions(user.role),
    });

    const newRefreshToken = await revokeRefreshToken(refreshToken).then(() => createRefreshToken(user._id.toString()));

    res.cookie('refresh_token', newRefreshToken.token, getRefreshCookieOptions());

    await logAuditEvent({
      user: user._id,
      action: 'REFRESH_TOKEN',
      status: 'SUCCESS',
      message: `Refresh token rotated for user ${user.email}`,
    });

    sendSuccess(res, { message: 'Access token refreshed', token });
  } catch (error: any) {
    await logAuditEvent({
      action: 'REFRESH_TOKEN_FAILED',
      status: 'FAILURE',
      message: error.message,
    });
    sendError(res, error.message || 'Error refreshing access token', 401);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies['refresh_token'];

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error: any) {
    sendError(res, error.message || 'Error logging out', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      user: buildUserPayload(user),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching user profile', 500);
  }
};

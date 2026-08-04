import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching user' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, role, active, station } = req.body;
    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role as UserRole,
      active: active !== undefined ? active : true,
      station,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating user' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, active } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (role) user.role = role as UserRole;
    if (typeof active === 'boolean') user.active = active;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting user' });
  }
};

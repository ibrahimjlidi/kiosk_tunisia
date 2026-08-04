import { Request, Response } from 'express';
import { Team } from '../models/Team';
import { normalizeApiError } from '../helpers/errorResponse';

export const getAllTeams = async (_req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find().populate('station', 'name code').populate('leader', 'firstName lastName role').populate('members', 'firstName lastName role').sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: teams.length, teams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load teams.') });
  }
};

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, station, leader, members, active } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Team name is required.' });
      return;
    }

    const team = await Team.create({
      name,
      station,
      leader,
      members: members || [],
      active: active !== undefined ? active : true,
    });

    res.status(201).json({ success: true, message: 'Team created successfully', team });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create team.') });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found.' });
      return;
    }

    const { name, station, leader, members, active } = req.body;
    if (name) team.name = name;
    if (station) team.station = station;
    if (leader) team.leader = leader;
    if (members) team.members = members;
    if (typeof active === 'boolean') team.active = active;

    await team.save();
    res.status(200).json({ success: true, message: 'Team updated successfully', team });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to update team.') });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to delete team.') });
  }
};

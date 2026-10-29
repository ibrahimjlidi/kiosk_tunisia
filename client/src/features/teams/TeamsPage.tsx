import React, { useEffect, useState } from 'react';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../../services/teamApi';
import { fetchAllUsers } from '../../services/authApi';
import { fetchStations } from '../../services/stationApi';
import { useAuth } from '../../context/AuthContext';
import { Station } from '../../types/station';
import { User } from '../../types/auth';
import axios from 'axios';

interface TeamMember {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface TeamRecord {
  _id: string;
  name: string;
  active: boolean;
  leader?: TeamMember;
  members?: TeamMember[];
}

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const canManageTeams = user?.permissions?.includes('users.manage') ?? false;
  const canDeleteTeams = user?.role === 'ADMIN' && canManageTeams;
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', station: '', leader: '', members: [] as string[] });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [teamsRes, stationsRes, usersRes] = await Promise.all([
        fetchTeams(),
        fetchStations(),
        canManageTeams ? fetchAllUsers() : Promise.resolve(null),
      ]);
      setTeams(teamsRes.teams || []);
      setStations(stationsRes.stations.filter((station) => station.active));
      setUsers(usersRes?.users.filter((teamUser) => teamUser.active) || []);
    } catch (error) {
      console.error(error);
      setLoadError('Unable to load team data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [canManageTeams]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setSaving(true);
    try {
      const res = await createTeam(form);
      if (res.success) {
        setForm({ name: '', station: '', leader: '', members: [] });
        await load();
      } else {
        setCreateError(res.message || 'Unable to create team.');
      }
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setCreateError(message || 'Unable to create team. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openMemberEditor = (team: TeamRecord) => {
    setEditingTeamId(team._id);
    setSelectedMemberIds(
      (team.members || [])
        .map((member) => member._id || member.id)
        .filter((memberId): memberId is string => Boolean(memberId))
    );
    setMemberError(null);
  };

  const handleSaveMembers = async (teamId: string) => {
    setSavingMembers(true);
    setMemberError(null);
    try {
      const response = await updateTeam(teamId, { members: selectedMemberIds });
      if (!response.success) {
        setMemberError(response.message || 'Unable to save team members.');
        return;
      }
      setEditingTeamId(null);
      await load();
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setMemberError(message || 'Unable to save team members. Please try again.');
    } finally {
      setSavingMembers(false);
    }
  };

  const handleTeamAction = async (action: () => Promise<{ success: boolean; message?: string }>) => {
    setActionError(null);
    try {
      const response = await action();
      if (!response.success) {
        setActionError(response.message || 'Unable to update the team.');
        return;
      }
      await load();
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setActionError(message || 'Unable to update the team. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Teams</h2>
        <p className="text-sm text-muted">Operational teams and staffing view across stations.</p>
      </div>

      {canManageTeams && (
        <form onSubmit={handleCreate} className="glass-panel space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="sr-only" htmlFor="team-name">Team name</label>
            <input
              id="team-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Team name"
              required
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted"
            />
            <label className="sr-only" htmlFor="team-station">Station</label>
            <select
              id="team-station"
              value={form.station}
              onChange={(event) => setForm({ ...form, station: event.target.value })}
              required
              disabled={stations.length === 0}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" disabled>Select station</option>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>{station.name} ({station.code})</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="team-leader">Team leader</label>
            <select
              id="team-leader"
              value={form.leader}
              onChange={(event) => setForm({ ...form, leader: event.target.value })}
              required
              disabled={users.length === 0}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" disabled>Select team leader</option>
              {users.map((teamUser) => (
                <option key={teamUser.id} value={teamUser.id}>
                  {teamUser.firstName} {teamUser.lastName} ({teamUser.role})
                </option>
              ))}
            </select>
            <button type="submit" disabled={saving || stations.length === 0 || users.length === 0} className="button-primary rounded-control px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Team'}
            </button>
          </div>
          {createError && <p role="alert" className="text-sm text-danger">{createError}</p>}
        </form>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Team roster</div>
        {actionError && <p role="alert" className="px-4 pt-3 text-sm text-danger">{actionError}</p>}
        <div className="divide-y divide-divider text-sm text-foreground">
          {loading ? <div className="px-4 py-4 text-muted">Loading...</div> : loadError ? <div role="alert" className="px-4 py-4 text-danger">{loadError}</div> : teams.map((team) => (
            <div key={team._id} className="px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-foreground">{team.name}</div>
                  <div className="text-xs text-muted">Leader: {team.leader?.firstName || '-'} {team.leader?.lastName || ''}</div>
                  {team.members?.length ? (
                    <div className="mt-1 text-xs text-muted">
                      Members: {team.members.map((member) => `${member.firstName} ${member.lastName}`).join(', ')}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-accent">{team.members?.length || 0} members</span>
                  {canManageTeams && (
                    <button
                      type="button"
                      aria-expanded={editingTeamId === team._id}
                      aria-controls={`team-members-${team._id}`}
                      onClick={() => editingTeamId === team._id ? setEditingTeamId(null) : openMemberEditor(team)}
                      className="rounded-control border border-border px-2 py-1 text-xs text-foreground hover:bg-background"
                    >
                      {editingTeamId === team._id ? 'Close members' : 'Manage members'}
                    </button>
                  )}
                  {canManageTeams && (
                    <button type="button" onClick={() => handleTeamAction(() => updateTeam(team._id, { active: !team.active }))} className="rounded-control bg-secondary px-2 py-1 text-xs text-inverse">Toggle</button>
                  )}
                  {canDeleteTeams && (
                    <button type="button" onClick={() => handleTeamAction(() => deleteTeam(team._id))} className="rounded-control bg-danger/10 px-2 py-1 text-xs text-danger">Delete</button>
                  )}
                </div>
              </div>
              {canManageTeams && editingTeamId === team._id && (
                <section id={`team-members-${team._id}`} aria-label="Team member selection" className="mt-4 rounded-control border border-border bg-background p-3">
                  <p className="mb-3 text-sm font-medium text-foreground">Select team members</p>
                  {users.length === 0 ? (
                    <p className="text-sm text-muted">No active users available.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {users.map((teamUser) => (
                        <label key={teamUser.id} className="flex cursor-pointer items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedMemberIds.includes(teamUser.id)}
                            onChange={(event) => setSelectedMemberIds((current) => event.target.checked
                              ? [...current, teamUser.id]
                              : current.filter((memberId) => memberId !== teamUser.id))}
                            className="accent-accent"
                          />
                          <span>{teamUser.firstName} {teamUser.lastName} <span className="text-muted">({teamUser.role})</span></span>
                        </label>
                      ))}
                    </div>
                  )}
                  {memberError && <p role="alert" className="mt-3 text-sm text-danger">{memberError}</p>}
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingTeamId(null)} disabled={savingMembers} className="rounded-control border border-border px-3 py-2 text-sm text-foreground disabled:opacity-60">Cancel</button>
                    <button type="button" onClick={() => handleSaveMembers(team._id)} disabled={savingMembers || users.length === 0} className="button-primary rounded-control px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
                      {savingMembers ? 'Saving...' : 'Save members'}
                    </button>
                  </div>
                </section>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

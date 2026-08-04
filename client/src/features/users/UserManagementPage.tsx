import React, { useEffect, useState } from 'react';
import { fetchAllUsers, createUser, updateUserRoleAndStatus } from '../../services/authApi';
import { User, UserRole } from '../../types/auth';
import { Users, UserPlus, Shield, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllUsers();
      setUsers(res.users);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      await createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        role,
        active: true,
      });
      setShowAddModal(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('OPERATOR');
      loadUsers();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUserRoleAndStatus(user.id, { active: !user.active });
      loadUsers();
    } catch (err: any) {
      alert('Error updating user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRoleAndStatus(userId, { role: newRole });
      loadUsers();
    } catch (err: any) {
      alert('Error updating user role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-cyan-400" />
            User Management & RBAC Roles
          </h2>
          <p className="text-xs text-slate-400">Control system access, roles (Admin, Manager, Supervisor, Operator), and accounts</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm flex justify-center items-center">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
            Loading user registry...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role (RBAC)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{u.firstName} {u.lastName}</div>
                      <div className="text-[11px] text-slate-500">{u.email} (@{u.username})</div>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-900 border border-slate-800 rounded text-slate-200 px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="SUPERVISOR">SUPERVISOR</option>
                        <option value="OPERATOR">OPERATOR</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {u.active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" /> Suspended
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                          u.active
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
              Provision Station Operator / Manager
            </h3>

            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="MANAGER">MANAGER (Station Manager)</option>
                  <option value="SUPERVISOR">SUPERVISOR (Shift Supervisor)</option>
                  <option value="OPERATOR">OPERATOR (Pump Operator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 disabled:opacity-50"
                >
                  {createLoading ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

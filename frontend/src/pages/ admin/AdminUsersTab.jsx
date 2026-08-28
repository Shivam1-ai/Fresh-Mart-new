import { Users } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { updateUserRole, updateUserStatus } from '../../api/adminApi.js';
import { Panel } from '../../components/AdminUI.jsx';

const roles = ['user', 'vendor', 'admin'];

const AdminUsersTab = () => {
  const { users, refresh } = useOutletContext();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const handleRoleChange = async (userId, role) => {
    setBusyId(userId);
    setError('');
    try {
      await updateUserRole(userId, { role });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    setBusyId(userId);
    setError('');
    try {
      await updateUserStatus(userId, { isActive: !isActive });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      <Panel title={`Users (${users.length})`} icon={<Users />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-50">
                  <td className="py-3 pr-3 font-semibold">{user.name}</td>
                  <td className="py-3 pr-3 text-slate-500">{user.email}</td>
                  <td className="py-3 pr-3">
                    <select
                      value={user.role}
                      disabled={busyId === user._id}
                      onChange={(event) => handleRoleChange(user._id, event.target.value)}
                      className="rounded-md border border-slate-200 px-2 py-1 outline-none focus:border-leaf"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.isActive === false ? 'bg-red-50 text-red-700' : 'bg-limewash text-leaf'}`}>
                      {user.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      disabled={busyId === user._id}
                      onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                      className="rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {user.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default AdminUsersTab;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineBan,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.put(`/admin/block-user/${userId}`, { isBlocked: !isBlocked });
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch {
      toast.error('Action failed');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">User Management</h1>
        <p className="section-subtitle">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field py-2.5 text-sm sm:w-40"
          >
            <option value="">All Roles</option>
            <option value="user">Customers</option>
            <option value="shopowner">Shop Owners</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineUserGroup className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">No users found</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="badge-blue text-xs capitalize">
                        {user.role === 'shopowner' ? 'Shop Owner' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.phone || '—'}</td>
                    <td className="px-6 py-4">
                      {user.isBlocked ? (
                        <span className="badge-red text-xs">Blocked</span>
                      ) : (
                        <span className="badge-green text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleBlock(user._id, user.isBlocked)}
                          className={`btn-sm text-xs gap-1 ${
                            user.isBlocked
                              ? 'btn-primary'
                              : 'btn-danger'
                          }`}
                        >
                          {user.isBlocked ? (
                            <><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Unblock</>
                          ) : (
                            <><HiOutlineBan className="w-3.5 h-3.5" /> Block</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

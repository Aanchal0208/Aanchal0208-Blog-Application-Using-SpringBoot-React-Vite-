import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      const filteredUsers = (res.data.content || res.data).filter(u => u.role !== 'ROLE_ADMIN');
    setUsers(filteredUsers);
    setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN') {
      window.location.href = '/dashboard';
      return;
    }
    fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This will also delete all their posts and comments.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess('User deleted successfully.');
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete user.');
    }
  };

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="admin-users-compact">
        {/* Header */}
        <div className="admin-header-compact">
          <div>
            <h5 className="fw-bold text-dark mb-0">👥 Users</h5>
            <small className="text-muted">Manage registered users</small>
          </div>
          <span className="badge bg-primary">{users.length} total</span>
        </div>

        {error && <div className="alert alert-danger py-1 small">{error}</div>}
        {success && <div className="alert alert-success py-1 small">{success}</div>}

        {/* Table */}
        <div className="table-card-compact">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted">No users found.</div>
          ) : (
            <div className="table-wrapper-compact">
              <table className="table table-compact">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Joined</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell-compact">
                          <span className="avatar-xs bg-primary">
                            {u.fullName?.charAt(0) || u.username?.charAt(0) || 'U'}
                          </span>
                          <div>
                            <div className="fw-semibold">{u.fullName}</div>
                            <small className="text-muted">@{u.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
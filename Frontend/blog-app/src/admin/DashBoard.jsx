import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalCategories: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchStats();
    fetchActivities();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/admin/dashboard/recent-activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-compact">
      {/* Header */}
      <div className="admin-header-compact">
        <div>
          <h5 className="fw-bold text-dark mb-0">🛡️ Admin</h5>
          <small className="text-muted">Welcome back, {user.fullName}</small>
        </div>
        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-compact">
        <div className="stat-card-compact">
          <div className="stat-icon-compact">📊</div>
          <div className="stat-content">
            <span className="stat-value-compact">{stats.totalPosts.toLocaleString()}</span>
            <span className="stat-label-compact">Posts</span>
          </div>
        </div>
        <div className="stat-card-compact">
          <div className="stat-icon-compact">👥</div>
          <div className="stat-content">
            <span className="stat-value-compact">{stats.totalUsers.toLocaleString()}</span>
            <span className="stat-label-compact">Users</span>
          </div>
        </div>
        <div className="stat-card-compact">
          <div className="stat-icon-compact">💬</div>
          <div className="stat-content">
            <span className="stat-value-compact">{stats.totalComments.toLocaleString()}</span>
            <span className="stat-label-compact">Comments</span>
          </div>
        </div>
        <div className="stat-card-compact">
          <div className="stat-icon-compact">🏷️</div>
          <div className="stat-content">
            <span className="stat-value-compact">{stats.totalCategories.toLocaleString()}</span>
            <span className="stat-label-compact">Categories</span>
          </div>
        </div>
      </div>

      {/* Charts Row – still static (can be replaced with real chart data later) */}
      <div className="charts-row-compact">
        <div className="chart-card-compact">
          <div className="chart-header-compact">
            <span className="chart-title-compact">Bar Chart</span>
            <span className="chart-badge-compact">+55%</span>
          </div>
          <div className="bar-chart-compact">
            <div className="bar-compact" style={{ height: '28px' }}></div>
            <div className="bar-compact" style={{ height: '50px' }}></div>
            <div className="bar-compact" style={{ height: '38px' }}></div>
            <div className="bar-compact" style={{ height: '65px' }}></div>
            <div className="bar-compact" style={{ height: '45px' }}></div>
            <div className="bar-compact" style={{ height: '55px' }}></div>
            <div className="bar-compact" style={{ height: '30px' }}></div>
          </div>
          <div className="chart-labels-compact">
            <span>M</span><span>T</span><span>W</span><span>T</span>
            <span>F</span><span>S</span><span>S</span>
          </div>
        </div>
        <div className="chart-card-compact">
          <div className="chart-header-compact">
            <span className="chart-title-compact">Line Chart</span>
            <span className="chart-badge-compact">+3%</span>
          </div>
          <div className="line-chart-compact">
            <div className="line-compact" style={{ height: '42px' }}></div>
            <div className="line-compact" style={{ height: '58px' }}></div>
            <div className="line-compact" style={{ height: '35px' }}></div>
            <div className="line-compact" style={{ height: '70px' }}></div>
            <div className="line-compact" style={{ height: '50px' }}></div>
            <div className="line-compact" style={{ height: '62px' }}></div>
            <div className="line-compact" style={{ height: '40px' }}></div>
            <div className="line-compact" style={{ height: '55px' }}></div>
            <div className="line-compact" style={{ height: '48px' }}></div>
          </div>
          <div className="chart-labels-compact">
            <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table – Real Data */}
      <div className="table-card-compact">
        <div className="table-header-compact">
          <span className="table-title-compact">Recent Activity</span>
          <span className="badge bg-success">Live</span>
        </div>
        <div className="table-wrapper-compact">
          {activities.length === 0 ? (
            <div className="text-center py-3 text-muted">No recent activity</div>
          ) : (
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Post</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="user-cell-compact">
                        <span className="avatar-xs bg-primary">
                          {act.user.charAt(0)}
                        </span>
                        {act.user}
                      </div>
                    </td>
                    <td>{act.action}</td>
                    <td>“{act.target}”</td>
                    <td>{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
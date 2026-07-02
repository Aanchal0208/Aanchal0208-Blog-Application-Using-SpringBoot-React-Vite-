import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import '../styles/UserDashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [user, navigate]);

const fetchStats = async () => {
  try {
    const res = await api.get('/auth/stats');
    setStats(res.data);
  } catch (err) {
    console.error('Stats error:', err);
    const msg = err.response?.data?.message || err.response?.data || 'Failed to load dashboard data.';
    setError(msg);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="user-dashboard-wrapper">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div>
            <h1 className="welcome-title">
              Welcome back, <span className="user-name">{user.fullName || 'User'}</span> 👋
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your blog today.
            </p>
          </div>
          <div className="welcome-actions">
            <Link to="/create-post" className="btn btn-primary rounded-pill px-4">
              📝 Create New Post
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalPosts}</span>
              <span className="stat-label">Total Posts</span>
            </div>
            <span className="stat-change positive">Published</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalViews}</span>
              <span className="stat-label">Total Views</span>
            </div>
            <span className="stat-change positive">All time</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalLikes}</span>
              <span className="stat-label">Total Likes</span>
            </div>
            <span className="stat-change neutral">Received</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalComments}</span>
              <span className="stat-label">Comments</span>
            </div>
            <span className="stat-change positive">On your posts</span>
          </div>
        </div>

        {/* Charts Row (static – can be replaced with Chart.js) */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h6 className="chart-title">Weekly Views</h6>
              <span className="chart-badge">+15%</span>
            </div>
            <div className="bar-chart">
              <div className="bar" style={{ height: '30px' }}></div>
              <div className="bar" style={{ height: '55px' }}></div>
              <div className="bar" style={{ height: '40px' }}></div>
              <div className="bar" style={{ height: '70px' }}></div>
              <div className="bar" style={{ height: '50px' }}></div>
              <div className="bar" style={{ height: '85px' }}></div>
              <div className="bar" style={{ height: '60px' }}></div>
            </div>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
              <span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h6 className="chart-title">Engagement</h6>
              <span className="chart-badge">+8%</span>
            </div>
            <div className="line-chart">
              <div className="line" style={{ height: '40px' }}></div>
              <div className="line" style={{ height: '65px' }}></div>
              <div className="line" style={{ height: '50px' }}></div>
              <div className="line" style={{ height: '80px' }}></div>
              <div className="line" style={{ height: '60px' }}></div>
              <div className="line" style={{ height: '75px' }}></div>
              <div className="line" style={{ height: '55px' }}></div>
            </div>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
              <span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="activity-table">
          <div className="table-header">
            <h6 className="table-title">Recent Activity</h6>
            <span className="badge bg-success">Live</span>
          </div>
          <div className="table-wrapper">
            {stats.recentActivities.length === 0 ? (
              <div className="p-3 text-center text-muted">No recent activity</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Post</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivities.map((act, idx) => (
                    <tr key={idx}>
                      <td>{act.type}</td>
                      <td>
                        <Link to={`/post/${act.postId}`} className="text-primary">
                          {act.title}
                        </Link>
                      </td>
                      <td>{act.timeAgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
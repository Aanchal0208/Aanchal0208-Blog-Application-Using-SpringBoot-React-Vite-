import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const adminNavItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Admin Dashboard' },
    { path: '/admin/categories', icon: '🏷️', label: 'Categories' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/admin-posts', icon: '📚', label: 'All Posts' },
  ];

  const userNavItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/create-post', icon: '✍️', label: 'Create Blog' },
    { path: '/all-blogs', icon: '📚', label: 'All Blogs' },
    { path: '/my-blogs', icon: '📝', label: 'My Blogs' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <h4 className="sidebar-brand-text">
          My<span>Blog</span>Mark
        </h4>
        {isAdmin && <span className="badge bg-warning admin-badge">ADMIN</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">{isAdmin ? 'Admin Panel' : 'Navigation'}</div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar-small">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          {isOpen && (
            <div className="user-info">
              <div className="user-name">{user?.fullName || 'User'}</div>
              <div className="user-role">{isAdmin ? 'Admin' : 'User'}</div>
            </div>
          )}
        </div>
        {/* Logout button */}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
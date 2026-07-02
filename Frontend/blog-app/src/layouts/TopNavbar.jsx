import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://localhost:8080';

const TopNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfileImage = () => {
    if (!user?.profileImage) return null;

    if (
      user.profileImage.startsWith('http://') ||
      user.profileImage.startsWith('https://')
    ) {
      return user.profileImage;
    }

    return `${BACKEND_URL}${user.profileImage}`;
  };

  const profileImage = getProfileImage();

  return (
    <nav className="top-navbar">
      {/* Left Side */}
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰
        </button>

        <h4 className="mb-0">Dashboard</h4>
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        <Link to="/" className="nav-link-btn">
          🏠 Home
        </Link>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>

        {/* Profile Image */}
        <div
          className="user-avatar"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #2563eb"
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "18px"
              }}
            >
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
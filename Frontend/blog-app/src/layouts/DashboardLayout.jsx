import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/Dashboard.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`main-content`}>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
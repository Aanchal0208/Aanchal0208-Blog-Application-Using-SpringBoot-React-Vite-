import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Dashboard from "./pages/Dashboard";
import MyBlogs from './pages/MyBlogs';
import AllBlogs from './pages/AllBlogs';
import EditPost from './pages/EditPost';
import ViewPost from './pages/ViewPost';

// Admin Pages
import AdminDashboard from "./admin/Dashboard";
import Categories from './admin/Category';
import Users from './admin/Users';
import AdminPosts from './admin/AdminPosts';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ===== PUBLIC ROUTES (with MainLayout) ===== */}
          <Route path="/" element={<Home />} />

          {/* ===== AUTH ROUTES (NO LAYOUT - standalone full page) ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ===== PROTECTED USER ROUTES (with DashboardLayout) ===== */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout><Profile /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/create-post" element={
            <ProtectedRoute>
              <DashboardLayout><CreatePost /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/my-blogs" element={
            <ProtectedRoute>
              <MyBlogs />
            </ProtectedRoute>
          } />
          <Route path="/all-blogs" element={<DashboardLayout><AllBlogs /></DashboardLayout>} />

          <Route path="/edit-post/:id" element={
            <ProtectedRoute>
              <DashboardLayout><EditPost /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/post/:id" element={
            <ProtectedRoute>
              <DashboardLayout><ViewPost /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
  <ProtectedRoute>
    <Users />
  </ProtectedRoute>
} />
<Route path="/admin/admin-posts" element={
  <ProtectedRoute>
    <AdminPosts />
  </ProtectedRoute>
} />

          {/* ===== 404 ===== */}
          <Route path="*" element={
              <div className="text-center py-5">
                <h1 className="display-1 text-muted">404</h1>
                <p className="lead">Page not found</p>
                <a href="/" className="btn btn-primary rounded-pill px-4">Go Home</a>
              </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
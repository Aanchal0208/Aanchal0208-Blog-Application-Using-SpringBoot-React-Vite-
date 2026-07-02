import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory
        ? `/admin/posts?categoryId=${selectedCategory}`
        : '/admin/posts';
      const res = await api.get(url);
      if (res.data && res.data.content) {
        setPosts(res.data.content);
      } else if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN') {
      window.location.href = '/dashboard';
      return;
    }
    fetchCategories();
    fetchPosts();
  }, [user, selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post? This will also delete all its comments.')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/posts/${id}`);
      setSuccess('Post deleted successfully.');
      fetchPosts();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="admin-posts-compact">
        <div className="admin-header-compact">
          <div>
            <h5 className="fw-bold text-dark mb-0">📚 All Posts</h5>
            <small className="text-muted">Manage all blog posts from all users</small>
          </div>
          <span className="badge bg-primary">{posts.length} total</span>
        </div>

        <div className="filter-card-compact">
          <div className="filter-row-compact">
            <label className="filter-label">Filter by Category:</label>
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {selectedCategory && (
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                onClick={() => setSelectedCategory('')}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger py-1 small">{error}</div>}
        {success && <div className="alert alert-success py-1 small">{success}</div>}

        <div className="table-card-compact">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-4 text-muted">No posts found.</div>
          ) : (
            <div className="table-wrapper-compact">
              <table className="table table-compact">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ maxWidth: '150px', wordBreak: 'break-word' }}>
                        <span className="fw-semibold">{p.title}</span>
                      </td>
                      <td>
                        <div className="user-cell-compact">
                          <span className="avatar-xs bg-primary">
                            {p.author?.fullName?.charAt(0) || p.author?.username?.charAt(0) || 'U'}
                          </span>
                          <span>{p.author?.fullName || p.author?.username}</span>
                        </div>
                      </td>
                      <td>{p.category?.name || '—'}</td>
                      <td>
                        <span className={`badge ${p.status === 'PUBLISHED' ? 'bg-success' : p.status === 'DRAFT' ? 'bg-warning' : 'bg-secondary'}`}>
                          {p.status || 'PUBLISHED'}
                        </span>
                      </td>
                      <td>{p.viewCount || 0}</td>
                      <td>{p.likeCount || 0}</td>
                      <td>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-GB", {
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

export default AdminPosts;
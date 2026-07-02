import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import '../styles/MyBlogs.css';

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `http://localhost:8080${path}`;
  return `http://localhost:8080/${path}`;
};

const MyBlogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserPosts();
  }, [user, page, navigate]);

  const fetchUserPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/posts/user/${user.id}?page=${page}&size=9`);
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError('Failed to load posts.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete handler with token fallback
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;

    setDeleting(postId);
    setError('');

    try {
      // Ensure token is sent (interceptor should do it, but we'll be safe)
      const token = localStorage.getItem('token');
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from UI
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      // Refresh to update pagination
      await fetchUserPosts();
    } catch (err) {
      console.error('Delete error:', err);
      let msg = 'Failed to delete post.';
      if (err.response?.status === 403) {
        msg = 'You are not the author of this post.';
      } else if (err.response?.status === 404) {
        msg = 'Post not found.';
      } else if (err.response?.status === 401) {
        msg = 'Session expired. Please login again.';
        navigate('/login');
      } else if (err.response?.data) {
        msg = err.response.data;
      }
      setError(`❌ ${msg}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="myblogs-loading">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="myblogs-wrapper">
        <div className="myblogs-header">
          <div>
            <h2 className="myblogs-title">📝 My Blogs</h2>
            <p className="myblogs-subtitle">Manage your published posts</p>
          </div>
          <Link to="/create-post" className="create-post-btn">
            ✍️ Create New Post
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No posts yet</h3>
            <p>You haven't written any posts. Start your first one now!</p>
            <Link to="/create-post" className="create-first-btn">✍️ Write First Post</Link>
          </div>
        ) : (
          <div className="myblogs-grid">
            {posts.map((post) => {
              // Parse images
              let rawUrls = post.imageUrls || '';
              if (typeof rawUrls === 'string') {
                rawUrls = rawUrls.split(',').filter((url) => url.trim() !== '');
              }
              const imageUrls = Array.isArray(rawUrls)
                ? rawUrls.map((url) => getImageUrl(url.trim()))
                : [];
              const firstImage = imageUrls.length > 0 ? imageUrls[0] : null;

              return (
                <div key={post.id} className="blog-card">
                  <div className="blog-card-image">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={post.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="no-image-placeholder">📷</div>
                    )}
                    {imageUrls.length > 1 && (
                      <span className="image-count-badge">+{imageUrls.length - 1}</span>
                    )}
                  </div>

                  <div className="blog-card-body">
                    <div className="blog-card-header">
                      <h3 className="blog-card-title">{post.title}</h3>
                      <span
                        className={`status-badge ${
                          post.status === 'PUBLISHED' ? 'published' : 'draft'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <p className="blog-card-excerpt">
                      {post.content?.substring(0, 120)}
                      {post.content?.length > 120 && '...'}
                    </p>

                    <div className="blog-card-meta">
                      <span>📅 {formatDate(post.createdAt)}</span>
                      <span>👁️ {post.viewCount || 0}</span>
                      <span>❤️ {post.likeCount || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>

                    <div className="blog-card-actions">
                      <Link to={`/post/${post.id}`} className="action-btn view">
                        👁️ View
                      </Link>
                      <Link to={`/edit-post/${post.id}`} className="action-btn edit">
                        ✏️ Edit
                      </Link>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                      >
                        {deleting === post.id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          '🗑️ Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              className={`page-btn ${page === 0 ? 'disabled' : ''}`}
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              ← Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i ? 'active' : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={`page-btn ${page === totalPages - 1 ? 'disabled' : ''}`}
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages - 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBlogs;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import axios from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ----------------- Helpers -----------------
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

// ----------------- Comment Component -----------------
const CommentItem = ({ comment, onReply, currentUser }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/comments/${comment.id}/replies`, { content: replyContent });
      setReplyContent('');
      setShowReplyForm(false);
      onReply();
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-3" style={{ borderLeft: '2px solid #dee2e6', paddingLeft: '16px' }}>
      <div className="d-flex align-items-start gap-2">
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0, background: '#2563eb', color: 'white' }}>
          {comment.user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-grow-1">
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <strong>{comment.user?.fullName}</strong>
            <small className="text-muted">@{comment.user?.username}</small>
            <small className="text-muted">{formatDate(comment.createdAt)}</small>
          </div>
          <p className="mb-1">{comment.content}</p>
          {currentUser && (
            <button className="btn btn-link btn-sm p-0 text-muted" onClick={() => setShowReplyForm(!showReplyForm)}>
              {showReplyForm ? 'Cancel' : '💬 Reply'}
            </button>
          )}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-1">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={submitting}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? '...' : 'Reply'}
                </button>
              </div>
            </form>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------- Main AdminViewPost -----------------
const AdminViewPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // ✅ Use publicApi for reading posts and comments
        const res = await publicApi.get(`/posts/${id}`);
        setPost(res.data);
        const commentRes = await publicApi.get(`/posts/${id}/comments`);
        setComments(commentRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post.');
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like.');
      return;
    }
    try {
      await api.post(`/posts/${id}/like`);
      const res = await publicApi.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment.');
      return;
    }
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: comment });
      setComment('');
      const res = await publicApi.get(`/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const refreshComments = async () => {
    try {
      const res = await publicApi.get(`/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Refresh comments error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      navigate('/admin/posts');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-5">
        <h4 className="text-danger">{error || 'Post not found'}</h4>
        <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">🏠 Back to Home</Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthor = user?.id === post.author?.id;
  const canEditOrDelete = isAdmin || isAuthor;

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* LEFT SIDEBAR */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
            <div className="text-center">
              <div
                className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {post.author?.fullName?.charAt(0) || 'U'}
              </div>
              <h5 className="fw-bold mt-3">{post.author?.fullName || 'Unknown'}</h5>
              <p className="text-muted small">@{post.author?.username || 'user'}</p>
              <p className="small text-muted">
                I'm {post.author?.fullName || 'a blogger'}, an aspiring blogger with an obsession for all things tech.
                This blog is dedicated to helping people learn about technology.
              </p>
            </div>
            <hr />
            <div className="text-center">
              <h6 className="fw-bold mb-2">FOLLOW ME</h6>
              <p className="text-muted small">Follow me to join me on my social networks.</p>
              <div className="d-flex gap-2 justify-content-center">
                <a href="#" className="text-decoration-none text-primary">🐦</a>
                <a href="#" className="text-decoration-none text-primary">📷</a>
                <a href="#" className="text-decoration-none text-primary">📘</a>
                <a href="#" className="text-decoration-none text-primary">🎥</a>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h1 className="display-6 fw-bold mb-3">{post.title}</h1>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', background: '#2563eb', color: 'white', fontWeight: 'bold' }}
              >
                {post.author?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="fw-bold">{post.author?.fullName}</div>
                <div className="text-muted small d-flex gap-2">
                  <span>@{post.author?.username}</span>
                  <span>·</span>
                  <span>{formatDate(post.createdAt)}</span>
                  {post.category && <span>· 📂 {post.category.name}</span>}
                </div>
              </div>
            </div>

            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="row g-2 mb-4">
                {post.imageUrls.map((url, idx) => (
                  <div key={idx} className="col-md-4">
                    <img
                      src={getImageUrl(url)}
                      alt={`image-${idx}`}
                      className="img-fluid rounded-3"
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x180?text=Image'; }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem' }}>
              {post.content}
            </div>

            <div className="d-flex flex-wrap gap-3 align-items-center mt-4 pt-3 border-top">
              <button
                className={`btn ${post.likedByCurrentUser ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                onClick={handleLike}
              >
                {post.likedByCurrentUser ? '❤️' : '🤍'} {post.likeCount || 0}
              </button>
              <span className="text-muted small">👁️ {post.viewCount || 0} views</span>

              {canEditOrDelete && (
                <>
                  <Link to={`/edit-post/${post.id}`} className="btn btn-outline-primary rounded-pill px-4">
                    ✏️ Edit
                  </Link>
                  <button className="btn btn-outline-danger rounded-pill px-4" onClick={handleDelete}>
                    🗑️ Delete
                  </button>
                </>
              )}
              <Link to="/" className="text-decoration-none">📖 CONTINUE READING</Link>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
            <h4 className="fw-bold mb-3">💬 Comments ({comments.length})</h4>

            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-4">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submittingComment}
                  />
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={submittingComment}>
                    {submittingComment ? '...' : 'Post'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-muted">Please <Link to="/login">login</Link> to comment.</p>
            )}

            {comments.length === 0 ? (
              <p className="text-muted">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  onReply={refreshComments}
                  currentUser={user}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewPost;
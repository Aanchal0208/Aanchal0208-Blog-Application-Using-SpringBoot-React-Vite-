import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Helper: Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// Helper: Get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `http://localhost:8080${path}`;
  return `http://localhost:8080/${path}`;
};

// ---------- Comment Component (Recursive) ----------
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
      onReply(); // refresh parent
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-2" style={{ borderLeft: '2px solid #dee2e6', paddingLeft: '12px' }}>
      <div className="d-flex align-items-start gap-2">
        <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
          {comment.user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-grow-1">
          <div className="d-flex gap-2 align-items-center">
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
          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Post Card Component ----------
const PostCard = ({ post, currentUser, onLike, onCommentAdded }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please login to like posts.');
      return;
    }
    try {
      await api.post(`/posts/${post.id}/like`);
      onLike(post.id); // refresh parent
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingComments(true);
    try {
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data);
      setShowComments(true);
    } catch (err) {
      console.error('Load comments error:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please login to comment.');
      return;
    }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/posts/${post.id}/comments`, { content: newComment });
      setNewComment('');
      // Refresh comments
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data);
      onCommentAdded(post.id);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const refreshComments = async () => {
    try {
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Refresh comments error:', err);
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
      {/* Images carousel (if multiple) */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
          <div className="d-flex overflow-auto h-100">
            {post.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={getImageUrl(url)}
                alt={`Post image ${idx+1}`}
                className="flex-shrink-0"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="card-body">
        {/* Header: Author + Date */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
            {post.author?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <strong className="d-block">{post.author?.fullName}</strong>
            <small className="text-muted">@{post.author?.username} · {formatDate(post.createdAt)}</small>
          </div>
        </div>

        {/* Title & Content preview */}
        <h5 className="card-title fw-bold">{post.title}</h5>
        <p className="card-text text-muted">
          {post.content?.substring(0, 180)}
          {post.content?.length > 180 && '...'}
        </p>

        {/* Category & Stats */}
        <div className="d-flex gap-2 flex-wrap mb-2">
          {post.category && <span className="badge bg-light text-dark">{post.category.name}</span>}
          <span className="badge bg-light text-dark">👁️ {post.viewCount || 0}</span>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 align-items-center">
          <button
            className={`btn ${post.likedByCurrentUser ? 'btn-danger' : 'btn-outline-danger'} btn-sm rounded-pill px-3`}
            onClick={handleLike}
          >
            {post.likedByCurrentUser ? '❤️' : '🤍'} {post.likeCount || 0}
          </button>
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={loadComments}
          >
            💬 {comments.length} {loadingComments && <span className="spinner-border spinner-border-sm ms-1"></span>}
          </button>
          <Link to={`/post/${post.id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3">
            📖 Read More
          </Link>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 border-top pt-3">
            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="mb-3">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment}>
                    {submittingComment ? '...' : 'Post'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-muted small">Please <Link to="/login">login</Link> to comment.</p>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-muted small">No comments yet.</p>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={refreshComments}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Main Home Component ----------
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?page=${page}&size=9`);
      setPosts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleLike = (postId) => {
    // Refresh the post list to update like count and state
    fetchPosts();
  };

  const handleCommentAdded = (postId) => {
    // Just refresh to update comment count if needed
    fetchPosts();
  };

  if (loading) {
    return (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
    );
  }

  return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">📚 Latest Blogs</h2>
          {user && (
            <Link to="/create-post" className="btn btn-primary rounded-pill px-4">
              ✍️ Create Post
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No posts yet. Be the first to write!</h4>
          </div>
        ) : (
          <div className="row g-4">
            {posts.map(post => (
              <div key={post.id} className="col-md-4">
                <PostCard
                  post={post}
                  currentUser={user}
                  onLike={handleLike}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
  );
};

export default Home;
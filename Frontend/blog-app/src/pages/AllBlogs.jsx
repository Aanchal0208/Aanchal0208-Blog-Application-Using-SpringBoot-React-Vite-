import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AllBlogs.css';

const BACKEND_URL = 'http://localhost:8080';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${BACKEND_URL}${path}`;
  return `${BACKEND_URL}/${path}`;
};

// ---------- Comment Component ----------
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
    <div className="comment-item">
      <div className="comment-avatar">{comment.user?.fullName?.charAt(0) || 'U'}</div>
      <div className="comment-body">
        <div className="comment-header">
          <strong>{comment.user?.fullName}</strong>
          <span>@{comment.user?.username}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        {currentUser && (
          <button className="comment-reply-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
            {showReplyForm ? 'Cancel' : '💬 Reply'}
          </button>
        )}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="reply-form">
            <input
              type="text"
              className="reply-input"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" className="reply-submit" disabled={submitting}>
              {submitting ? '...' : 'Reply'}
            </button>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies-list">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Post Card ----------
const PostCard = ({ post, currentUser, onLike, onCommentAdded }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');

  // ✅ Build image URLs
  // ✅ Handle both string and array formats
let rawUrls = post.imageUrls || '';
if (typeof rawUrls === 'string') {
  // If it's a comma-separated string, split it
  rawUrls = rawUrls.split(',').filter(url => url.trim() !== '');
}
// If it's already an array, use it as is
const imageUrls = Array.isArray(rawUrls) 
  ? rawUrls.map((url) => getImageUrl(url.trim())) 
  : [];
  
const firstImage = imageUrls.length > 0 ? imageUrls[0] : null;

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please login to like posts.');
      return;
    }
    try {
      await api.post(`/posts/${post.id}/like`);
      onLike(post.id);
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
    setCommentError('');
    try {
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data);
      setShowComments(true);
    } catch (err) {
      console.error('Load comments error:', err);
      setCommentError('Failed to load comments.');
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
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    setSubmittingComment(true);
    setCommentError('');
    try {
      await api.post(`/posts/${post.id}/comments`, { content: newComment.trim() });
      setNewComment('');
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data);
      onCommentAdded(post.id);
    } catch (err) {
      console.error('Comment error:', err);
      setCommentError('Failed to post comment.');
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
    <div className="blog-card">
      {/* ✅ Image Section */}
      <div className="blog-card-image">
    {firstImage ? (
      <img src={firstImage} alt={post.title} />
    ) : (
      <div className="no-image-placeholder">📷</div>
    )}
    {imageUrls.length > 1 && (
      <span className="image-count-badge">+{imageUrls.length - 1}</span>
    )}
  </div>

      <div className="blog-card-body">
        {/* Author */}
        <div className="blog-card-author">
          <div className="author-avatar">{post.author?.fullName?.charAt(0) || 'U'}</div>
          <div className="author-info">
            <span className="author-name">{post.author?.fullName}</span>
            <span className="author-username">@{post.author?.username}</span>
          </div>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>

        {/* Title & Content */}
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">
          {post.content?.substring(0, 140)}
          {post.content?.length > 140 && '...'}
        </p>

        {/* Meta */}
        <div className="blog-card-meta">
          {post.category && <span className="category-tag">{post.category.name}</span>}
          <span className="view-count">👁️ {post.viewCount || 0}</span>
        </div>

        {/* Actions */}
        <div className="blog-card-actions">
          <button
            className={`like-btn ${post.likedByCurrentUser ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {post.likedByCurrentUser ? '❤️' : '🤍'} {post.likeCount || 0}
          </button>
          <button className="comment-toggle-btn" onClick={loadComments}>
            💬 {comments.length} {loadingComments && <span className="spinner-sm"></span>}
          </button>
          <Link to={`/post/${post.id}`} className="read-more-btn">
            Read More →
          </Link>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="comments-section">
            {commentError && <div className="comment-error">{commentError}</div>}

            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                />
                <button type="submit" className="comment-submit" disabled={submittingComment}>
                  {submittingComment ? '...' : 'Post'}
                </button>
              </form>
            ) : (
              <p className="login-prompt">Please <Link to="/login">login</Link> to comment.</p>
            )}

            {comments.length === 0 ? (
              <p className="no-comments">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
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

// ---------- Main AllBlogs ----------
const AllBlogs = () => {
  const { user } = useAuth();
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

  const handleLike = () => fetchPosts();
  const handleCommentAdded = () => fetchPosts();

  if (loading) {
    return (
        <div className="allblogs-loading">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
    );
  }

  return (
      <div className="allblogs-wrapper">
        <div className="allblogs-header">
          <div>
            <h1 className="allblogs-title">📚 All Blogs</h1>
            <p className="allblogs-subtitle">Discover amazing stories from the community</p>
          </div>
          {user && (
            <Link to="/create-post" className="create-post-btn">
              ✍️ Create Post
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No posts yet</h3>
            <p>Be the first to share your story with the community.</p>
            {user && (
              <Link to="/create-post" className="create-first-btn">
                ✍️ Write First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="allblogs-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onCommentAdded={handleCommentAdded}
              />
            ))}
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
  );
};

export default AllBlogs;
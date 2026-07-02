import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import '../styles/EditPost.css'; // optional – we'll provide styles

const BACKEND_URL = 'http://localhost:8080';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${BACKEND_URL}${path}`;
  return `${BACKEND_URL}/${path}`;
};

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // URLs
  const [newImages, setNewImages] = useState([]); // File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post and categories concurrently
        const [postRes, catRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get('/categories'),
        ]);

        const post = postRes.data;
        setTitle(post.title || '');
        setContent(post.content || '');
        setCategoryId(post.category?.id?.toString() || '');
        // Handle existing images – could be array or comma-separated string
        let rawImages = post.imageUrls || [];
        if (typeof rawImages === 'string') {
          rawImages = rawImages.split(',').filter((url) => url.trim() !== '');
        }
        setExistingImages(Array.isArray(rawImages) ? rawImages : []);

        setCategories(catRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (existingImages.length + newImages.length + files.length > 5) {
      setError('You can have a maximum of 5 images total.');
      return;
    }
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Only image files are allowed.');
      return;
    }
    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setNewImages((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    setError('');
  };

  const removeNewImage = (index) => {
    const newImagesCopy = [...newImages];
    const newPreviewsCopy = [...newImagePreviews];
    newImagesCopy.splice(index, 1);
    newPreviewsCopy.splice(index, 1);
    setNewImages(newImagesCopy);
    setNewImagePreviews(newPreviewsCopy);
  };

  const removeExistingImage = (index) => {
    if (!window.confirm('Remove this image?')) return;
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let allImageUrls = [...existingImages];

      // Upload new images if any
      if (newImages.length > 0) {
        setUploading(true);
        const formData = new FormData();
        newImages.forEach((file) => formData.append('images', file));
        const uploadRes = await api.post('/posts/upload-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadedUrls = uploadRes.data.imageUrls || [];
        allImageUrls = [...allImageUrls, ...uploadedUrls];
        setUploading(false);
      }

      // Update the post
      await api.put(`/posts/${id}`, {
        title,
        content,
        categoryId: categoryId ? Number(categoryId) : null,
        imageUrls: allImageUrls,
        status: 'PUBLISHED',
      });

      setSuccess('Post updated successfully! 🎉');
      setTimeout(() => navigate('/my-blogs'), 2000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
        <div className="editpost-loading">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
    );
  }

  return (
      <div className="editpost-wrapper">
        <div className="editpost-card">
          <div className="editpost-header">
            <h2 className="editpost-title">✏️ Edit Post</h2>
            <p className="editpost-subtitle">Update your blog post</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="editpost-form">
            <div className="form-group">
              <label className="form-label">Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content <span className="text-danger">*</span></label>
              <textarea
                className="form-control"
                rows="12"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="form-group">
                <label className="form-label">Current Images</label>
                <div className="image-preview-grid">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="image-preview-item">
                      <img src={getImageUrl(url)} alt={`existing-${idx}`} />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeExistingImage(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <small className="text-muted">Click ✕ on an image to remove it.</small>
              </div>
            )}

            {/* Add New Images */}
            <div className="form-group image-upload-group">
              <label className="form-label">Add New Images (up to 5 total)</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  className="image-upload-input"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={uploading || submitting}
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="image-upload-label">
                  <span className="upload-icon">🖼️</span>
                  <span className="upload-text">Click or drag to upload images</span>
                  <span className="upload-hint">JPG, PNG, GIF (max 2MB each)</span>
                </label>
              </div>
              {newImagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {newImagePreviews.map((src, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={src} alt={`new-${index}`} />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeNewImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg rounded-pill px-5 py-3"
                disabled={submitting || uploading}
              >
                {submitting || uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {uploading ? 'Uploading images...' : 'Updating...'}
                  </>
                ) : (
                  '💾 Update Post'
                )}
              </button>
              <Link to="/my-blogs" className="btn btn-outline-secondary rounded-pill px-4 py-3">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
  );
};

export default EditPost;
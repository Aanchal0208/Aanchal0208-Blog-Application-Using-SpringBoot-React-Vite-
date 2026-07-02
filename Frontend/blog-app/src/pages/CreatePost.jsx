import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import '../styles/CreatePost.css'; // optional – we'll include styles below

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0].id.toString());
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Only image files are allowed.');
      return;
    }
    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setImages(validFiles);
    setImagePreviews(previews);
    setError('');
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
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
      let imageUrls = [];
      if (images.length > 0) {
        setUploading(true);
        const formData = new FormData();
        images.forEach((file) => formData.append('images', file));
        const uploadRes = await api.post('/posts/upload-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = uploadRes.data.imageUrls;
        setUploading(false);
      }

      await api.post('/posts', {
        title,
        content,
        categoryId: categoryId || null,
        imageUrls,
        status: 'PUBLISHED',
      });

      setSuccess('Post published successfully! 🎉');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
      <div className="create-post-wrapper">
        <div className="create-post-card">
          <div className="create-post-header">
            <h2 className="create-post-title">✍️ Create New Post</h2>
            <p className="create-post-subtitle">Share your story with the world</p>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <span className="me-2">❌</span> {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <span className="me-2">✅</span> {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label className="form-label">Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an eye‑catching title"
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
                placeholder="Write your blog content here..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select form-select-lg"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              <small className="text-muted">The first category is selected by default.</small>
            </div>

            <div className="form-group image-upload-group">
              <label className="form-label">Images (up to 5)</label>
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
              {imagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={src} alt={`preview-${index}`} />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeImage(index)}
                        disabled={uploading || submitting}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-pill px-5 py-3"
              disabled={submitting || uploading}
            >
              {submitting || uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {uploading ? 'Uploading images...' : 'Publishing...'}
                </>
              ) : (
                '📝 Publish Post'
              )}
            </button>
          </form>
        </div>
      </div>
  );
};

export default CreatePost;
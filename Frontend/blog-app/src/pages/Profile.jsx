import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BACKEND_URL = 'http://localhost:8080';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  return `${BACKEND_URL}/${imagePath}`;
};

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  // Load user data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFullName(user.fullName || '');
    setBio(user.bio || '');
    setProfileImage(user.profileImage || null);
    setImagePreview(getImageUrl(user.profileImage));
  }, [user, navigate]);

  // Refresh profile from backend
  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const freshUser = response.data;
      const updatedUser = { ...user, ...freshUser };
      login(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setFullName(freshUser.fullName || '');
      setBio(freshUser.bio || '');
      setProfileImage(freshUser.profileImage || null);
      setImagePreview(getImageUrl(freshUser.profileImage));
      return freshUser;
    } catch (error) {
      console.error('Refresh error:', error);
      return null;
    }
  };
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert("Please upload an image file.");
    setErrorMessage('Please upload an image file.');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image size must be less than 2MB.");
    setErrorMessage('Image size must be less than 2MB.');
    return;
  }

  // Show local preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result);
  };
  reader.readAsDataURL(file);

  setUploadingImage(true);
  setErrorMessage('');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("Upload Response:", response.data);

    await refreshProfile();

    // ✅ Success Alert
    alert("✅ Profile picture uploaded successfully!");

    setSuccessMessage('Profile picture updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);

  } catch (error) {
    console.error('Image upload error:', error);

    // ❌ Error Alert
    alert(error.response?.data?.error || "Failed to upload profile image.");

    setErrorMessage(error.response?.data?.error || 'Failed to upload image.');
    setImagePreview(getImageUrl(user?.profileImage));

  } finally {
    setUploadingImage(false);
  }
};

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.put('/auth/profile', { fullName, bio });
      const updatedUser = { ...user, ...response.data };
      login(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setErrorMessage(error.response?.data || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFullName(user.fullName || '');
    setBio(user.bio || '');
    setProfileImage(user.profileImage || null);
    setImagePreview(getImageUrl(user.profileImage));
    setErrorMessage('');
  };

  const handleImageClick = () => fileInputRef.current?.click();
  const handleViewImage = () => {
    if (imagePreview || profileImage) {
      setShowImageModal(true);
    } else {
      setErrorMessage('No image to view.');
    }
  };
  const handleCloseModal = () => setShowImageModal(false);

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  const imageSrc = imagePreview || getImageUrl(profileImage) || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=2563eb&color=fff&size=128`;
  const hasImage = !!(imagePreview || profileImage);

  console.log('🖼️ Final imageSrc:', imageSrc);

  return (
    <div className="container py-4">
      {/* Image Modal */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <img
              src={imageSrc}
              alt="Profile"
              style={{
                width: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=2563eb&color=fff&size=128`;
              }}
            />
            <p style={{ textAlign: 'center', marginTop: '12px', color: '#4a5a6e' }}>
              {user.fullName}'s Profile Picture
            </p>
          </div>
        </div>
      )}

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="row">
        <div className="col-md-4">
          <div className="card p-4">
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '3px solid #e8ecf1',
                  margin: '0 auto',
                }}
                onClick={handleImageClick}
              >
                {uploadingImage ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Uploading...</span></div>
                  </div>
                ) : (
                  <img
                    src={imageSrc}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.log('❌ Image failed to load:', e.target.src);
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=2563eb&color=fff&size=128`;
                    }}
                  />
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', padding: '4px', fontSize: '0.7rem' }}>
                  📷 Change
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
              <p className="text-muted small mt-2">Click avatar to upload (JPG, PNG up to 2MB)</p>
              <div className="d-flex gap-2 justify-content-center">
                {hasImage && <button className="btn btn-outline-primary btn-sm" onClick={handleViewImage}>👁️ View Image</button>}
                <button className="btn btn-outline-secondary btn-sm" onClick={refreshProfile}>🔄 Refresh</button>
              </div>
            </div>
            <hr />
            <div>
              <p><strong>Username:</strong> @{user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> <span className={`badge ${user.role === 'ROLE_ADMIN' ? 'bg-warning' : 'bg-primary'}`}>{user.role}</span></p>
              <p><strong>Member Since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>{isEditing ? '✏️ Edit Profile' : '📋 Profile Information'}</h4>
              {!isEditing && <button className="btn btn-primary" onClick={() => setIsEditing(true)}>✏️ Edit</button>}
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea className="form-control" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : '💾 Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="py-2 border-bottom"><small className="text-muted text-uppercase">Full Name</small><div className="fs-5">{fullName || 'Not set'}</div></div>
                <div className="py-2"><small className="text-muted text-uppercase">Bio</small><div>{bio || 'No bio yet'}</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
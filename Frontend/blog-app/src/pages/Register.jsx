import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return false;
    }
    if (!agree) {
      setError('Please agree to the Terms & Conditions.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        bio: '', // optional
        role: 'ROLE_USER',
      });

      setSuccess('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand">
          <h1>My<span>Blog</span>Mark</h1>
          <p>Start your journey – create your account.</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {success && <div className="alert alert-success py-2 small">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="mb-3 mt-2">
            <label className="form-label fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text">📧</span>
              <input
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text">🔒</span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Confirm</label>
              <div className="input-group">
                <span className="input-group-text">✓</span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-check mt-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              disabled={loading}
              required
            />
            <label className="form-check-label" htmlFor="agree">
              I agree to the <Link to="/terms" className="link">Terms & Conditions</Link>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="auth-divider">or</div>

          <p className="text-center text-secondary small">
            Already have an account? <Link to="/login" className="link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
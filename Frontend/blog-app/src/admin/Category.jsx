import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories.');
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
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/categories', {
        name: name.trim(),
        description: description.trim() || null,
      });
      setName('');
      setDescription('');
      setSuccess('Category added successfully!');
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      if (err.response?.status === 403) {
        setError('You are not authorized to add categories.');
      } else {
        setError(err.response?.data?.message || 'Failed to add category.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/categories/${id}`);
      setSuccess('Category deleted successfully.');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      if (err.response?.status === 403) {
        setError('You are not authorized to delete categories.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete category.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="admin-categories-compact">
        {/* Header */}
        <div className="admin-header-compact">
          <div>
            <h5 className="fw-bold text-dark mb-0">🏷️ Categories</h5>
            <small className="text-muted">Manage blog categories</small>
          </div>
          <span className="badge bg-primary">{categories.length} total</span>
        </div>

        {error && <div className="alert alert-danger py-1 small">{error}</div>}
        {success && <div className="alert alert-success py-1 small">{success}</div>}

        {/* Add Category Form - Compact */}
        <div className="form-card-compact">
          <form onSubmit={handleSubmit} className="form-inline-compact">
            <div className="form-row-compact">
              <div className="form-group-compact">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Category name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <div className="form-group-compact">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-pill px-3"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories Table - Compact */}
        <div className="table-card-compact">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-muted">No categories yet.</div>
          ) : (
            <div className="table-wrapper-compact">
              <table className="table table-compact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{cat.name}</td>
                      <td>{cat.description || '—'}</td>
                      <td>
                        {cat.createdAt
                          ? new Date(cat.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-2"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {deletingId === cat.id ? '...' : 'Delete'}
                        </button>
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

export default Categories;
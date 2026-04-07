import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailNotifications: true,
    preferredAirports: [],
    preferredDestinations: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        emailNotifications: user.emailNotifications !== false,
        preferredAirports: user.preferredAirports || [],
        preferredDestinations: user.preferredDestinations || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleArrayChange = (field, value) => {
    const values = value.split(',').map((v) => v.trim().toUpperCase()).filter((v) => v);
    setFormData({ ...formData, [field]: values });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

        <div className="card">
          <div style={{ padding: '1rem', background: 'var(--light-gray)', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>Account Information</h3>
            <p><strong>Membership Tier:</strong> {user?.membershipTier === 'premium' ? '⭐ Premium' : '🆓 Free'}</p>
            <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                />
                <span>Receive email notifications for new deals</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Departure Airports</label>
              <input
                type="text"
                value={formData.preferredAirports.join(', ')}
                onChange={(e) => handleArrayChange('preferredAirports', e.target.value)}
                className="form-input"
                placeholder="DEL, BOM, BLR (comma separated)"
              />
              <small style={{ color: 'var(--dark-gray)' }}>
                Enter airport codes separated by commas (e.g., DEL, BOM, BLR)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Destinations</label>
              <input
                type="text"
                value={formData.preferredDestinations.join(', ')}
                onChange={(e) => handleArrayChange('preferredDestinations', e.target.value)}
                className="form-input"
                placeholder="DXB, SIN, LHR (comma separated)"
              />
              <small style={{ color: 'var(--dark-gray)' }}>
                Enter destination airport codes separated by commas
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

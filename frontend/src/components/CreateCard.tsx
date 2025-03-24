import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CardForm.css';

interface CardFormData {
  card_username: string;
  display_name: string;
  bio?: string;
  card_email?: string;
  display_address?: string;
  theme_color_1?: string;
  theme_color_2?: string;
  theme_color_3?: string;
}

const CreateCard: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CardFormData>({
    card_username: '',
    display_name: '',
    bio: '',
    card_email: '',
    display_address: '',
    theme_color_1: '#4a90e2',
    theme_color_2: '#ffffff',
    theme_color_3: '#333333'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate username (alphanumeric and hyphens only)
      const usernameRegex = /^[a-zA-Z0-9-]+$/;
      if (!usernameRegex.test(formData.card_username)) {
        throw new Error('Username can only contain letters, numbers, and hyphens');
      }

      await axios.post('/api/cards', formData);
      setLoading(false);
      navigate('/');
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to create card');
    }
  };

  return (
    <div className="card-form-container">
      <div className="card-form-header">
        <h1>Create New Card</h1>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card-form">
        <div className="form-group">
          <label htmlFor="card_username">Username (URL)*</label>
          <input
            type="text"
            id="card_username"
            name="card_username"
            value={formData.card_username}
            onChange={handleChange}
            required
            placeholder="e.g. john-doe"
          />
          <small>This will be used in your card URL. Use only letters, numbers, and hyphens.</small>
        </div>

        <div className="form-group">
          <label htmlFor="display_name">Display Name*</label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            required
            placeholder="e.g. John Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself or your business"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="card_email">Email</label>
          <input
            type="email"
            id="card_email"
            name="card_email"
            value={formData.card_email}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="display_address">Address</label>
          <input
            type="text"
            id="display_address"
            name="display_address"
            value={formData.display_address}
            onChange={handleChange}
            placeholder="e.g. 123 Main St, City, Country"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="theme_color_1">Primary Color</label>
            <input
              type="color"
              id="theme_color_1"
              name="theme_color_1"
              value={formData.theme_color_1}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="theme_color_2">Secondary Color</label>
            <input
              type="color"
              id="theme_color_2"
              name="theme_color_2"
              value={formData.theme_color_2}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="theme_color_3">Text Color</label>
            <input
              type="color"
              id="theme_color_3"
              name="theme_color_3"
              value={formData.theme_color_3}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCard;


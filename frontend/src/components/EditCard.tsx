import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CardForm.css';

interface CardFormData {
  id?: string;
  card_username: string;
  display_name: string;
  bio?: string;
  card_email?: string;
  display_address?: string;
  theme_color_1?: string;
  theme_color_2?: string;
  theme_color_3?: string;
}

const EditCard: React.FC = () => {
  const { username } = useParams<{ username: string }>();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await axios.get(`/api/cards/username/${username}`);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching card data:", err);
        setError("Failed to load card data. Please try again later.");
        setLoading(false);
      }
    };

    fetchCardData();
  }, [username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await axios.put(`/api/cards/${formData.id}`, formData);
      setSaving(false);
      navigate('/');
    } catch (err: any) {
      setSaving(false);
      setError(err.response?.data?.error || "Failed to update card");
    }
  };

  if (loading) {
    return <div className="loading">Loading card data...</div>;
  }

  return (
    <div className="card-form-container">
      <div className="card-form-header">
        <h1>Edit Card: {formData.card_username}</h1>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card-form">
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
          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCard;


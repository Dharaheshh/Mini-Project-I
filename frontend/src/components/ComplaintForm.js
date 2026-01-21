import React, { useState } from 'react';
import { complaintsAPI } from '../services/api';

const ComplaintForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    image: null,
    location: '',
    note: '',
    category: 'Other',
    priority: 'Medium',
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');
  const [mlPredictions, setMlPredictions] = useState(null);
  const [useMLPredictions, setUseMLPredictions] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, image: file });
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
        setMlPredictions(null); // Reset predictions when new image is selected
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setUseMLPredictions(false); // User is manually changing, don't use ML predictions
    }
    setError('');
  };

  const handleGetPredictions = async () => {
    if (!formData.image) {
      setError('Please select an image first');
      return;
    }

    setPredicting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('image', formData.image);
      if (formData.note) {
        data.append('note', formData.note);
      }

      const response = await complaintsAPI.predict(data);
      setMlPredictions(response.data);
      
      // Auto-apply predictions
      setFormData({
        ...formData,
        category: response.data.category || formData.category,
        priority: response.data.priority || formData.priority,
      });
      setUseMLPredictions(true);
    } catch (err) {
      setError('Failed to get AI predictions. You can still submit manually.');
      console.error('Prediction error:', err);
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('image', formData.image);
      data.append('location', formData.location);
      data.append('note', formData.note);
      data.append('category', formData.category);
      data.append('priority', formData.priority);

      await complaintsAPI.create(data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Submit New Complaint</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Damage Image *</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded" />
              <button
                type="button"
                onClick={handleGetPredictions}
                disabled={predicting}
                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 text-sm"
              >
                {predicting ? '🤖 Analyzing...' : '🤖 Get AI Predictions'}
              </button>
            </div>
          )}
        </div>

        {mlPredictions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">🤖 AI Predictions</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Category:</span>{' '}
                <span className="text-blue-600">{mlPredictions.category}</span>
              </div>
              <div>
                <span className="font-medium">Priority:</span>{' '}
                <span className="text-blue-600">{mlPredictions.priority}</span>
              </div>
              {mlPredictions.severity && (
                <div>
                  <span className="font-medium">Severity:</span>{' '}
                  <span className="text-blue-600">{mlPredictions.severity}</span>
                </div>
              )}
              {mlPredictions.description && (
                <div className="col-span-2">
                  <span className="font-medium">Suggested Description:</span>{' '}
                  <span className="text-blue-600 italic">{mlPredictions.description}</span>
                </div>
              )}
            </div>
            {useMLPredictions && (
              <p className="text-xs text-blue-600 mt-2">
                ✓ Predictions applied to form. You can modify if needed.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Room 101, Building A"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Chair">Chair</option>
            <option value="Bench">Bench</option>
            <option value="Projector">Projector</option>
            <option value="Socket">Socket</option>
            <option value="Pipe">Pipe</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Additional Notes</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the damage..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;


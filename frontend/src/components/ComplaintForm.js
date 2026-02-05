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

      // Artificial delay for "effect" if response is too fast
      await new Promise(resolve => setTimeout(resolve, 1500));

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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="bg-primary-500 text-white p-2 rounded-lg mr-3 shadow-md">❌</span>
        Submit New Complaint
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors">
          <label className="block text-gray-700 text-sm font-bold mb-3">Damage Image *</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              transition-all"
          />

          {preview && (
            <div className="mt-4 relative group rounded-lg overflow-hidden shadow-md max-w-md mx-auto">
              {/* Scan Overlay */}
              {predicting && (
                <div className="absolute inset-0 bg-primary-500/20 z-10 border-2 border-primary-500">
                  <div className="w-full h-1 bg-primary-400 absolute top-0 shadow-[0_0_15px_#38bdf8] animate-scan"></div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded animate-pulse">
                    Scanning...
                  </div>
                </div>
              )}

              <img src={preview} alt="Preview" className="w-full h-64 object-cover" />

              {!predicting && !mlPredictions && (
                <div className="absolute bottom-4 right-4">
                  <button
                    type="button"
                    onClick={handleGetPredictions}
                    className="bg-secondary-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-secondary-700 hover:shadow-xl transition-all flex items-center font-medium transform hover:-translate-y-1"
                  >
                    <span className="mr-2">✨</span> Analyze with AI
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Results Section */}
        {mlPredictions && (
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 rounded-xl p-5 animate-slide-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center">
                <span className="text-xl mr-2">🤖</span> AI Analysis Report
              </h3>
              {useMLPredictions && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">
                  ✓ Applied to form
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="block text-gray-400 text-xs mb-1">DETECTED OBJECT</span>
                <span className="text-lg font-bold text-gray-800">{mlPredictions.category}</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="block text-gray-400 text-xs mb-1">SUGGESTED PRIORITY</span>
                <span className={`text-lg font-bold ${mlPredictions.priority === 'High' ? 'text-red-600' :
                    mlPredictions.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {mlPredictions.priority}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="block text-gray-400 text-xs mb-1">SEVERITY SCORE</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-xs text-right block mt-1 text-blue-600 font-medium">Moderate</span>
              </div>

              {mlPredictions.duplicate?.is_duplicate && (
                <div className="bg-red-50 p-3 rounded-lg shadow-sm border border-red-100">
                  <span className="block text-red-400 text-xs mb-1">DUPLICATE ALERT</span>
                  <span className="text-red-700 font-bold text-xs">
                    Similar to report #{mlPredictions.duplicate.similar_complaint_id}
                  </span>
                </div>
              )}
            </div>

            {mlPredictions.description && (
              <div className="mt-3 bg-white p-3 rounded-lg shadow-sm border-l-4 border-secondary-500">
                <span className="block text-gray-400 text-xs mb-1">GENERATED DESCRIPTION</span>
                <p className="text-gray-600 italic">"{mlPredictions.description}"</p>
              </div>
            )}
          </div>
        )}

        {/* Standard Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Room 101, Building A"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            >
              <option value="Chair">Chair</option>
              <option value="Bench">Bench</option>
              <option value="Projector">Projector</option>
              <option value="Socket">Socket</option>
              <option value="Pipe">Pipe</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Priority</label>
          <div className="flex space-x-4">
            {['Low', 'Medium', 'High'].map((p) => (
              <label key={p} className={`
                    flex-1 cursor-pointer rounded-lg border p-3 text-center transition-all
                    ${formData.priority === p
                  ? (p === 'High' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' :
                    p === 'Medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 ring-1 ring-yellow-500' :
                      'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500')
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }
                  `}>
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={formData.priority === p}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-semibold">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Additional Notes</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the damage..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-primary-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Complaint'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;


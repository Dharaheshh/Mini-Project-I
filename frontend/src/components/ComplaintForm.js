import React, { useState, useEffect } from 'react';
import { complaintsAPI, blocksAPI } from '../services/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import DragDropUpload from './ui/DragDropUpload';
import { Loader2, CheckCircle2, AlertTriangle, MapPin, FileText, X, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ComplaintForm = ({ onSuccess, onCancel }) => {
  const [blocks, setBlocks] = useState([]);
  const [formData, setFormData] = useState({
    image: null,
    location: '',
    classroom: '',
    note: '',
    category: 'Other',
    priority: 'Medium',
  });

  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [mlPredictions, setMlPredictions] = useState(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await blocksAPI.getAll();
        setBlocks(response.data);
      } catch (error) {
        console.error('Failed to fetch blocks:', error);
      }
    };
    fetchBlocks();
  }, []);

  const handleFileSelect = async (file) => {
    setFormData({ ...formData, image: file });
    // Auto-predict
    await handleGetPredictions(file);
  };

  const handleGetPredictions = async (file) => {
    setPredicting(true);
    setMlPredictions(null);

    try {
      const data = new FormData();
      data.append('image', file);

      const response = await complaintsAPI.predict(data);
      // Small artificial delay for visual effect
      await new Promise(r => setTimeout(r, 800));

      setMlPredictions(response.data);
      setFormData(prev => ({
        ...prev,
        category: response.data.category,
        priority: response.data.priority,
        note: prev.note || response.data.description // Auto-fill note if empty
      }));
      toast.success("AI Analysis Complete!");
    } catch (err) {
      console.error('Prediction error:', err);
      toast.error("AI Analysis failed, proceeding manually.");
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('image', formData.image);
      data.append('location', formData.location);
      if (formData.classroom) data.append('classroom', formData.classroom);
      data.append('note', formData.note);
      data.append('category', formData.category);
      data.append('priority', formData.priority);

      await complaintsAPI.create(data);
      toast.success("Complaint submitted successfully!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl border-0 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">New Report</h2>
          <p className="text-slate-500 text-sm">Submit a facility issue for quick resolution.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Evidence Photo</label>
          <DragDropUpload
            selectedFile={formData.image}
            onFileSelect={handleFileSelect}
            onClear={() => {
              setFormData({ ...formData, image: null });
              setMlPredictions(null);
            }}
          />
        </div>

        {/* AI Status / Results */}
        {predicting && (
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Loader2 className="animate-spin text-primary-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-primary-900">Analyzing Image...</p>
              <p className="text-xs text-primary-600">Detecting object, severity, and urgency.</p>
            </div>
          </div>
        )}

        {!predicting && mlPredictions && (
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-indigo-900">AI Assessment</h3>
              <Badge variant="success" className="ml-auto">Active</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 p-3 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-slate-500 uppercase font-semibold">Category</p>
                <p className="text-lg font-bold text-slate-800">{mlPredictions.category}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-slate-500 uppercase font-semibold">Priority</p>
                <p className={`text-lg font-bold ${mlPredictions.priority === 'High' ? 'text-red-600' :
                  mlPredictions.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'
                  }`}>
                  {mlPredictions.priority}
                </p>
              </div>
            </div>
            {mlPredictions.duplicate?.is_duplicate && (
              <div className="mt-3 bg-red-100/50 p-2 rounded text-xs font-semibold text-red-700 flex items-center">
                <AlertTriangle size={14} className="mr-2" />
                Possible duplicate detected (Score: {mlPredictions.duplicate.similarity_score.toFixed(2)})
              </div>
            )}
          </div>
        )}

        {/* Manual Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <MapPin size={16} className="mr-1 text-slate-400" />
                Campus Block
              </label>
              <select
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="" disabled>Select a building/block</option>
                {blocks.map((block) => (
                  <option key={block.name} value={block.name}>{block.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Navigation size={16} className="mr-1 text-slate-400" />
                Classroom / Specific Area (Optional)
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Room 304, Near water cooler"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 opacity-50 cursor-not-allowed">
            <label className="text-sm font-semibold text-slate-700 flex items-center">
              <AlertTriangle size={14} className="mr-1 text-amber-500" />
              System Priority
            </label>
            <div className={`w-full h-10 px-3 flex items-center bg-slate-50 rounded-lg border border-slate-200 font-medium ${formData.priority === 'High' ? 'text-red-600' :
              formData.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'
              }`}>
              {formData.priority}
              <span className="text-xs text-slate-400 ml-auto font-normal">Auto-assigned</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center">
            <FileText size={16} className="mr-1 text-slate-400" />
            Description
          </label>
          <textarea
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
            placeholder="Describe the issue..."
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            isLoading={loading}
            disabled={!formData.image || !formData.location}
          >
            Submit Report
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ComplaintForm;


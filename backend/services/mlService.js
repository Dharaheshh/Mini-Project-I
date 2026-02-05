const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

class MLService {
  /**
   * Get all ML predictions for a complaint
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} note - User's note/description
   * @param {Array} existingImageUrls - URLs of existing complaint images for duplicate detection
   * @returns {Promise<Object>} ML predictions
   */
  async getAllPredictions(imageBuffer, note = '', existingImageUrls = []) {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'complaint.jpg',
        contentType: 'image/jpeg',
      });
      if (note) {
        formData.append('note', note);
      }
      if (existingImageUrls.length > 0) {
        formData.append('existing_images', JSON.stringify(existingImageUrls));
      }

      const response = await axios.post(
        `${ML_API_URL}/predict/all`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 120000, // 120 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ ML SERVICE ERROR:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('   No response received from ML Server at', `${ML_API_URL}/predict/all`);
      }

      // Return defaults if ML service is unavailable
      return {
        category: 'Other',
        priority: 'Medium',
        severity: 'Moderate',
        description: note || 'Damage reported',
        duplicate: {
          is_duplicate: false,
          similarity_score: 0,
          similar_complaint_id: null,
        },
      };
    }
  }

  /**
   * Get category prediction only
   */
  async predictCategory(imageBuffer) {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'complaint.jpg',
        contentType: 'image/jpeg',
      });

      const response = await axios.post(
        `${ML_API_URL}/predict/category`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 5000,
        }
      );

      return response.data.category;
    } catch (error) {
      console.error('Category prediction error:', error.message);
      return 'Other';
    }
  }

  /**
   * Get priority prediction only
   */
  async predictPriority(imageBuffer, category, note) {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'complaint.jpg',
        contentType: 'image/jpeg',
      });
      if (category) formData.append('category', category);
      if (note) formData.append('note', note);

      const response = await axios.post(
        `${ML_API_URL}/predict/priority`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 5000,
        }
      );

      return response.data.priority;
    } catch (error) {
      console.error('Priority prediction error:', error.message);
      return 'Medium';
    }
  }

  /**
   * Check for duplicate complaints
   */
  async detectDuplicate(imageBuffer, existingImageUrls) {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'complaint.jpg',
        contentType: 'image/jpeg',
      });
      if (existingImageUrls.length > 0) {
        formData.append('existing_images', JSON.stringify(existingImageUrls));
      }

      const response = await axios.post(
        `${ML_API_URL}/detect/duplicate`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Duplicate detection error:', error.message);
      return {
        is_duplicate: false,
        similarity_score: 0,
        similar_complaint_id: null,
      };
    }
  }
}

module.exports = new MLService();


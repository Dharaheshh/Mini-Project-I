import { create } from 'zustand';
import axios from 'axios';

// API_URL removed (unused)

const authStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  init: () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
}));

// Initialize axios headers on load
authStore.getState().init();

export const useAuthStore = authStore;


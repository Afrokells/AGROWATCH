import axios from 'axios';

// ── Config ──────────────────────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const http = axios.create({ baseURL: BASE_URL });

// Attach token to all requests
http.interceptors.request.use((cfg) => {
  if (cfg.url?.startsWith('/auth/')) {
    delete cfg.headers.Authorization;
    return cfg;
  }

  const stored = localStorage.getItem('agrowatch_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) cfg.headers.Authorization = `Token ${token}`;
    } catch (e) {
      /* ignore */
    }
  }
  return cfg;
});

export default http;

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list: async () => {
    const { data } = await http.get('/users/');
    return data;
  },
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (phone_number, password) => {
    const { data } = await http.post('/auth/login/', { phone_number, password });
    return data; // { token, user }
  },
  register: async (payload) => {
    const drfPayload = {
      username: payload.phone_number,
      phone_number: payload.phone_number,
      full_name: payload.full_name,
      user_role: payload.role || payload.user_role || 'farmer',
      region: payload.region,
      district: payload.district,
      password: payload.password,
    };
    const { data } = await http.post('/auth/register/', drfPayload);
    return data; // { token, user }
  },
  updateProfile: async (userId, payload) => {
    const isFormData = payload instanceof FormData;
    const { data } = await http.patch(`/users/${userId}/`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data;
  },
};

// ── Farms ─────────────────────────────────────────────────────────────────────
export const farmsAPI = {
  list: async (farmerId) => {
    const { data } = await http.get('/farms/');
    if (farmerId && Array.isArray(data)) {
      return data.filter(f => 
        String(f.farmer) === String(farmerId) || 
        String(f.farmer_id) === String(farmerId) ||
        f.farmer === farmerId
      );
    }
    return data;
  },
  create: async (payload) => {
    const { data } = await http.post('/farms/', payload);
    return data;
  },
  get: async (id) => {
    const { data } = await http.get(`/farms/${id}/`);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await http.patch(`/farms/${id}/`, payload);
    return data;
  },
};

// ── Scans ─────────────────────────────────────────────────────────────────────
export const scansAPI = {
  list: async () => {
    const { data } = await http.get('/scans/');
    return data;
  },
  get: async (id) => {
    const { data } = await http.get(`/scans/${id}/`);
    return data;
  },
  create: async (formDataOrPayload) => {
    // Accept both FormData (real upload) and plain objects (simulated)
    const isFormData = formDataOrPayload instanceof FormData;
    const { data } = await http.post('/scans/', formDataOrPayload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data;
  },
};

// ── Market ─────────────────────────────────────────────────────────────────────
export const marketAPI = {
  list: async (filters = {}) => {
    const { data } = await http.get('/market/listings/', { params: filters });
    return data;
  },
  create: async (payload) => {
    const { data } = await http.post('/market/listings/', payload);
    return data;
  },
  enquire: async (listingId, message) => {
    const { data } = await http.post(`/market/listings/${listingId}/enquire/`, { message });
    return data;
  },
};

// ── Expert ─────────────────────────────────────────────────────────────────────
export const expertAPI = {
  listConditions: async () => {
    const { data } = await http.get('/expert/conditions/');
    return data;
  },
  getCondition: async (conditionId) => {
    const { data } = await http.get(`/expert/conditions/${conditionId}/`);
    return data;
  },
};

// ── Messaging ─────────────────────────────────────────────────────────────────
export const messagingAPI = {
  // Threads
  listThreads: async () => {
    const { data } = await http.get('/messages/threads/');
    return data;
  },
  startThread: async (payload) => {
    // payload: { seller, listing (optional), initial_message }
    const { data } = await http.post('/messages/threads/', payload);
    return data;
  },
  getMessages: async (threadId) => {
    const { data } = await http.get(`/messages/threads/${threadId}/messages/`);
    return data;
  },
  reply: async (threadId, body) => {
    const { data } = await http.post(`/messages/threads/${threadId}/reply/`, { body });
    return data;
  },
  // Notifications
  listNotifications: async () => {
    const { data } = await http.get('/messages/notifications/');
    return data;
  },
  markNotifRead: async (id) => {
    const { data } = await http.post(`/messages/notifications/${id}/mark_read/`);
    return data;
  },
  markAllNotifsRead: async () => {
    const { data } = await http.post('/messages/notifications/mark_all_read/');
    return data;
  },
};

import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('maindot_student_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const validationErrors = error.response?.data?.errors || [];
    const detail = validationErrors.map((item) => `${item.field}: ${item.message}`).join(', ');
    const message = detail || error.response?.data?.message || error.message || 'An error occurred';
    if (error.response?.status >= 400) toast.error(message);
    if (error.response?.status === 401) {
      localStorage.removeItem('maindot_student_token');
      localStorage.removeItem('maindot_student_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

// API Endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const studentAPI = {
  getMyProfile: () => api.get('/students/me/profile'),
  updateMyProfile: (id, data) => api.put(`/students/${id}`, data),
};

export const taskAPI = {
  getMyTasks: () => api.get('/tasks/student/my-tasks', { params: { refresh: Date.now() } }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
};

export const submissionAPI = {
  submitTask: (data) => api.post('/submissions', data),
  getMySubmissions: () => api.get('/submissions/student/my-submissions'),
};

export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  getMyAttendance: () => api.get('/attendance/my-attendance'),
};

export const leaveAPI = {
  applyLeave: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
};

export const resultAPI = {
  getMyResults: () => api.get('/results/my-results'),
};

export const certificateAPI = {
  getMyCertificates: () => api.get('/certificates/my-certificates'),
};

export const meetingAPI = {
  getMeetings: () => api.get('/meetings'),
};

export const announcementAPI = {
  getAnnouncements: () => api.get('/announcements'),
};

export const documentAPI = {
  getDocuments: () => api.get('/documents'),
};

export const paymentAPI = {
  createPayment: (data) => api.post('/payments', data),
  getMyPayments: () => api.get('/payments/my-payments'),
};

export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getDirectMessages: (userId) => api.get(`/messages/direct/${userId}`),
  getBatchMessages: (batchId) => api.get(`/messages/batch/${batchId}`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

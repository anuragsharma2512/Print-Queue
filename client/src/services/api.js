import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HttpOnly cookies with all requests
})

export const authApi = {
  login: (pin) => api.post('/auth/login', { pin }),
  logout: () => api.post('/auth/logout'),
  checkSession: () => api.get('/auth/me'),
}

export const jobsApi = {
  createJob: (data) => api.post('/jobs', data),
  getAllJobs: () => api.get('/jobs'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
}

export const queueApi = {
  getQueue: () => api.get('/queue'),
}

export const predictionApi = {
  getEstimate: (data) => api.post('/predictions/estimate', data),
}

export const studentOrdersApi = {
  submitOrder: (formData) =>
    api.post('/student-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  trackOrder: (orderId) => api.get(`/student-orders/track/${orderId}`),
  downloadPdf: (jobId) =>
    api.get(`/student-orders/${jobId}/document`, { responseType: 'blob' }),
}

export default api
